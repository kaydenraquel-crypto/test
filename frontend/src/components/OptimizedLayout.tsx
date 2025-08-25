import React from 'react'
import './OptimizedLayout.css'

interface OptimizedLayoutProps {
  leftColumn: React.ReactNode
  chartArea: React.ReactNode
  rightColumn: React.ReactNode
  bottomPanel?: React.ReactNode
}

export default function OptimizedLayout({ 
  leftColumn, 
  chartArea, 
  rightColumn, 
  bottomPanel 
}: OptimizedLayoutProps) {
  return (
    <div className="optimized-layout">
      {/* Header Controls */}
      <div className="header-area">
        {/* Chart controls will go here */}
      </div>

      {/* Main Content Grid */}
      <div className="main-grid">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-content">
            {leftColumn}
          </div>
        </aside>

        {/* Chart Area */}
        <main className="chart-area">
          <div className="chart-container">
            {chartArea}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <div className="sidebar-content">
            {rightColumn}
          </div>
        </aside>
      </div>

      {/* Bottom Panel (Optional) */}
      {bottomPanel && (
        <div className="bottom-panel">
          {bottomPanel}
        </div>
      )}
    </div>
  )
}