import React from 'react'

// Generic loading spinner
export const LoadingSpinner = ({ size = 24, color = '#60a5fa' }: { size?: number; color?: string }) => (
  <div 
    className="loading-spinner"
    style={{
      width: size,
      height: size,
      border: `2px solid transparent`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      display: 'inline-block'
    }}
  />
)

// Chart skeleton loader
export const ChartSkeleton = () => (
  <div className="chart-skeleton" style={{
    width: '100%',
    height: '400px',
    backgroundColor: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
    {/* Chart title bar */}
    <div style={{
      height: '24px',
      background: 'linear-gradient(90deg, var(--border) 25%, transparent 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '4px',
      width: '60%'
    }} />
    
    {/* Main chart area */}
    <div style={{
      flex: 1,
      background: 'linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite',
      borderRadius: '4px',
      position: 'relative'
    }}>
      {/* Simulated candlesticks */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        right: '10%',
        height: '60%',
        display: 'flex',
        alignItems: 'end',
        gap: '2px'
      }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${Math.random() * 60 + 20}%`,
              background: 'var(--border)',
              borderRadius: '1px',
              opacity: 0.3
            }}
          />
        ))}
      </div>
    </div>
    
    {/* Bottom indicators area */}
    <div style={{
      height: '60px',
      background: 'linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.8s infinite',
      borderRadius: '4px',
      opacity: 0.7
    }} />
  </div>
)

// Data panel skeleton
export const DataPanelSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="data-panel-skeleton" style={{
    backgroundColor: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px'
  }}>
    <div style={{
      height: '20px',
      width: '40%',
      background: 'linear-gradient(90deg, var(--border) 25%, transparent 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '4px',
      marginBottom: '12px'
    }} />
    
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '8px',
        alignItems: 'center'
      }}>
        <div style={{
          height: '16px',
          width: '30%',
          background: 'linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          borderRadius: '4px'
        }} />
        <div style={{
          height: '16px',
          width: '20%',
          background: 'linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2.2s infinite',
          borderRadius: '4px'
        }} />
      </div>
    ))}
  </div>
)

// News feed skeleton
export const NewsFeedSkeleton = ({ items = 3 }: { items?: number }) => (
  <div className="news-feed-skeleton">
    {Array.from({ length: items }, (_, i) => (
      <div key={i} style={{
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px'
      }}>
        {/* Title */}
        <div style={{
          height: '18px',
          width: '85%',
          background: 'linear-gradient(90deg, var(--border) 25%, transparent 50%, var(--border) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px',
          marginBottom: '8px'
        }} />
        
        {/* Subtitle */}
        <div style={{
          height: '14px',
          width: '60%',
          background: 'linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s infinite',
          borderRadius: '4px',
          marginBottom: '6px'
        }} />
        
        {/* Meta info */}
        <div style={{
          height: '12px',
          width: '40%',
          background: 'linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          borderRadius: '4px'
        }} />
      </div>
    ))}
  </div>
)

// Loading overlay for entire sections
export const LoadingOverlay = ({ message = 'Loading...' }: { message?: string }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 18, 32, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    zIndex: 100,
    borderRadius: '8px'
  }}>
    <LoadingSpinner size={32} />
    <div style={{ color: 'var(--text)', fontSize: '14px' }}>{message}</div>
  </div>
)

// Inline loading indicator
export const InlineLoader = ({ text = 'Loading' }: { text?: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--muted)',
    fontSize: '14px'
  }}>
    <LoadingSpinner size={16} color="var(--muted)" />
    {text}
  </div>
)

// Progress bar
export const ProgressBar = ({ progress, label }: { progress: number; label?: string }) => (
  <div style={{ width: '100%' }}>
    {label && (
      <div style={{ 
        fontSize: '12px', 
        color: 'var(--muted)', 
        marginBottom: '4px',
        textAlign: 'center'
      }}>
        {label}
      </div>
    )}
    <div style={{
      width: '100%',
      height: '4px',
      backgroundColor: 'var(--border)',
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, progress))}%`,
        height: '100%',
        backgroundColor: 'var(--accent)',
        transition: 'width 0.3s ease-in-out'
      }} />
    </div>
  </div>
)

// Skeleton for trading signals
export const SignalsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="signals-skeleton">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: 'var(--card)',
        borderRadius: '6px',
        marginBottom: '6px'
      }}>
        {/* Signal type badge */}
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'linear-gradient(90deg, var(--green) 25%, var(--red) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
        
        {/* Signal text */}
        <div style={{
          height: '14px',
          width: `${60 + Math.random() * 30}%`,
          background: 'linear-gradient(90deg, var(--border) 25%, transparent 50%, var(--border) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s infinite',
          borderRadius: '4px'
        }} />
      </div>
    ))}
  </div>
)