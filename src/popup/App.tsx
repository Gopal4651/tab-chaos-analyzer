import { useState, useEffect } from 'react';
import { ChaosAnalyzer } from '@/lib/chaos-analyzer.js';
import type { ChaosAnalysis } from '@/lib/types.js';
import ChaosScoreDisplay from './components/ChaosScoreDisplay.tsx';
import IssuesList from './components/IssuesList.tsx';
import SuggestionsList from './components/SuggestionsList.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [analysis, setAnalysis] = useState<ChaosAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyzeNow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ChaosAnalyzer.analyzeTabs();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeNow();
  }, []);

  const handleActionComplete = () => {
    // Refresh analysis after an action
    analyzeNow();
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
        <p className="text-center text-gray-600 mt-4">
          Analyzing your tab chaos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <p className="font-medium">Analysis Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <button
          onClick={analyzeNow}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 text-center text-gray-600">
        No analysis data available
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Tab Chaos Analyzer
          </h1>
          <button
            onClick={analyzeNow}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh analysis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chaos Score */}
      <div className="px-6 py-6">
        <ChaosScoreDisplay analysis={analysis} />
      </div>

      {/* Witty Comment */}
      <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
        <p className="text-sm text-gray-700 italic text-center leading-relaxed">
          "{analysis.wittyComment}"
        </p>
      </div>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="px-6 py-4">
          <IssuesList issues={analysis.issues} />
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <SuggestionsList 
            suggestions={analysis.suggestions}
            onActionComplete={handleActionComplete}
          />
        </div>
      )}

      {/* Footer Stats */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Total tabs:</span> {analysis.metrics.totalTabs}
          </div>
          <div>
            <span className="font-medium">Duplicates:</span> {analysis.metrics.duplicateTabs}
          </div>
          <div>
            <span className="font-medium">Stale tabs:</span> {analysis.metrics.staleTabs}
          </div>
          <div>
            <span className="font-medium">Panic bursts:</span> {analysis.metrics.panicBursts}
          </div>
        </div>
      </div>
    </div>
  );
}