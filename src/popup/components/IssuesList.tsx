import type { ChaosIssue } from '@/lib/types.js';
import { 
  Copy, 
  Clock, 
  Globe, 
  Zap, 
  HardDrive, 
  AlertTriangle 
} from 'lucide-react';
import clsx from 'clsx';

interface IssuesListProps {
  issues: ChaosIssue[];
}

const ISSUE_CONFIG: Record<ChaosIssue['type'], {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  duplicates: { icon: Copy, color: 'text-blue-600' },
  stale: { icon: Clock, color: 'text-amber-600' },
  clustering: { icon: Globe, color: 'text-purple-600' },
  panic: { icon: Zap, color: 'text-red-600' },
  memory: { icon: HardDrive, color: 'text-orange-600' },
  volume: { icon: AlertTriangle, color: 'text-gray-600' }
};

const SEVERITY_CONFIG = {
  low: 'border-l-gray-400 bg-gray-50',
  medium: 'border-l-amber-400 bg-amber-50',
  high: 'border-l-red-400 bg-red-50'
};

export default function IssuesList({ issues }: IssuesListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No issues detected</p>
        <p className="text-xs text-gray-400 mt-1">Your tabs are in good shape!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Issues Detected
      </h3>
      
      <div className="space-y-2">
        {issues.map((issue, index) => {
          const config = ISSUE_CONFIG[issue.type];
          const Icon = config.icon;
          
          return (
            <div
              key={index}
              className={clsx(
                'p-3 rounded-lg border-l-4',
                SEVERITY_CONFIG[issue.severity]
              )}
            >
              <div className="flex items-start gap-3">
                <div className={clsx('mt-0.5', config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {issue.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                      issue.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {issue.severity} priority
                    </span>
                    {issue.count > 1 && (
                      <span className="text-xs text-gray-500">
                        ({issue.count} affected)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}