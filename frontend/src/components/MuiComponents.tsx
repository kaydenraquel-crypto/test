// Enhanced MUI Components for NovaSignal App
// Phase 1 of MUI Design System Standardization

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Paper,
  Divider,
  Container,
  Stack,
  Tooltip,
  Alert,
  CircularProgress,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Refresh,
  Settings,
  TrendingUp,
  TrendingDown,
  Circle,
  Delete,
  Visibility,
  VisibilityOff,
  Warning,
  CheckCircle,
  Error,
  Info,
  NotificationsActive,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { designTokens } from '../theme/designTokens'

// Trading-specific styled components
export const TradingCard = styled(Card)(({ theme }) => ({
  borderRadius: designTokens.borderRadius.large,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}))

export const PriceDisplayCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: designTokens.borderRadius.large,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}))

// Market status indicator
interface MarketStatusProps {
  status: 'connected' | 'connecting' | 'reconnecting' | 'error' | 'failed' | 'disconnected'
  lastConnected?: Date
  isReconnecting?: boolean
  reconnectAttempts?: number
  onReconnect?: () => void
}

export const MarketStatusIndicator: React.FC<MarketStatusProps> = ({
  status,
  lastConnected,
  isReconnecting,
  reconnectAttempts = 0,
  onReconnect
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return designTokens.colors.status.connected
      case 'connecting': return designTokens.colors.status.connecting
      case 'reconnecting': return designTokens.colors.status.reconnecting
      case 'error': return designTokens.colors.status.error
      case 'failed': return designTokens.colors.status.failed
      default: return designTokens.colors.status.disconnected
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return `Connected${lastConnected ? ` (${lastConnected.toLocaleTimeString()})` : ''}`
      case 'connecting': return 'Connecting...'
      case 'reconnecting': return `Reconnecting... (${reconnectAttempts}/15)`
      case 'error': return 'Connection Error'
      case 'failed': return 'Connection Failed'
      default: return 'Disconnected'
    }
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Tooltip title={getStatusText()}>
        <Circle 
          sx={{ 
            fontSize: 12, 
            color: getStatusColor(),
            animation: isReconnecting ? 'pulse 1s infinite' : 'none'
          }} 
        />
      </Tooltip>
      
      {(status === 'error' || status === 'failed') && onReconnect && (
        <Button
          size="small"
          variant="outlined"
          onClick={onReconnect}
          startIcon={<Refresh />}
          sx={{ fontSize: 11, py: 0.5 }}
        >
          Reconnect
        </Button>
      )}
      
      {isReconnecting && (
        <Typography variant="caption" color="text.secondary">
          {reconnectAttempts}/15
        </Typography>
      )}
    </Stack>
  )
}

// Symbol input with validation
interface SymbolInputProps {
  value: string
  onChange: (value: string) => void
  market: 'crypto' | 'stocks'
  isValid: boolean
  error?: string
}

export const SymbolInput: React.FC<SymbolInputProps> = ({
  value,
  onChange,
  market,
  isValid,
  error
}) => {
  const placeholder = market === 'crypto' ? 'e.g., ETH/USD' : 'e.g., AAPL'
  
  return (
    <TextField
      variant="symbol" // Custom variant defined in designTokens
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      placeholder={placeholder}
      error={!isValid && !!value}
      helperText={!isValid && value ? error : ''}
      sx={{ 
        minWidth: 160,
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
        }
      }}
      size="small"
    />
  )
}

// Trading action buttons
export const TradingButton = styled(Button)(({ theme, color }) => ({
  fontWeight: designTokens.typography.fontWeight.semibold,
  borderRadius: designTokens.borderRadius.medium,
  textTransform: 'uppercase',
  minWidth: 80,
  ...(color === 'success' && {
    backgroundColor: designTokens.colors.trading.buy,
    color: 'white',
    '&:hover': {
      backgroundColor: designTokens.colors.trading.profit,
    },
  }),
  ...(color === 'error' && {
    backgroundColor: designTokens.colors.trading.sell,
    color: 'white',
    '&:hover': {
      backgroundColor: designTokens.colors.trading.loss,
    },
  }),
}))

// Price change chip
interface PriceChangeChipProps {
  change: number
  changePercent?: number
  size?: 'small' | 'medium'
}

export const PriceChangeChip: React.FC<PriceChangeChipProps> = ({
  change,
  changePercent,
  size = 'small'
}) => {
  const isPositive = change >= 0
  const displayText = changePercent 
    ? `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`
    : `${isPositive ? '+' : ''}$${Math.abs(change).toFixed(2)}`

  return (
    <Chip
      label={displayText}
      size={size}
      variant={isPositive ? 'trading-positive' : 'trading-negative'} // Custom variants
      icon={isPositive ? <TrendingUp /> : <TrendingDown />}
    />
  )
}

// Control panel layout
export const ControlPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: designTokens.borderRadius.large,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}))

// Stats display component
interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changePercent?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changePercent,
  trend = 'neutral',
  icon
}) => {
  return (
    <Card elevation={1}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon}
        </Stack>
        
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {value}
        </Typography>
        
        {(change !== undefined || changePercent !== undefined) && (
          <Stack direction="row" alignItems="center" spacing={1}>
            {trend === 'up' && <TrendingUp color="success" fontSize="small" />}
            {trend === 'down' && <TrendingDown color="error" fontSize="small" />}
            
            {changePercent !== undefined && (
              <Typography
                variant="caption"
                color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
                fontWeight={500}
              >
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </Typography>
            )}
            
            {change !== undefined && (
              <Typography
                variant="caption"
                color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
              >
                {change >= 0 ? '+' : ''}${change.toFixed(2)}
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

// Alert notification component
interface AlertNotificationProps {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  details?: string
  onClose?: () => void
  retryCount?: number
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  type,
  message,
  details,
  onClose,
  retryCount
}) => {
  return (
    <Alert
      severity={type}
      onClose={onClose}
      sx={{
        position: 'fixed',
        top: { xs: 8, md: 16 },
        right: { xs: 8, md: 16 },
        left: { xs: 8, md: 'auto' },
        maxWidth: { xs: 'calc(100vw - 16px)', md: 400 },
        zIndex: 1400,
        boxShadow: 4,
      }}
    >
      <Typography variant="body2" fontWeight={500}>
        {message}
      </Typography>
      {details && (
        <Typography variant="caption" display="block" color="text.secondary">
          {details}
        </Typography>
      )}
      {retryCount !== undefined && retryCount > 0 && (
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Retry attempts: {retryCount}
        </Typography>
      )}
    </Alert>
  )
}

// Loading skeleton for charts
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 400 }) => (
  <Box>
    <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2, mb: 1 }} />
    <Stack direction="row" spacing={1}>
      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
    </Stack>
  </Box>
)

// Data panel loading skeleton
export const DataPanelSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Stack spacing={1}>
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i} display="flex" alignItems="center" spacing={2}>
        <Skeleton variant="circular" width={24} height={24} />
        <Box flex={1}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
        <Skeleton variant="text" width={80} height={20} />
      </Box>
    ))}
  </Stack>
)

// Signals list component
interface SignalsListProps {
  signals: Array<{
    ts: number
    type: 'buy' | 'sell'
    price: number
    reason: string
    tag?: string
  }>
  isLoading?: boolean
}

export const SignalsList: React.FC<SignalsListProps> = ({ signals, isLoading }) => {
  if (isLoading && signals.length === 0) {
    return <DataPanelSkeleton rows={5} />
  }

  return (
    <List dense>
      {signals.map((signal, index) => (
        <ListItem key={index} divider={index < signals.length - 1}>
          <ListItemIcon>
            {signal.type === 'buy' ? (
              <TrendingUp color="success" />
            ) : (
              <TrendingDown color="error" />
            )}
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  label={signal.type.toUpperCase()}
                  size="small"
                  color={signal.type === 'buy' ? 'success' : 'error'}
                  variant="filled"
                />
                <Typography variant="body2" fontWeight={500}>
                  ${signal.price.toFixed(2)}
                </Typography>
                {signal.tag && (
                  <Chip label={signal.tag} size="small" variant="outlined" />
                )}
              </Stack>
            }
            secondary={
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {signal.reason}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {new Date(Number(signal.ts) * 1000).toLocaleTimeString()}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  )
}

// Grid layout component for responsive design
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode
  spacing?: number
}> = ({ children, spacing = 3 }) => (
  <Grid container spacing={spacing}>
    {children}
  </Grid>
)

export default {
  TradingCard,
  PriceDisplayCard,
  MarketStatusIndicator,
  SymbolInput,
  TradingButton,
  PriceChangeChip,
  ControlPanel,
  StatsCard,
  AlertNotification,
  ChartSkeleton,
  DataPanelSkeleton,
  SignalsList,
  ResponsiveGrid,
}