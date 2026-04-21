import { useState } from 'react';
import type { ChaosSuggestion } from '@/lib/types.js';
import { 
  X, 
  FolderOpen, 
  Bookmark, 
  RotateCcw, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

interface SuggestionsListProps {
  suggestions: ChaosSuggestion[];
  onActionComplete: () => void;
}

const SUGGESTION_CONFIG: Record<ChaosSuggestion['type'], {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
}> = {
  close: { icon: X, bgColor: 'bg-red-500 hover:bg-red-600' },
  group: { icon: FolderOpen, bgColor: 'bg-purple-500 hover:bg-purple-600' },
  bookmark: { icon: Bookmark, bgColor: 'bg-blue-500 hover:bg-blue-600' },
  reload: { icon: RotateCcw, bgColor: 'bg-green-500 hover:bg-green-600' }
};

export default function SuggestionsList({ suggestions, onActionComplete }: SuggestionsListProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const executeAction = async (suggestion: ChaosSuggestion) => {
    const actionKey = `${suggestion.type}-${suggestion.tabIds.length}`;
    setLoadingAction(actionKey);
    setLastActionResult(null);

    try {
      const response = await chrome.runtime.sendMessage({
        action: getBackgroundAction(suggestion.type),
        tabIds: suggestion.tabIds
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const count = response.closedCount || response.groupedCount || response.bookmarkedCount || 0;
      setLastActionResult({
        success: true,
        message: `Successfully ${getActionPastTense(suggestion.type)} ${count} tabs`
      });

      // Refresh the analysis after a short delay
      setTimeout(() => {
        onActionComplete();
      }, 1000);

    } catch (error) {
      setLastActionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Action failed'
      });
    } finally {
      setLoadingAction(null);
      
      // Clear result message after 3 seconds
      setTimeout(() => {
        setLastActionResult(null);
      }, 3000);
    }
  };

  const getBackgroundAction = (type: ChaosSuggestion['type']): string => {
    switch (type) {
      case 'close': return 'closeTabs';
      case 'group': return 'groupTabs';
      case 'bookmark': return 'bookmarkTabs';
      default: return 'closeTabs';
    }
  };

  const getActionPastTense = (type: ChaosSuggestion['type']): string => {
    switch (type) {
      case 'close': return 'closed';
      case 'group': return 'grouped';
      case 'bookmark': return 'bookmarked';
      case 'reload': return 'reloaded';
      default: return 'processed';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No suggestions at this time</p>
        <p className="text-xs text-gray-400 mt-1">Your tabs are looking good!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        Suggested Actions
      </h3>

      {/* Action result feedback */}
      {lastActionResult && (
        <div className={clsx(
          'mb-3 p-2 rounded-lg text-sm flex items-center gap-2',
          lastActionResult.success 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          {lastActionResult.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {lastActionResult.message}
        </div>
      )}
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const config = SUGGESTION_CONFIG[suggestion.type];
          const Icon = config.icon;
          const actionKey = `${suggestion.type}-${suggestion.tabIds.length}`;
          const isLoading = loadingAction === actionKey;
          
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium mb-1">
                    {suggestion.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                      suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    )}>
                      {suggestion.priority} priority
                    </span>
                    <span className="text-xs text-gray-500">
                      {suggestion.tabIds.length} tab{suggestion.tabIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => executeAction(suggestion)}
                  disabled={isLoading || loadingAction !== null}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-all',
                    config.bgColor,
                    (isLoading || loadingAction !== null) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  {suggestion.action}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Actions cannot be undone. Use with caution.
      </div>
    </div>
  );
}