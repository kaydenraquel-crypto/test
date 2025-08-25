import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ButtonGroup,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  AccountBalance,
  Timer,
  Warning,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function Trading() {
  const [tabValue, setTabValue] = useState(0);
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('1.0');
  const [price, setPrice] = useState('45234.56');
  const [leverage, setLeverage] = useState(1);
  const [stopLoss, setStopLoss] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openOrders = [
    { id: '1', pair: 'BTC/USDT', type: 'BUY', amount: '0.5', price: '$44,000', status: 'pending' },
    { id: '2', pair: 'ETH/USDT', type: 'SELL', amount: '2.0', price: '$2,850', status: 'partial' },
    { id: '3', pair: 'AAPL', type: 'BUY', amount: '100', price: '$180.00', status: 'pending' },
  ];

  const recentTrades = [
    { pair: 'BTC/USDT', type: 'BUY', amount: '0.25', price: '$45,100', time: '10:23:45', pnl: '+$125.50' },
    { pair: 'ETH/USDT', type: 'SELL', amount: '1.5', price: '$2,820', time: '10:18:32', pnl: '-$45.20' },
    { pair: 'SOL/USDT', type: 'BUY', amount: '10', price: '$98.50', time: '10:15:21', pnl: '+$78.90' },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Advanced Trading Interface
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Professional trading tools with advanced order types and risk management
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Chart Placeholder */}
        <Grid xs={12} size={{ lg: 8 }}>
          <Card sx={{ height: '500px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Price Chart - BTC/USDT
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label="1H" size="small" variant="filled" color="primary" />
                  <Chip label="4H" size="small" variant="outlined" />
                  <Chip label="1D" size="small" variant="outlined" />
                  <Chip label="1W" size="small" variant="outlined" />
                </Box>
              </Box>
              
              <Box sx={{ 
                height: '400px', 
                bgcolor: 'background.default', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'primary.main'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <ShowChart sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    TradingView Chart Integration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Advanced charting with technical indicators
                  </Typography>
                  <Button variant="contained" startIcon={<ShowChart />}>
                    Load Chart Widget
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trading Panel */}
        <Grid xs={12} size={{ lg: 4 }}>
          <Card sx={{ height: '500px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Trade Order
              </Typography>
              
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Buy" />
                <Tab label="Sell" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Order Type</InputLabel>
                    <Select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                      <MenuItem value="market">Market Order</MenuItem>
                      <MenuItem value="limit">Limit Order</MenuItem>
                      <MenuItem value="stop">Stop Order</MenuItem>
                      <MenuItem value="stop_limit">Stop-Limit Order</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    fullWidth
                    InputProps={{
                      endAdornment: <Typography variant="body2" color="text.secondary">BTC</Typography>
                    }}
                  />

                  {orderType !== 'market' && (
                    <TextField
                      label="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: <Typography variant="body2" color="text.secondary">$</Typography>
                      }}
                    />
                  )}

                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Leverage: {leverage}x
                    </Typography>
                    <Slider
                      value={leverage}
                      onChange={(e, value) => setLeverage(value as number)}
                      min={1}
                      max={100}
                      marks={[
                        { value: 1, label: '1x' },
                        { value: 10, label: '10x' },
                        { value: 50, label: '50x' },
                        { value: 100, label: '100x' },
                      ]}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={stopLoss}
                        onChange={(e) => setStopLoss(e.target.checked)}
                      />
                    }
                    label="Enable Stop Loss"
                  />

                  {stopLoss && (
                    <TextField
                      label="Stop Loss Price"
                      fullWidth
                      InputProps={{
                        startAdornment: <Typography variant="body2" color="text.secondary">$</Typography>
                      }}
                    />
                  )}

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="caption" display="block">
                        Estimated cost: $45,234.56
                      </Typography>
                      <Typography variant="caption" display="block">
                        Available balance: $50,000.00
                      </Typography>
                    </Box>
                  </Alert>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    color="success"
                    startIcon={<TrendingUp />}
                  >
                    Buy BTC
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Similar sell form would go here */}
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    Sell order form (similar to buy form)
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    color="error"
                    startIcon={<TrendingDown />}
                  >
                    Sell BTC
                  </Button>
                </Box>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>

        {/* Open Orders */}
        <Grid xs={12} size={{ md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Open Orders
              </Typography>
              <List>
                {openOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {order.pair}
                            </Typography>
                            <Chip 
                              label={order.type} 
                              size="small" 
                              color={order.type === 'BUY' ? 'success' : 'error'}
                              variant="outlined"
                            />
                            <Chip 
                              label={order.status} 
                              size="small" 
                              color={order.status === 'pending' ? 'warning' : 'info'}
                              variant="filled"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Amount: {order.amount} | Price: {order.price}
                          </Typography>
                        }
                      />
                      <Button size="small" color="error" variant="outlined">
                        Cancel
                      </Button>
                    </ListItem>
                    {index < openOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Trades */}
        <Grid xs={12} size={{ md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Trades
              </Typography>
              <List>
                {recentTrades.map((trade, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {trade.pair}
                        </Typography>
                        <Chip 
                          label={trade.type} 
                          size="small" 
                          color={trade.type === 'BUY' ? 'success' : 'error'}
                          variant="filled"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {trade.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          {trade.amount} @ {trade.price}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={trade.pnl.startsWith('+') ? 'success.main' : 'error.main'}
                          fontWeight={500}
                        >
                          {trade.pnl}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < recentTrades.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}