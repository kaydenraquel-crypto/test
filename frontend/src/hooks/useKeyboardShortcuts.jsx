import { useEffect, useCallback, useState } from 'react'

const useKeyboardShortcuts = () => {
  const [showHelp, setShowHelp] = useState(false)

  const shortcuts = {
    'h': () => setShowHelp(true),
    'Escape': () => setShowHelp(false),
    'r': () => window.location.reload(),
    'f': () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen()
      }
    }
  }

  const handleKeyPress = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
      return
    }

    const key = event.key
    if (shortcuts[key]) {
      event.preventDefault()
      shortcuts[key]()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  const HelpModal = () => {
    if (!showHelp) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '10px',
          maxWidth: '500px',
          width: '90%',
          color: 'white',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0 }}>Keyboard Shortcuts</h2>
            <button
              onClick={() => setShowHelp(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>H</strong> - Show/hide this help
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>R</strong> - Refresh page
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>F</strong> - Toggle fullscreen
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>ESC</strong> - Close help/dialogs
            </div>
          </div>
          
          <div style={{
            marginTop: '20px',
            fontSize: '14px',
            color: '#ccc',
            textAlign: 'center'
          }}>
            Press ESC or click outside to close
          </div>
        </div>
      </div>
    )
  }

  return {
    showHelp,
    setShowHelp,
    HelpModal
  }
}

export default useKeyboardShortcuts