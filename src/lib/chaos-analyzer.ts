import type { TabInfo, ChaosMetrics, ChaosAnalysis, ChaosLevel, ChaosIssue, ChaosSuggestion, StoredTabEvent } from './types.js';

export class ChaosAnalyzer {
  private static readonly STALE_TAB_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours
  private static readonly PANIC_BURST_WINDOW = 30 * 1000; // 30 seconds
  private static readonly PANIC_BURST_THRESHOLD = 5; // 5+ tabs
  private static readonly DOMAIN_CLUSTER_THRESHOLD = 3; // 3+ tabs from same domain
  // private static readonly MEMORY_HOG_THRESHOLD = 100; // 100MB (estimated) - for future use

  static async analyzeTabs(): Promise<ChaosAnalysis> {
    const tabs = await this.getAllTabs();
    const recentEvents = await this.getRecentTabEvents();
    const metrics = this.calculateMetrics(tabs, recentEvents);
    const score = this.calculateChaosScore(metrics);
    const level = this.getChaosLevel(score);
    const issues = this.identifyIssues(metrics, tabs);
    const suggestions = this.generateSuggestions(issues, tabs);
    const wittyComment = this.getWittyComment(level, metrics);

    return {
      score,
      level,
      metrics,
      issues,
      suggestions,
      wittyComment
    };
  }

  private static async getAllTabs(): Promise<TabInfo[]> {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs.map(tab => ({
          id: tab.id!,
          url: tab.url!,
          title: tab.title!,
          favIconUrl: tab.favIconUrl,
          active: tab.active,
          windowId: tab.windowId,
          index: tab.index,
          pinned: tab.pinned,
          lastAccessed: (tab as any).lastAccessed,
          audible: tab.audible,
          mutedInfo: tab.mutedInfo,
          status: tab.status
        })));
      });
    });
  }

  private static async getRecentTabEvents(): Promise<StoredTabEvent[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tabEvents'], (result) => {
        const events = result.tabEvents || [];
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        resolve(events.filter((event: StoredTabEvent) => event.timestamp > oneHourAgo));
      });
    });
  }

  private static calculateMetrics(tabs: TabInfo[], recentEvents: StoredTabEvent[]): ChaosMetrics {
    const totalTabs = tabs.length;
    
    // Count duplicates
    const urlCounts = new Map<string, number>();
    tabs.forEach(tab => {
      const normalizedUrl = this.normalizeUrl(tab.url);
      urlCounts.set(normalizedUrl, (urlCounts.get(normalizedUrl) || 0) + 1);
    });
    const duplicateTabs = Array.from(urlCounts.values()).reduce((sum, count) => 
      sum + Math.max(0, count - 1), 0
    );

    // Count stale tabs
    const now = Date.now();
    const staleTabs = tabs.filter(tab => 
      tab.lastAccessed && (now - tab.lastAccessed) > this.STALE_TAB_THRESHOLD
    ).length;

    // Domain clustering
    const domainClusters: Record<string, number> = {};
    tabs.forEach(tab => {
      const domain = this.extractDomain(tab.url);
      if (domain) {
        domainClusters[domain] = (domainClusters[domain] || 0) + 1;
      }
    });

    // Panic bursts
    const openEvents = recentEvents.filter(event => event.action === 'opened');
    const panicBursts = this.countPanicBursts(openEvents);

    // Memory hog estimation (simplified)
    const memoryHogTabs = tabs.filter(tab => 
      tab.audible || tab.url.includes('youtube.com') || tab.url.includes('netflix.com')
    ).length;

    // Recent openings for trend analysis
    const recentOpenings = openEvents.map(event => event.timestamp);

    return {
      totalTabs,
      duplicateTabs,
      staleTabs,
      domainClusters,
      panicBursts,
      memoryHogTabs,
      recentOpenings
    };
  }

  private static calculateChaosScore(metrics: ChaosMetrics): number {
    let score = 100; // Start perfect

    // Deductions
    score -= metrics.duplicateTabs * 5;
    score -= metrics.staleTabs * 3;
    score -= metrics.panicBursts * 10;
    score -= metrics.memoryHogTabs * 1;
    score -= Math.max(0, metrics.totalTabs - 10) * 1;

    // Domain clustering penalty
    Object.values(metrics.domainClusters).forEach(count => {
      if (count > this.DOMAIN_CLUSTER_THRESHOLD) {
        score -= (count - this.DOMAIN_CLUSTER_THRESHOLD) * 2;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private static getChaosLevel(score: number): ChaosLevel {
    if (score >= 90) return 'zen';
    if (score >= 75) return 'organized';
    if (score >= 50) return 'controlled';
    if (score >= 25) return 'hoarder';
    return 'apocalypse';
  }

  private static identifyIssues(metrics: ChaosMetrics, _tabs: TabInfo[]): ChaosIssue[] {
    const issues: ChaosIssue[] = [];

    // Duplicates
    if (metrics.duplicateTabs > 0) {
      issues.push({
        type: 'duplicates',
        severity: metrics.duplicateTabs > 5 ? 'high' : 'medium',
        message: `${metrics.duplicateTabs} duplicate tabs are cluttering your browser`,
        count: metrics.duplicateTabs
      });
    }

    // Stale tabs
    if (metrics.staleTabs > 0) {
      issues.push({
        type: 'stale',
        severity: metrics.staleTabs > 10 ? 'high' : 'medium',
        message: `${metrics.staleTabs} tabs haven't been touched in over 2 hours`,
        count: metrics.staleTabs
      });
    }

    // Domain clustering
    const clusteredDomains = Object.entries(metrics.domainClusters)
      .filter(([, count]) => count > this.DOMAIN_CLUSTER_THRESHOLD);
    
    if (clusteredDomains.length > 0) {
      const worstDomain = clusteredDomains.reduce((a, b) => a[1] > b[1] ? a : b);
      issues.push({
        type: 'clustering',
        severity: worstDomain[1] > 10 ? 'high' : 'medium',
        message: `${worstDomain[1]} tabs from ${worstDomain[0]} - might be time to group them`,
        count: worstDomain[1]
      });
    }

    // Panic bursts
    if (metrics.panicBursts > 0) {
      issues.push({
        type: 'panic',
        severity: 'high',
        message: `${metrics.panicBursts} panic-opening episodes detected in the last hour`,
        count: metrics.panicBursts
      });
    }

    // High volume
    if (metrics.totalTabs > 20) {
      issues.push({
        type: 'volume',
        severity: metrics.totalTabs > 50 ? 'high' : 'medium',
        message: `${metrics.totalTabs} total tabs - your browser is working overtime`,
        count: metrics.totalTabs
      });
    }

    return issues;
  }

  private static generateSuggestions(issues: ChaosIssue[], tabs: TabInfo[]): ChaosSuggestion[] {
    const suggestions: ChaosSuggestion[] = [];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'duplicates':
          const duplicateTabIds = this.findDuplicateTabIds(tabs);
          suggestions.push({
            type: 'close',
            message: `Close ${duplicateTabIds.length} duplicate tabs`,
            action: 'Close Duplicates',
            tabIds: duplicateTabIds,
            priority: 'high'
          });
          break;

        case 'stale':
          const staleTabIds = this.findStaleTabIds(tabs);
          suggestions.push({
            type: 'close',
            message: `Archive ${staleTabIds.length} stale tabs to bookmarks`,
            action: 'Archive Stale',
            tabIds: staleTabIds,
            priority: 'medium'
          });
          break;

        case 'clustering':
          const clusteredTabIds = this.findClusteredTabIds(tabs);
          suggestions.push({
            type: 'group',
            message: `Group tabs by domain to reduce visual clutter`,
            action: 'Group by Domain',
            tabIds: clusteredTabIds,
            priority: 'medium'
          });
          break;

        case 'volume':
          const oldestTabIds = this.findOldestTabIds(tabs, 10);
          suggestions.push({
            type: 'bookmark',
            message: `Bookmark and close oldest tabs`,
            action: 'Archive Oldest',
            tabIds: oldestTabIds,
            priority: 'low'
          });
          break;
      }
    });

    return suggestions;
  }

  private static getWittyComment(level: ChaosLevel, metrics: ChaosMetrics): string {
    const comments = {
      zen: [
        "Your tabs are more organized than your sock drawer. Impressive.",
        "Marie Kondo would be proud. Your tabs spark joy.",
        "Tab zen master detected. Teach us your ways.",
        "Either you're incredibly disciplined or you just opened your browser."
      ],
      organized: [
        "Nice work! You've achieved functional human status.",
        "Your tab game is strong, but there's room for improvement.",
        "Organized chaos - the sweet spot of productivity.",
        "You're the type who actually reads the articles you bookmark."
      ],
      controlled: [
        "Controlled chaos detected. You're walking the tightrope of productivity.",
        "Your tabs are like your life - mostly under control with occasional panic.",
        "Not bad! You're still in the 'functional adult' territory.",
        "Your browser is having a mild existential crisis, but it's manageable."
      ],
      hoarder: [
        `${metrics.totalTabs} tabs? That's not browsing, that's collecting.`,
        "Your browser is crying softly. Show some mercy.",
        "I've seen smaller libraries than your tab collection.",
        "Your RAM is filing a formal complaint. Please respond accordingly."
      ],
      apocalypse: [
        "Your browser has entered the upside down. Send help.",
        "This isn't browsing anymore - this is performance art.",
        "Your computer is considering early retirement. I don't blame it.",
        "Scientists are studying your tab situation. For research purposes only."
      ]
    };

    const levelComments = comments[level];
    return levelComments[Math.floor(Math.random() * levelComments.length)];
  }

  // Helper methods
  private static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  private static extractDomain(url: string): string | null {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  private static countPanicBursts(openEvents: StoredTabEvent[]): number {
    let bursts = 0;
    let currentBurst = 0;
    let lastEventTime = 0;

    openEvents.sort((a, b) => a.timestamp - b.timestamp);

    for (const event of openEvents) {
      if (event.timestamp - lastEventTime <= this.PANIC_BURST_WINDOW) {
        currentBurst++;
      } else {
        if (currentBurst >= this.PANIC_BURST_THRESHOLD) {
          bursts++;
        }
        currentBurst = 1;
      }
      lastEventTime = event.timestamp;
    }

    if (currentBurst >= this.PANIC_BURST_THRESHOLD) {
      bursts++;
    }

    return bursts;
  }

  private static findDuplicateTabIds(tabs: TabInfo[]): number[] {
    const urlToTabs = new Map<string, TabInfo[]>();
    
    tabs.forEach(tab => {
      const normalizedUrl = this.normalizeUrl(tab.url);
      if (!urlToTabs.has(normalizedUrl)) {
        urlToTabs.set(normalizedUrl, []);
      }
      urlToTabs.get(normalizedUrl)!.push(tab);
    });

    const duplicateIds: number[] = [];
    urlToTabs.forEach(tabsForUrl => {
      if (tabsForUrl.length > 1) {
        // Keep the most recently accessed, mark others as duplicates
        tabsForUrl.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
        duplicateIds.push(...tabsForUrl.slice(1).map(tab => tab.id));
      }
    });

    return duplicateIds;
  }

  private static findStaleTabIds(tabs: TabInfo[]): number[] {
    const now = Date.now();
    return tabs
      .filter(tab => 
        tab.lastAccessed && 
        (now - tab.lastAccessed) > this.STALE_TAB_THRESHOLD &&
        !tab.active && 
        !tab.pinned
      )
      .map(tab => tab.id);
  }

  private static findClusteredTabIds(tabs: TabInfo[]): number[] {
    const domainToTabs = new Map<string, TabInfo[]>();
    
    tabs.forEach(tab => {
      const domain = this.extractDomain(tab.url);
      if (domain) {
        if (!domainToTabs.has(domain)) {
          domainToTabs.set(domain, []);
        }
        domainToTabs.get(domain)!.push(tab);
      }
    });

    const clusteredIds: number[] = [];
    domainToTabs.forEach(tabsForDomain => {
      if (tabsForDomain.length > this.DOMAIN_CLUSTER_THRESHOLD) {
        clusteredIds.push(...tabsForDomain.map(tab => tab.id));
      }
    });

    return clusteredIds;
  }

  private static findOldestTabIds(tabs: TabInfo[], count: number): number[] {
    return tabs
      .filter(tab => !tab.active && !tab.pinned)
      .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0))
      .slice(0, count)
      .map(tab => tab.id);
  }
}