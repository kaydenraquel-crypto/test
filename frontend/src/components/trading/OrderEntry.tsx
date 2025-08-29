import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  Chip,
  Divider,
  ButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Speed,
  Schedule,
  Warning,
  Info,
  Calculate,
  Security,
} from '@mui/icons-material';
import { OrderRequest, OrderType, OrderSide, TimeInForce, MarketData } from '../../types/trading';

interface OrderEntryProps {
  marketData?: MarketData;
  availableBalance: number;
  onSubmitOrder: (order: OrderRequest) => Promise<void>;
  onValidateOrder?: (order: OrderRequest) => string | null;
  tradingMode: 'paper' | 'live';
  maxLeverage?: number;
  minQuantity?: number;
  tickSize?: number;
  className?: string;
}

export const OrderEntry: React.FC<OrderEntryProps> = ({
  marketData,
  availableBalance,
  onSubmitOrder,
  onValidateOrder,
  tradingMode,
  maxLeverage = 100,
  minQuantity = 0.001,
  tickSize = 0.01,
  className,
}) => {
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [trailingAmount, setTrailingAmount] = useState<string>('');
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('GTC');
  const [leverage, setLeverage] = useState<number>(1);
  const [usePercentage, setUsePercentage] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(25);
  const [postOnly, setPostOnly] = useState<boolean>(false);
  const [reduceOnly, setReduceOnly] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate estimated values
  const estimatedCost = useCallback(() => {
    if (!quantity || !marketData) return 0;
    const qty = parseFloat(quantity);
    const priceToUse = orderType === 'market' 
      ? (side === 'buy' ? marketData.ask : marketData.bid)
      : parseFloat(price) || marketData.lastPrice;
    return qty * priceToUse * (side === 'buy' ? 1 : 1);
  }, [quantity, price, orderType, side, marketData]);

  const estimatedMargin = useCallback(() => {
    return estimatedCost() / leverage;
  }, [estimatedCost, leverage]);

  // Update price when market data changes
  useEffect(() => {
    if (marketData && orderType === 'limit' && !price) {
      setPrice(marketData.lastPrice.toFixed(2));
    }
  }, [marketData, orderType, price]);

  // Calculate quantity from percentage
  useEffect(() => {
    if (usePercentage && marketData && availableBalance) {
      const availableForOrder = availableBalance * (percentage / 100);
      const priceToUse = side === 'buy' ? marketData.ask : marketData.bid;
      const calculatedQty = (availableForOrder * leverage) / priceToUse;
      setQuantity(calculatedQty.toFixed(6));
    }
  }, [usePercentage, percentage, availableBalance, marketData, leverage, side]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const orderRequest: OrderRequest = {
      symbol: marketData?.symbol || '',
      side,
      type: orderType,
      quantity: parseFloat(quantity),
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      stopPrice: (orderType === 'stop' || orderType === 'stop_limit') ? parseFloat(stopPrice) : undefined,
      trailingAmount: orderType === 'trailing_stop' ? parseFloat(trailingAmount) : undefined,
      timeInForce,
      postOnly,
      reduceOnly,
    };

    // Validate order
    if (onValidateOrder) {
      const error = onValidateOrder(orderRequest);
      if (error) {
        setValidationError(error);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setValidationError(null);
      await onSubmitOrder(orderRequest);
      
      // Reset form on successful submission
      setQuantity('');
      setPrice('');
      setStopPrice('');
      setTrailingAmount('');
      setPercentage(25);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Order submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmountButtons = [25, 50, 75, 100];

  return (
    <Card className={className} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Order Entry
          </Typography>
          <Chip 
            label={tradingMode.toUpperCase()} 
            size="small"
            color={tradingMode === 'live' ? 'error' : 'info'}
            variant="filled"
          />
        </Box>

        {/* Buy/Sell Toggle */}
        <ButtonGroup fullWidth sx={{ mb: 2 }}>
          <Button
            variant={side === 'buy' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => setSide('buy')}
            startIcon={<TrendingUp />}
          >
            Buy
          </Button>
          <Button
            variant={side === 'sell' ? 'contained' : 'outlined'}
            color="error"
            onClick={() => setSide('sell')}
            startIcon={<TrendingDown />}
          >
            Sell
          </Button>
        </ButtonGroup>

        {/* Market Data Display */}
        {marketData && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {marketData.symbol}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Box>
                <Typography variant="caption" display="block">Bid</Typography>
                <Typography variant="body2" color="error.main" fontWeight={500}>
                  ${marketData.bid.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="caption" display="block">Last</Typography>
                <Typography variant="body2" fontWeight={600}>
                  ${marketData.lastPrice.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" display="block">Ask</Typography>
                <Typography variant="body2" color="success.main" fontWeight={500}>
                  ${marketData.ask.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Order Type */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Order Type</InputLabel>
          <Select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
          >
            <MenuItem value="market">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed fontSize="small" />
                Market Order
              </Box>
            </MenuItem>
            <MenuItem value="limit">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calculate fontSize="small" />
                Limit Order
              </Box>
            </MenuItem>
            <MenuItem value="stop">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning fontSize="small" />
                Stop Order
              </Box>
            </MenuItem>
            <MenuItem value="stop_limit">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security fontSize="small" />
                Stop-Limit Order
              </Box>
            </MenuItem>
            <MenuItem value="trailing_stop">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule fontSize="small" />
                Trailing Stop
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Quantity Section */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={usePercentage}
                onChange={(e) => setUsePercentage(e.target.checked)}
                size="small"
              />
            }
            label="Use Percentage"
            sx={{ mb: 1 }}
          />

          {usePercentage ? (
            <Box>
              <Typography variant="body2" gutterBottom>
                Balance: {percentage}%
              </Typography>
              <Slider
                value={percentage}
                onChange={(_, value) => setPercentage(value as number)}
                min={1}
                max={100}
                marks={quickAmountButtons.map(p => ({ value: p, label: `${p}%` }))}
                valueLabelDisplay="auto"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                {quickAmountButtons.map((percent) => (
                  <Button
                    key={percent}
                    size="small"
                    variant={percentage === percent ? 'contained' : 'outlined'}
                    onClick={() => setPercentage(percent)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    {percent}%
                  </Button>
                ))}
              </Box>
            </Box>
          ) : null}

          <TextField
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ step: minQuantity, min: minQuantity }}
            InputProps={{
              endAdornment: marketData && (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    {marketData.symbol.split('/')[0]}
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Price Fields */}
        {orderType !== 'market' && (
          <TextField
            label="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ step: tickSize }}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        )}

        {(orderType === 'stop' || orderType === 'stop_limit') && (
          <TextField
            label="Stop Price"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            fullWidth
            type="number"
            inputProps={{ step: tickSize }}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        )}

        {orderType === 'trailing_stop' && (
          <TextField
            label="Trailing Amount"
            value={trailingAmount}
            onChange={(e) => setTrailingAmount(e.target.value)}
            fullWidth
            type="number"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        )}

        {/* Leverage */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Leverage: {leverage}x
          </Typography>
          <Slider
            value={leverage}
            onChange={(_, value) => setLeverage(value as number)}
            min={1}
            max={maxLeverage}
            marks={[
              { value: 1, label: '1x' },
              { value: 10, label: '10x' },
              { value: 50, label: '50x' },
              { value: maxLeverage, label: `${maxLeverage}x` },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Advanced Options */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Time in Force
          </Typography>
          <Select
            value={timeInForce}
            onChange={(e) => setTimeInForce(e.target.value as TimeInForce)}
            size="small"
            fullWidth
          >
            <MenuItem value="GTC">Good Till Canceled</MenuItem>
            <MenuItem value="IOC">Immediate or Cancel</MenuItem>
            <MenuItem value="FOK">Fill or Kill</MenuItem>
            <MenuItem value="DAY">Day Order</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={postOnly}
                onChange={(e) => setPostOnly(e.target.checked)}
                size="small"
              />
            }
            label="Post Only"
          />
          <FormControlLabel
            control={
              <Switch
                checked={reduceOnly}
                onChange={(e) => setReduceOnly(e.target.checked)}
                size="small"
              />
            }
            label="Reduce Only"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Order Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Estimated Cost:</Typography>
            <Typography variant="caption" fontWeight={500}>
              ${estimatedCost().toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Margin Required:</Typography>
            <Typography variant="caption" fontWeight={500}>
              ${estimatedMargin().toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Available Balance:</Typography>
            <Typography variant="caption" fontWeight={500}>
              ${availableBalance.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Validation Error */}
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        {/* Trading Mode Warning */}
        {tradingMode === 'live' && (
          <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
            <Typography variant="caption">
              Live Trading Mode - Real money will be used
            </Typography>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          color={side === 'buy' ? 'success' : 'error'}
          onClick={handleSubmit}
          disabled={!quantity || !marketData || isSubmitting}
          startIcon={side === 'buy' ? <TrendingUp /> : <TrendingDown />}
        >
          {isSubmitting ? 'Placing Order...' : `${side.toUpperCase()} ${marketData?.symbol || ''}`}
        </Button>
      </CardContent>
    </Card>
  );
};