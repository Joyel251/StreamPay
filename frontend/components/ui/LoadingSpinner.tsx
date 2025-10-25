import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'lg', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className={`${sizeClasses[size]} border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin`}></div>
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin`} 
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>
        {message && (
          <p className="text-white text-lg font-semibold animate-pulse">{message}</p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
