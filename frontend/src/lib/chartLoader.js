// Lazy load the chart library
export const loadChartLibrary = async () => {
    const { createChart } = await import('lightweight-charts');
    return { createChart };
};
// Chart creation helper with lazy loading
export const createLazyChart = async (container, options) => {
    const { createChart } = await loadChartLibrary();
    return createChart(container, options);
};
