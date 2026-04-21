import { Brain } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-6 h-6 text-blue-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}