# NovaSignal Accessibility Guide

NovaSignal is designed to be accessible to all users, including those with disabilities. This guide outlines the accessibility features implemented and how to use them effectively.

## 🎯 Accessibility Standards

NovaSignal follows **WCAG 2.1 Level AA** guidelines and incorporates:

- **Screen reader compatibility** with NVDA, JAWS, and VoiceOver
- **Keyboard navigation** for all interactive elements
- **High contrast support** for users with visual impairments
- **Reduced motion** respect for vestibular sensitivity
- **Focus management** for clear navigation paths
- **Semantic HTML** with proper ARIA labels and roles

## 🚀 Quick Start for Screen Reader Users

1. **Navigation**: Use Tab/Shift+Tab to move between controls
2. **Chart Data**: Press 'D' while on the chart to hear data description
3. **Help**: Press '?' to open keyboard shortcuts help
4. **Search**: Type in symbol selector to filter options
5. **Refresh**: Press Ctrl+R to refresh chart data

## ⌨️ Keyboard Navigation

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next interactive element |
| `Shift + Tab` | Move to previous interactive element |
| `?` | Show/hide keyboard shortcuts help |
| `Escape` | Close dialogs and dropdowns |
| `Ctrl + R` | Refresh chart data |

### Chart Navigation

| Shortcut | Action |
|----------|--------|
| `Arrow Left/Right` | Pan chart horizontally |
| `+` or `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom to fit all data |
| `D` | Describe current chart data |
| `Home` | Go to beginning of data |
| `End` | Go to end of data |

### Form Controls

| Shortcut | Action |
|----------|--------|
| `Arrow Up/Down` | Navigate dropdown options |
| `Enter` | Activate button or select option |
| `Space` | Activate button or checkbox |
| `Alt + Down` | Open dropdown/combobox |

## 🔊 Screen Reader Features

### Live Announcements

NovaSignal automatically announces:

- **Data updates**: "Chart updated. Current price: 50,000. Change: positive 2.5 percent"
- **Symbol changes**: "Symbol changed to Bitcoin"
- **Loading states**: "Loading chart data"
- **Errors**: "Error: Failed to load data"
- **Success messages**: "Data loaded successfully"

### Chart Accessibility

- **Descriptions**: Charts include detailed text descriptions
- **Data tables**: Alternative tabular view of chart data
- **Price announcements**: Real-time price and change information
- **Navigation feedback**: Audio feedback for chart interactions

### Form Labels

All form controls include:
- **Visible labels**: Clear, descriptive text
- **ARIA labels**: Additional context for screen readers
- **Help text**: Explanatory information
- **Error messages**: Clear validation feedback
- **Required indicators**: Marked with asterisk and announced

## 🎨 Visual Accessibility

### High Contrast Mode

NovaSignal detects and supports:
- **System high contrast**: Automatic detection of OS settings
- **Custom high contrast**: Manual toggle available
- **Color adjustments**: Enhanced contrast ratios (7:1 minimum)
- **Border emphasis**: Stronger borders and outlines

### Color and Contrast

- **Text contrast**: Minimum 4.5:1 ratio for normal text, 7:1 for enhanced
- **Interactive elements**: Minimum 3:1 contrast for controls
- **Color independence**: Information not conveyed by color alone
- **Focus indicators**: High contrast 2px outline with offset

### Typography

- **Scalable fonts**: Support for browser zoom up to 200%
- **Readable fonts**: System fonts for optimal rendering
- **Line spacing**: 1.6 line height for readability
- **Text spacing**: Adequate spacing between interactive elements

## ⚡ Motion and Animation

### Reduced Motion Support

Respects `prefers-reduced-motion` for users with vestibular disorders:

- **Disabled animations**: Spinning indicators, transitions
- **Instant feedback**: Immediate state changes
- **Static charts**: Reduced chart animations
- **Focus transitions**: Instant focus changes

### Animation Controls

- **Auto-detection**: System preference automatically applied
- **Manual override**: User can disable animations in settings
- **Essential motion**: Only critical animations remain
- **Alternative feedback**: Visual/audio cues replace motion

## 🖱️ Motor Accessibility

### Touch Targets

- **Minimum size**: 44×44 pixels for all interactive elements
- **Adequate spacing**: 8px minimum between targets
- **Large click areas**: Buttons include padding
- **Hover states**: Clear visual feedback

### Input Methods

- **Keyboard only**: Full functionality without mouse
- **Touch support**: Optimized for touchscreen devices
- **Voice control**: Compatible with speech recognition
- **Switch navigation**: Sequential focus order

## 🧭 Navigation Structure

### Semantic HTML

```html
<header role="banner">
  <h1>NovaSignal Trading Platform</h1>
</header>

<nav role="navigation" aria-label="Trading controls">
  <!-- Symbol selector, timeframe controls -->
</nav>

<main role="main" id="main-content">
  <section aria-labelledby="chart-heading">
    <h2 id="chart-heading">BTC/USDT Chart</h2>
    <!-- Chart component -->
  </section>
</main>

<footer role="contentinfo">
  <!-- Status information -->
</footer>
```

### ARIA Landmarks

- **Banner**: Header with site title and status
- **Navigation**: Trading controls and options
- **Main**: Primary chart and data content
- **Contentinfo**: Status bar and app information
- **Complementary**: Help panels and sidebars

### Focus Management

- **Skip links**: Jump to main content
- **Focus trapping**: Modal dialogs and dropdowns
- **Focus restoration**: Return to previous element
- **Logical order**: Sequential tab navigation

## 📊 Chart Accessibility

### Screen Reader Support

Charts provide multiple access methods:

1. **Text descriptions**: Generated summaries of chart data
2. **Data tables**: Tabular representation of OHLC data
3. **Live announcements**: Real-time price updates
4. **Keyboard navigation**: Pan and zoom with keyboard

### Chart Description Example

```
"Candlestick chart showing upward trend. Opening price: 48,500, 
closing price: 50,250. Highest point: 51,000, lowest point: 48,200. 
Data spans 100 time periods. Current price: 50,250, 
change: positive 3.6 percent."
```

### Data Table Alternative

| Time | Open | High | Low | Close | Volume |
|------|------|------|-----|-------|--------|
| 10:00 | 48500 | 49000 | 48200 | 48800 | 1000 |
| 11:00 | 48800 | 49500 | 48600 | 49200 | 1200 |

## 🔧 Accessibility Testing

### Automated Testing

- **axe-core**: Comprehensive accessibility scanning
- **Lighthouse**: Performance and accessibility audit
- **ESLint plugins**: jsx-a11y rules enforcement
- **Color contrast**: Automated contrast checking

### Manual Testing

1. **Keyboard navigation**: Tab through all controls
2. **Screen reader**: Test with NVDA/JAWS/VoiceOver
3. **High contrast**: Verify in system high contrast mode
4. **Zoom**: Test at 200% browser zoom
5. **Reduced motion**: Test with animation preferences disabled

### Testing Checklist

- [ ] All interactive elements focusable with keyboard
- [ ] Focus indicators visible and high contrast
- [ ] All images have appropriate alt text
- [ ] Form labels properly associated
- [ ] ARIA labels and roles correct
- [ ] Live regions announce updates
- [ ] Skip links functional
- [ ] Color contrast meets WCAG AA standards
- [ ] Text scales properly up to 200%
- [ ] Motion respects user preferences

## 🛠️ Developer Guidelines

### Implementation Standards

```javascript
// Good: Proper ARIA labeling
<button 
  aria-label="Refresh chart data"
  aria-describedby="refresh-help"
  onClick={handleRefresh}
>
  <RefreshIcon aria-hidden="true" />
  Refresh
</button>
<div id="refresh-help" className="sr-only">
  Updates chart with latest market data
</div>

// Good: Focus management
const handleModalOpen = () => {
  focusManager.saveFocus()
  setModalOpen(true)
}

const handleModalClose = () => {
  setModalOpen(false)
  focusManager.restoreFocus()
}

// Good: Announcements
const handleDataUpdate = (data) => {
  setChartData(data)
  announce(`Chart updated with ${data.length} data points`)
}
```

### Accessibility Hooks

```javascript
import useAccessibility from '../hooks/useAccessibility'

const {
  announce,
  announceError,
  saveFocus,
  restoreFocus,
  isHighContrast,
  reducedMotion
} = useAccessibility()
```

### ARIA Patterns

- **Combobox**: Symbol selector with autocomplete
- **Listbox**: Dropdown option lists
- **Dialog**: Modal help and settings
- **Application**: Interactive chart component
- **Status**: Live price and data updates
- **Alert**: Error messages and warnings

## 📱 Mobile Accessibility

### Touch Accessibility

- **Large targets**: Minimum 44×44px touch areas
- **Gesture alternatives**: Keyboard equivalents available
- **Voice control**: Compatible with mobile assistive tech
- **Screen reader**: Optimized for TalkBack/VoiceOver

### Responsive Design

- **Scalable UI**: Adapts to different screen sizes
- **Readable text**: Minimum 16px font on mobile
- **Touch-friendly**: Appropriate spacing and sizing
- **Zoom support**: Pinch-to-zoom compatibility

## 🆘 Support and Resources

### Getting Help

- **Documentation**: This accessibility guide
- **Keyboard shortcuts**: Press '?' in application
- **Support email**: accessibility@novasignal.com
- **GitHub issues**: Report accessibility bugs

### External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Assistive Technology

NovaSignal has been tested with:

- **NVDA** (Windows) - Free screen reader
- **JAWS** (Windows) - Professional screen reader  
- **VoiceOver** (macOS/iOS) - Built-in screen reader
- **TalkBack** (Android) - Built-in screen reader
- **Dragon** (Windows/Mac) - Speech recognition
- **Windows Magnifier** - Built-in screen magnification

## 📈 Continuous Improvement

We're committed to maintaining and improving accessibility:

- **Regular audits**: Quarterly accessibility reviews
- **User feedback**: Incorporate user suggestions
- **Standard updates**: Stay current with WCAG guidelines
- **Testing expansion**: Add new assistive technology testing
- **Training**: Ongoing developer accessibility education

---

**Making trading accessible to everyone** 📊♿

For accessibility feedback or support, contact us at accessibility@novasignal.com