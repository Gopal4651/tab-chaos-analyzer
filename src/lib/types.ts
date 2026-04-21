export interface TabInfo {
  id: number;
  url: string;
  title: string;
  favIconUrl?: string;
  active: boolean;
  windowId: number;
  index: number;
  pinned: boolean;
  lastAccessed?: number;
  audible?: boolean;
  mutedInfo?: chrome.tabs.MutedInfo;
  status?: string;
}

export interface ChaosMetrics {
  totalTabs: number;
  duplicateTabs: number;
  staleTabs: number;
  domainClusters: Record<string, number>;
  panicBursts: number;
  memoryHogTabs: number;
  recentOpenings: number[];
}

export interface ChaosAnalysis {
  score: number;
  level: ChaosLevel;
  metrics: ChaosMetrics;
  issues: ChaosIssue[];
  suggestions: ChaosSuggestion[];
  wittyComment: string;
}

export type ChaosLevel = 
  | 'zen'          // 90-100
  | 'organized'    // 75-89
  | 'controlled'   // 50-74
  | 'hoarder'      // 25-49
  | 'apocalypse';  // 0-24

export interface ChaosIssue {
  type: 'duplicates' | 'stale' | 'clustering' | 'panic' | 'memory' | 'volume';
  severity: 'low' | 'medium' | 'high';
  message: string;
  count: number;
  tabIds?: number[];
}

export interface ChaosSuggestion {
  type: 'close' | 'group' | 'bookmark' | 'reload';
  message: string;
  action: string;
  tabIds: number[];
  priority: 'low' | 'medium' | 'high';
}

export interface StoredTabEvent {
  timestamp: number;
  action: 'opened' | 'closed';
  url: string;
  windowId: number;
}