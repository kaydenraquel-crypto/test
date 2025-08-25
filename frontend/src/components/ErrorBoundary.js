import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('🚨 ErrorBoundary caught an error:', error);
        console.error('Error details:', errorInfo);
        this.setState({ errorInfo });
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsx("div", { className: "error-boundary", children: _jsxs("div", { className: "error-container", children: [_jsx("h2", { children: "\uD83D\uDEA8 Something went wrong" }), _jsx("p", { children: "The application encountered an unexpected error." }), _jsxs("details", { style: { whiteSpace: 'pre-wrap', marginTop: '1rem' }, children: [_jsx("summary", { children: "Error Details" }), _jsxs("p", { children: [_jsx("strong", { children: "Error:" }), " ", this.state.error?.message] }), _jsx("p", { children: _jsx("strong", { children: "Stack:" }) }), _jsx("code", { children: this.state.error?.stack }), this.state.errorInfo && (_jsxs(_Fragment, { children: [_jsx("p", { children: _jsx("strong", { children: "Component Stack:" }) }), _jsx("code", { children: this.state.errorInfo.componentStack })] }))] }), _jsx("button", { onClick: () => window.location.reload(), className: "retry-button", style: {
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, children: "\uD83D\uDD04 Reload Application" })] }) }));
        }
        return this.props.children;
    }
}
// Functional error boundary for specific sections
export const ErrorFallback = ({ error, resetError }) => (_jsxs("div", { className: "error-fallback", children: [_jsx("h3", { children: "\u26A0\uFE0F Error in this section" }), _jsx("p", { children: error.message }), resetError && (_jsx("button", { onClick: resetError, className: "retry-button", children: "\uD83D\uDD04 Try Again" }))] }));
export default ErrorBoundary;
