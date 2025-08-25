import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Timeline,
  Notifications,
  Refresh,
  Launch,
} from '@mui/icons-material';

const marketData = [
  { symbol: 'BTC/USDT', price: '$45,234.56', change: '+2.34%', positive: true },
  { symbol: 'ETH/USDT', price: '$2,834.78', change: '-1.23%', positive: false },
  { symbol: 'AAPL', price: '$178.45', change: '+0.87%', positive: true },
  { symbol: 'TSLA', price: '$245.67', change: '+3.21%', positive: true },
];

const portfolioStats = [
  { label: 'Total Value', value: '$127,534.89', change: '+$2,345.67', positive: true },
  { label: 'Today P&L', value: '+$1,234.56', change: '+2.1%', positive: true },
  { label: 'Total Trades', value: '847', change: '+23', positive: true },
  { label: 'Win Rate', value: '67.3%', change: '+1.2%', positive: true },
];

const recentAlerts = [
  { type: 'Price Alert', message: 'BTC crossed $45,000', time: '2 min ago', severity: 'success' },
  { type: 'Trade Signal', message: 'RSI oversold on ETH', time: '5 min ago', severity: 'warning' },
  { type: 'News Alert', message: 'Fed announces rate decision', time: '15 min ago', severity: 'info' },
];

export function Dashboard() {
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Welcome back, Kayden! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your portfolio today.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Launch />}
              onClick={() => window.open('/original', '_blank')}
            >
              Open Original App
            </Button>
            <IconButton color="primary">
              <Refresh />
            </IconButton>
          </Box>
        </Box>
        
        {/* Market Status Bar */}
        <Paper sx={{ p: 2, bgcolor: 'success.dark', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.light', animation: 'pulse 2s infinite' }} />
              <Typography variant="body2" fontWeight={500}>
                Markets are OPEN
              </Typography>
            </Box>
            <Typography variant="caption">
              NYSE closes in 4h 23m
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* Portfolio Overview */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Portfolio Overview
          </Typography>
        </Grid>
        
        {portfolioStats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  {stat.positive ? 
                    <TrendingUp color="success" fontSize="small" /> :
                    <TrendingDown color="error" fontSize="small" />
                  }
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {stat.value}
                </Typography>
                <Chip
                  label={stat.change}
                  size="small"
                  color={stat.positive ? 'success' : 'error'}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Market Watchlist */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Market Watchlist
                </Typography>
                <IconButton size="small">
                  <Refresh />
                </IconButton>
              </Box>
              <List>
                {marketData.map((item, index) => (
                  <React.Fragment key={item.symbol}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {item.positive ? 
                          <TrendingUp color="success" /> :
                          <TrendingDown color="error" />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={item.symbol}
                        secondary={item.price}
                      />
                      <Chip
                        label={item.change}
                        size="small"
                        color={item.positive ? 'success' : 'error'}
                        variant={item.positive ? 'filled' : 'outlined'}
                      />
                    </ListItem>
                    {index < marketData.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                startIcon={<Timeline />}
              >
                View Full Charts
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Alerts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Alerts
                </Typography>
                <IconButton size="small">
                  <Notifications />
                </IconButton>
              </Box>
              <List>
                {recentAlerts.map((alert, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip 
                              label={alert.type} 
                              size="small" 
                              color={alert.severity as any}
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {alert.time}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2">
                            {alert.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentAlerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
              >
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart Placeholder */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Portfolio Performance (Last 30 Days)
              </Typography>
              <Box sx={{ 
                height: 300, 
                bgcolor: 'background.default', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'primary.main'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Timeline sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Interactive Chart Coming Soon
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This area will show your portfolio performance over time
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    startIcon={<Launch />}
                    onClick={() => window.open('/original', '_blank')}
                  >
                    View in Original App
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Theme Showcase */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🎨 NovaSignal Theme Assets
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 3, justifyContent: 'center' }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  minWidth: 100
                }}>
                  <img 
                    src="/theme/icon_bars.png" 
                    alt="Analytics" 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      marginBottom: 12,
                      filter: 'brightness(1.2) contrast(1.2)'
                    }} 
                  />
                  <Typography variant="body2" fontWeight={500}>Analytics</Typography>
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  minWidth: 100
                }}>
                  <img 
                    src="/theme/icon_uptrend.png" 
                    alt="Trading" 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      marginBottom: 12,
                      filter: 'brightness(1.2) contrast(1.2)'
                    }} 
                  />
                  <Typography variant="body2" fontWeight={500}>Uptrend</Typography>
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  minWidth: 100
                }}>
                  <img 
                    src="/theme/icon_bell.png" 
                    alt="Alerts" 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      marginBottom: 12,
                      filter: 'brightness(1.2) contrast(1.2)'
                    }} 
                  />
                  <Typography variant="body2" fontWeight={500}>Alerts</Typography>
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  minWidth: 100
                }}>
                  <img 
                    src="/theme/icon_gear.png" 
                    alt="Settings" 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      marginBottom: 12,
                      filter: 'brightness(1.2) contrast(1.2)'
                    }} 
                  />
                  <Typography variant="body2" fontWeight={500}>Settings</Typography>
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  minWidth: 100
                }}>
                  <img 
                    src="/theme/icon_bulb.png" 
                    alt="Insights" 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      marginBottom: 12,
                      filter: 'brightness(1.2) contrast(1.2)'
                    }} 
                  />
                  <Typography variant="body2" fontWeight={500}>Insights</Typography>
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  minWidth: 100
                }}>
                  <img 
                    src="/theme/icon_key_tilt.png" 
                    alt="API Keys" 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      marginBottom: 12,
                      filter: 'brightness(1.2) contrast(1.2)'
                    }} 
                  />
                  <Typography variant="body2" fontWeight={500}>API Keys</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Custom theme assets have been integrated throughout the interface:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" color="text.secondary">🖼️ Background graphics in sidebar and main content area</Typography>
                <Typography component="li" variant="body2" color="text.secondary">🏷️ Custom NovaSignal banner logo in navigation</Typography>
                <Typography component="li" variant="body2" color="text.secondary">🎯 Themed icons for Trading, Analytics, Alerts, and Settings</Typography>
                <Typography component="li" variant="body2" color="text.secondary">✨ Semi-transparent overlays for optimal readability</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}