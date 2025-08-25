// Toast notification for keyboard shortcut usage
import React, { useState, useEffect } from 'react'

interface ShortcutToastProps {
  message: string
  visible: boolean
  onHide: () => void
}

export const ShortcutToast = ({ message, visible, onHide }: ShortcutToastProps) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [visible, onHide])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#2d3748',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid #4a5568',
      animation: visible ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-in'
    }}>
      <span style={{ fontSize: '16px' }}>⌨️</span>
      <span>{message}</span>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          to {
            opacity: 0;
            transform: translate(-50%, 100%);
          }
        }
      `}</style>
    </div>
  )
}

// Hook for managing shortcut toasts
export const useShortcutToast = () => {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false
  })

  const showToast = (message: string) => {
    setToast({ message, visible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }))
  }

  return {
    toast,
    showToast,
    hideToast
  }
}