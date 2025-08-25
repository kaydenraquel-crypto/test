// Load DXCharts via script tag to bypass ES module issues
(async function() {
  try {
    // Try to load the minified build
    const script = document.createElement('script');
    script.src = '/node_modules/@devexperts/dxcharts-lite/dist/dxchart.min.js';
    script.onload = () => {
      console.log('✅ DXCharts loaded via script tag');
      // Expose DXCharts to window object
      if (window.dxchart) {
        window.DXCharts = window.dxchart;
      }
    };
    script.onerror = (error) => {
      console.error('❌ Failed to load DXCharts script:', error);
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error('❌ Error setting up DXCharts loader:', error);
  }
})();