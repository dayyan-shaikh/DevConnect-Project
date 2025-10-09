export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl font-bold">DC</span>
          </div>
          {/* Spinning Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 border-r-blue-400 animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            DevConnect
          </h2>
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">Loading</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
