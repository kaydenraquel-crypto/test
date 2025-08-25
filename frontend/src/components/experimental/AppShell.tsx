import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TradingIcon,
  AccountBalance as PortfolioIcon,
  Analytics as AnalyticsIcon,
  Notifications as AlertsIcon,
  Settings as SettingsIcon,
  Timeline as OriginalIcon,
  Brightness4,
  Brightness7,
  AccountCircle,
  ExitToApp,
  Speed as SpeedIcon,
  Article as NewsIcon,
  Psychology as SuperNovaIcon,
  BarChart as ChartsIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

interface AppShellProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const CustomIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Box
    sx={{
      width: 20,
      height: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <img 
      src={src} 
      alt={alt}
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'contain',
        filter: src.includes('.svg') 
          ? 'brightness(0) saturate(100%) invert(85%) sepia(15%) saturate(1000%) hue-rotate(200deg) brightness(90%) contrast(90%)'
          : 'brightness(1.2) contrast(1.2) saturate(1.1)'
      }}
    />
  </Box>
);

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', description: 'Overview & key metrics' },
  { text: 'Charts', icon: <ChartsIcon />, path: '/charts', description: 'Advanced charting with indicators' },
  { text: 'Trading', icon: <CustomIcon src="/theme/icon_uptrend_white.svg" alt="Trading" />, path: '/trading', description: 'Advanced trading interface' },
  { text: 'Original App', icon: <OriginalIcon />, path: '/original', description: 'Your existing trading app' },
  { text: 'Portfolio', icon: <PortfolioIcon />, path: '/portfolio', description: 'Portfolio management' },
  { text: 'Analytics', icon: <CustomIcon src="/theme/icon_bars_white.svg" alt="Analytics" />, path: '/analytics', description: 'Performance analytics' },
  { text: 'News', icon: <NewsIcon />, path: '/news', description: 'Market news & insights' },
  { text: 'SuperNova AI', icon: <SuperNovaIcon />, path: '/supernova', description: 'AI-powered trading assistant' },
  { text: 'Alerts', icon: <CustomIcon src="/theme/icon_bell_white.svg" alt="Alerts" />, path: '/alerts', description: 'Price & trade alerts' },
];

const bottomItems = [
  { text: 'Settings', icon: <CustomIcon src="/theme/icon_gear_white.svg" alt="Settings" />, path: '/settings', description: 'App configuration' },
];

export function AppShell({ children, sidebarOpen, onSidebarToggle }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = React.useState(true);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd update the theme context here
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo/Brand Area */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="/theme/banner_logo.png" 
            alt="NovaSignal" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              maxHeight: '60px'
            }}
          />
        </Box>
      </Box>

      {/* Performance Indicator */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SpeedIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={500}>
            System Status
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: 'success.main',
            animation: 'pulse 2s infinite' 
          }} />
          <Typography variant="caption" color="success.main">
            All systems operational
          </Typography>
        </Box>
      </Box>

      {/* Main Navigation */}
      <List sx={{ flex: 1, pt: 1 }}>
        {navigationItems.map((item) => (
          <Tooltip key={item.text} title={item.description} placement="right">
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isCurrentPath(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isCurrentPath(item.path) ? 600 : 400,
                  }}
                />
                {item.path === '/alerts' && (
                  <Badge badgeContent={3} color="error" variant="dot" />
                )}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* Bottom Items */}
      <Divider sx={{ mx: 2 }} />
      <List>
        {bottomItems.map((item) => (
          <Tooltip key={item.text} title={item.description} placement="right">
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isCurrentPath(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isCurrentPath(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { sm: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onSidebarToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'NovaSignal'}
          </Typography>

          {/* Market Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Market Status
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={500}>
                OPEN
              </Typography>
            </Box>
          </Box>

          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={handleThemeToggle} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Alerts Badge */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={5} color="error">
              <AlertsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              KR
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <AccountCircle sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <SettingsIcon sx={{ mr: 2 }} />
              Account Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose}>
              <ExitToApp sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: sidebarOpen ? DRAWER_WIDTH : 0 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
              backgroundImage: 'url(/theme/bg_left_large.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(26, 27, 58, 0.85)', // Semi-transparent overlay
                zIndex: -1,
              },
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { sm: sidebarOpen ? 0 : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundImage: 'url(/theme/bg_right_large.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 15, 35, 0.75)', // Semi-transparent overlay
            zIndex: 0,
          },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ 
          height: 'calc(100vh - 64px)', 
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}