import { DeepPartial, ChartOptions, ColorType, CrosshairMode, PriceScaleMode } from 'lightweight-charts';

export interface ChartThemeConfig {
  name: string;
  colors: {
    background: string;
    text: string;
    grid: string;
    upColor: string;
    downColor: string;
    borderUp: string;
    borderDown: string;
    wickUp: string;
    wickDown: string;
    volumeUp: string;
    volumeDown: string;
    crosshair: string;
    watermark: string;
  };
  typography: {
    fontSize: number;
    fontFamily: string;
  };
  spacing: {
    topMargin: number;
    bottomMargin: number;
    volumeMargin: number;
  };
}

// NovaSignal Dark Theme (Primary)
export const novaSignalDarkTheme: ChartThemeConfig = {
  name: 'NovaSignal Dark',
  colors: {
    background: '#131722',
    text: '#d1d4dc',
    grid: '#363c4e',
    upColor: '#089981',
    downColor: '#f23645',
    borderUp: '#089981',
    borderDown: '#f23645',
    wickUp: '#089981',
    wickDown: '#f23645',
    volumeUp: '#08998140',
    volumeDown: '#f2364540',
    crosshair: '#9598a1',
    watermark: '#363c4e30',
  },
  typography: {
    fontSize: 12,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  spacing: {
    topMargin: 0.1,
    bottomMargin: 0.1,
    volumeMargin: 0.4,
  },
};

// TradingView Style Theme
export const tradingViewTheme: ChartThemeConfig = {
  name: 'TradingView',
  colors: {
    background: '#161a25',
    text: '#d1d4dc',
    grid: '#2a2e39',
    upColor: '#4caf50',
    downColor: '#ff5252',
    borderUp: '#4caf50',
    borderDown: '#ff5252',
    wickUp: '#4caf50',
    wickDown: '#ff5252',
    volumeUp: '#4caf5040',
    volumeDown: '#ff525240',
    crosshair: '#758696',
    watermark: '#2a2e3930',
  },
  typography: {
    fontSize: 11,
    fontFamily: "'Trebuchet MS', Arial, sans-serif",
  },
  spacing: {
    topMargin: 0.12,
    bottomMargin: 0.12,
    volumeMargin: 0.35,
  },
};

// Professional Light Theme
export const professionalLightTheme: ChartThemeConfig = {
  name: 'Professional Light',
  colors: {
    background: '#ffffff',
    text: '#2e2e2e',
    grid: '#e1e3e6',
    upColor: '#009688',
    downColor: '#e91e63',
    borderUp: '#009688',
    borderDown: '#e91e63',
    wickUp: '#009688',
    wickDown: '#e91e63',
    volumeUp: '#00968840',
    volumeDown: '#e91e6340',
    crosshair: '#9598a1',
    watermark: '#e1e3e630',
  },
  typography: {
    fontSize: 12,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  spacing: {
    topMargin: 0.1,
    bottomMargin: 0.1,
    volumeMargin: 0.4,
  },
};

// Matrix/Hacker Theme
export const matrixTheme: ChartThemeConfig = {
  name: 'Matrix',
  colors: {
    background: '#000000',
    text: '#00ff41',
    grid: '#003300',
    upColor: '#00ff41',
    downColor: '#ff0040',
    borderUp: '#00ff41',
    borderDown: '#ff0040',
    wickUp: '#00ff41',
    wickDown: '#ff0040',
    volumeUp: '#00ff4140',
    volumeDown: '#ff004040',
    crosshair: '#00cc33',
    watermark: '#00330030',
  },
  typography: {
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
  },
  spacing: {
    topMargin: 0.08,
    bottomMargin: 0.08,
    volumeMargin: 0.45,
  },
};

// Minimalist Theme
export const minimalistTheme: ChartThemeConfig = {
  name: 'Minimalist',
  colors: {
    background: '#fafafa',
    text: '#424242',
    grid: '#e0e0e020',
    upColor: '#2196f3',
    downColor: '#ff9800',
    borderUp: '#2196f3',
    borderDown: '#ff9800',
    wickUp: '#2196f3',
    wickDown: '#ff9800',
    volumeUp: '#2196f340',
    volumeDown: '#ff980040',
    crosshair: '#757575',
    watermark: '#e0e0e020',
  },
  typography: {
    fontSize: 12,
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
  },
  spacing: {
    topMargin: 0.15,
    bottomMargin: 0.15,
    volumeMargin: 0.3,
  },
};

// Collection of all themes
export const CHART_THEMES = {
  'novaSignalDark': novaSignalDarkTheme,
  'tradingView': tradingViewTheme,
  'professionalLight': professionalLightTheme,
  'matrix': matrixTheme,
  'minimalist': minimalistTheme,
};

// Convert theme config to lightweight-charts options
export function createChartOptions(
  themeConfig: ChartThemeConfig,
  options: {
    width?: number;
    height?: number;
    showVolume?: boolean;
    showGrid?: boolean;
    showCrosshair?: boolean;
    autoScale?: boolean;
    logScale?: boolean;
    showWatermark?: boolean;
    watermarkText?: string;
  } = {}
): DeepPartial<ChartOptions> {
  const {
    width,
    height = 500,
    showVolume = true,
    showGrid = true,
    showCrosshair = true,
    autoScale = true,
    logScale = false,
    showWatermark = false,
    watermarkText = 'NovaSignal',
  } = options;

  return {
    layout: {
      background: { type: ColorType.Solid, color: themeConfig.colors.background },
      textColor: themeConfig.colors.text,
      fontSize: themeConfig.typography.fontSize,
      fontFamily: themeConfig.typography.fontFamily,
    },
    grid: {
      vertLines: {
        color: themeConfig.colors.grid,
        visible: showGrid,
        style: 1,
      },
      horzLines: {
        color: themeConfig.colors.grid,
        visible: showGrid,
        style: 1,
      },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        visible: showCrosshair,
        labelVisible: true,
        color: themeConfig.colors.crosshair,
        width: 1,
        style: 3,
      },
      horzLine: {
        visible: showCrosshair,
        labelVisible: true,
        color: themeConfig.colors.crosshair,
        width: 1,
        style: 3,
      },
    },
    rightPriceScale: {
      visible: true,
      borderColor: themeConfig.colors.grid,
      mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
      autoScale: autoScale,
      scaleMargins: {
        top: themeConfig.spacing.topMargin,
        bottom: showVolume ? themeConfig.spacing.volumeMargin : themeConfig.spacing.bottomMargin,
      },
    },
    timeScale: {
      visible: true,
      borderColor: themeConfig.colors.grid,
      timeVisible: true,
      secondsVisible: false,
      fixLeftEdge: true,
      fixRightEdge: false,
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true,
    },
    handleScale: {
      axisPressedMouseMove: {
        time: true,
        price: true,
      },
      axisDoubleClickReset: {
        time: true,
        price: true,
      },
      mouseWheel: true,
      pinch: true,
    },
    width: width,
    height: height,
    watermark: showWatermark ? {
      visible: true,
      fontSize: Math.max(24, themeConfig.typography.fontSize * 2),
      text: watermarkText,
      color: themeConfig.colors.watermark,
      horzAlign: 'center',
      vertAlign: 'center',
    } : undefined,
  };
}

// Get candlestick series options
export function getCandlestickSeriesOptions(themeConfig: ChartThemeConfig) {
  return {
    upColor: themeConfig.colors.upColor,
    downColor: themeConfig.colors.downColor,
    borderDownColor: themeConfig.colors.borderDown,
    borderUpColor: themeConfig.colors.borderUp,
    wickDownColor: themeConfig.colors.wickDown,
    wickUpColor: themeConfig.colors.wickUp,
  };
}

// Get volume series options
export function getVolumeSeriesOptions(themeConfig: ChartThemeConfig) {
  return {
    priceFormat: {
      type: 'volume' as const,
    },
    priceScaleId: 'volume',
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  };
}

// Get line series options
export function getLineSeriesOptions(themeConfig: ChartThemeConfig, color?: string) {
  return {
    color: color || themeConfig.colors.upColor,
    lineWidth: 2,
    lineType: 0 as const,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 6,
    crosshairMarkerBorderColor: color || themeConfig.colors.upColor,
    crosshairMarkerBackgroundColor: themeConfig.colors.background,
  };
}

// Get area series options
export function getAreaSeriesOptions(themeConfig: ChartThemeConfig, color?: string) {
  const lineColor = color || themeConfig.colors.upColor;
  return {
    lineColor: lineColor,
    topColor: `${lineColor}60`,
    bottomColor: `${themeConfig.colors.background}00`,
    lineWidth: 2,
  };
}

// Utility function to convert hex to rgba
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Theme detection from NovaSignal theme context
export function getChartThemeFromNovaSignalTheme(themeName: string): ChartThemeConfig {
  switch (themeName.toLowerCase()) {
    case 'dark':
      return novaSignalDarkTheme;
    case 'light':
      return professionalLightTheme;
    case 'tradingview':
      return tradingViewTheme;
    case 'matrix':
      return matrixTheme;
    case 'minimalist':
      return minimalistTheme;
    default:
      return novaSignalDarkTheme;
  }
}