const path = require('path');

module.exports = {
  appId: "com.novasignal.trading",
  productName: "NovaSignal Trading Platform",
  
  // Directories
  directories: {
    output: "dist",
    buildResources: "assets"
  },
  
  // Source files
  files: [
    "src/**/*",
    "assets/**/*",
    "node_modules/**/*",
    "package.json",
    {
      from: "../frontend/dist",
      to: "frontend",
      filter: ["**/*"]
    }
  ],
  
  extraResources: [
    {
      from: "../backend",
      to: "backend",
      filter: [
        "**/*",
        "!__pycache__/**/*",
        "!*.pyc",
        "!.venv/**/*",
        "!venv/**/*"
      ]
    }
  ],
  
  // Windows configuration
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "assets/icons/icon.ico",
    artifactName: "${productName}-Setup-${version}.${ext}",
    publisherName: "NovaSignal LLC"
  },
  
  // NSIS installer configuration
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "NovaSignal Trading Platform",
    
    // Installer appearance
    installerIcon: "assets/icons/installer.ico",
    uninstallerIcon: "assets/icons/uninstaller.ico",
    installerHeaderIcon: "assets/icons/installer-header.ico",
    installerSidebar: "assets/images/installer-sidebar.bmp",
    uninstallerSidebar: "assets/images/installer-sidebar.bmp",
    
    // License and legal
    license: "../LICENSE",
    warningsAsErrors: false,
    runAfterFinish: true,
    
    // Custom installer script sections
    include: "installer-script.nsh"
  },
  
  // macOS configuration  
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"]
      }
    ],
    icon: "assets/icons/icon.icns",
    category: "public.app-category.finance",
    artifactName: "${productName}-${version}-${arch}.${ext}",
    
    // Code signing and notarization
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "assets/entitlements.mac.plist",
    entitlementsInherit: "assets/entitlements.mac.plist"
  },
  
  // DMG configuration
  dmg: {
    title: "${productName} ${version}",
    icon: "assets/icons/icon.icns",
    iconSize: 100,
    window: {
      x: 400,
      y: 200,
      width: 660,
      height: 400
    },
    contents: [
      {
        x: 180,
        y: 170,
        type: "file"
      },
      {
        x: 480,
        y: 170,
        type: "link",
        path: "/Applications"
      }
    ]
  },
  
  // Linux configuration
  linux: {
    target: [
      {
        target: "AppImage", 
        arch: ["x64"]
      },
      {
        target: "deb",
        arch: ["x64"]
      },
      {
        target: "rpm",
        arch: ["x64"]
      }
    ],
    icon: "assets/icons/icon.png",
    category: "Office",
    artifactName: "${productName}-${version}-${arch}.${ext}",
    
    desktop: {
      Name: "NovaSignal Trading Platform",
      Comment: "Professional Trading Platform with Advanced Technical Analysis",
      Keywords: "trading;finance;crypto;stocks;technical;analysis;",
      StartupWMClass: "novasignal-trading-platform"
    }
  },
  
  // AppImage specific
  appImage: {
    license: "../LICENSE"
  },
  
  // Debian package specific
  deb: {
    packageCategory: "office",
    priority: "optional",
    depends: [
      "gconf2",
      "gconf-service",
      "libnotify4",
      "libappindicator1",
      "libxtst6",
      "libnss3"
    ]
  },
  
  // RPM package specific  
  rpm: {
    packageCategory: "Office",
    depends: [
      "libXtst6",
      "libXss1",
      "libasound2"
    ]
  },
  
  // Publishing configuration
  publish: {
    provider: "github",
    owner: "your-username",
    repo: "NovaSignal_v0_2",
    private: true,
    releaseType: "release"
  },
  
  // Compression and optimization
  compression: "maximum",
  
  // File associations
  fileAssociations: [
    {
      ext: "nvsignal",
      name: "NovaSignal Workspace",
      description: "NovaSignal Trading Workspace File",
      role: "Editor",
      icon: "assets/icons/workspace-icon"
    }
  ],
  
  // Protocol associations
  protocols: [
    {
      name: "NovaSignal Protocol",
      schemes: ["novasignal"]
    }
  ],
  
  // Auto-updater configuration
  electronUpdaterCompatibility: ">=4.0.0",
  
  // Development and debugging
  buildDependenciesFromSource: false,
  nodeGypRebuild: false,
  npmRebuild: false
};