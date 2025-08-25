import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Toast notification for keyboard shortcut usage
import { useState, useEffect } from 'react';
export const ShortcutToast = ({ message, visible, onHide }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(onHide, 2000);
            return () => clearTimeout(timer);
        }
    }, [visible, onHide]);
    if (!visible)
        return null;
    return (_jsxs("div", { style: {
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
        }, children: [_jsx("span", { style: { fontSize: '16px' }, children: "\u2328\uFE0F" }), _jsx("span", { children: message }), _jsx("style", { jsx: true, children: `
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
      ` })] }));
};
// Hook for managing shortcut toasts
export const useShortcutToast = () => {
    const [toast, setToast] = useState({
        message: '',
        visible: false
    });
    const showToast = (message) => {
        setToast({ message, visible: true });
    };
    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };
    return {
        toast,
        showToast,
        hideToast
    };
};
