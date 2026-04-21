// Background script for Tab Chaos Analyzer
interface StoredTabEvent {
  timestamp: number;
  action: 'opened' | 'closed';
  url: string;
  windowId: number;
}

// Event tracking for panic burst detection
class TabEventTracker {
  private static readonly MAX_EVENTS = 100; // Keep last 100 events

  static async trackTabEvent(action: 'opened' | 'closed', tab: chrome.tabs.Tab) {
    if (!tab.url || !tab.windowId) return;

    const event: StoredTabEvent = {
      timestamp: Date.now(),
      action,
      url: tab.url,
      windowId: tab.windowId
    };

    // Get existing events
    const result = await chrome.storage.local.get(['tabEvents']);
    const events: StoredTabEvent[] = result.tabEvents || [];

    // Add new event
    events.push(event);

    // Keep only recent events (last hour + some buffer)
    const oneHourAgo = Date.now() - 2 * 60 * 60 * 1000; // 2 hours for buffer
    const filteredEvents = events
      .filter(e => e.timestamp > oneHourAgo)
      .slice(-this.MAX_EVENTS); // Keep only last N events

    // Store back
    await chrome.storage.local.set({ tabEvents: filteredEvents });
  }

  static async clearOldEvents() {
    const result = await chrome.storage.local.get(['tabEvents']);
    const events: StoredTabEvent[] = result.tabEvents || [];
    
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const filteredEvents = events.filter(e => e.timestamp > oneHourAgo);
    
    await chrome.storage.local.set({ tabEvents: filteredEvents });
  }
}

// Set up event listeners
chrome.tabs.onCreated.addListener(async (tab) => {
  await TabEventTracker.trackTabEvent('opened', tab);
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  // We don't have the full tab info, but we can track the close event
  const dummyTab = {
    id: tabId,
    url: 'unknown',
    windowId: removeInfo.windowId
  } as chrome.tabs.Tab;
  
  await TabEventTracker.trackTabEvent('closed', dummyTab);
});

// Clean up old events periodically (requires "alarms" permission in manifest)
try {
  chrome.alarms.create('cleanup-events', { periodInMinutes: 30 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanup-events') {
      void TabEventTracker.clearOldEvents();
    }
  });
} catch (e) {
  console.warn('Tab Chaos Analyzer: alarms unavailable, periodic cleanup disabled', e);
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.action) {
    case 'closeTabs':
      handleCloseTabs(message.tabIds, sendResponse);
      return true; // Keep channel open for async response

    case 'groupTabs':
      handleGroupTabs(message.tabIds, sendResponse);
      return true;

    case 'bookmarkTabs':
      handleBookmarkTabs(message.tabIds, sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

async function handleCloseTabs(tabIds: number[], sendResponse: (response: any) => void) {
  try {
    const closedCount = await closeTabsBatch(tabIds);
    sendResponse({ success: true, closedCount });
  } catch (error) {
    sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function handleGroupTabs(tabIds: number[], sendResponse: (response: any) => void) {
  try {
    const groupedCount = await groupTabsByDomain(tabIds);
    sendResponse({ success: true, groupedCount });
  } catch (error) {
    sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function handleBookmarkTabs(tabIds: number[], sendResponse: (response: any) => void) {
  try {
    const bookmarkedCount = await bookmarkAndCloseTabs(tabIds);
    sendResponse({ success: true, bookmarkedCount });
  } catch (error) {
    sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function closeTabsBatch(tabIds: number[]): Promise<number> {
  let closedCount = 0;
  
  for (const tabId of tabIds) {
    try {
      await chrome.tabs.remove(tabId);
      closedCount++;
    } catch (error) {
      console.warn(`Failed to close tab ${tabId}:`, error);
    }
  }
  
  return closedCount;
}

async function groupTabsByDomain(tabIds: number[]): Promise<number> {
  if (!chrome.tabs.group) {
    throw new Error('Tab grouping not available in this browser version');
  }

  // Get tab details
  const tabs = await Promise.all(
    tabIds.map(id => chrome.tabs.get(id).catch(() => null))
  );
  
  const validTabs = tabs.filter((tab): tab is chrome.tabs.Tab => 
    tab !== null && tab.url !== undefined
  );

  // Group by domain
  const domainGroups = new Map<string, chrome.tabs.Tab[]>();
  
  validTabs.forEach(tab => {
    try {
      const domain = new URL(tab.url!).hostname;
      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, []);
      }
      domainGroups.get(domain)!.push(tab);
    } catch {
      // Skip invalid URLs
    }
  });

  let groupedCount = 0;

  // Create groups for domains with multiple tabs
  for (const [domain, domainTabs] of domainGroups) {
    if (domainTabs.length > 1) {
      try {
        const groupId = await chrome.tabs.group({
          tabIds: domainTabs.map(tab => tab.id!)
        });
        
        await chrome.tabGroups.update(groupId, {
          title: domain,
          collapsed: true
        });
        
        groupedCount += domainTabs.length;
      } catch (error) {
        console.warn(`Failed to group tabs for domain ${domain}:`, error);
      }
    }
  }

  return groupedCount;
}

async function bookmarkAndCloseTabs(tabIds: number[]): Promise<number> {
  // Get tab details
  const tabs = await Promise.all(
    tabIds.map(id => chrome.tabs.get(id).catch(() => null))
  );
  
  const validTabs = tabs.filter((tab): tab is chrome.tabs.Tab => 
    tab !== null && tab.url !== undefined && tab.title !== undefined
  );

  // Create bookmark folder
  const folderName = `Tab Chaos Archive - ${new Date().toLocaleDateString()}`;
  let folder;
  
  try {
    folder = await chrome.bookmarks.create({
      title: folderName,
      parentId: '1' // Bookmarks bar
    });
  } catch {
    throw new Error('Failed to create bookmark folder');
  }

  let bookmarkedCount = 0;

  // Bookmark each tab
  for (const tab of validTabs) {
    try {
      await chrome.bookmarks.create({
        title: tab.title!,
        url: tab.url!,
        parentId: folder.id
      });
      bookmarkedCount++;
    } catch (error) {
      console.warn(`Failed to bookmark tab ${tab.id}:`, error);
    }
  }

  // Close the tabs after bookmarking
  const closedCount = await closeTabsBatch(tabIds);
  
  return Math.min(bookmarkedCount, closedCount);
}

// Initialize
console.log('Tab Chaos Analyzer background script loaded');