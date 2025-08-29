import React, { useState } from 'react';
import { Button, Box, Typography, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import ErrorBoundary from './ErrorBoundary';

interface ErrorInjectionTestProps {
  onClose?: () => void;
}

// Component that throws different types of errors
const ErrorThrower = ({ errorType }: { errorType: string }) => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    switch (errorType) {
      case 'render':
        throw new Error('Simulated render error');
      case 'async':
        Promise.reject(new Error('Simulated async error'));
        break;
      case 'null':
        // @ts-ignore - Intentionally accessing property of null
        return null.someProperty;
      case 'memory':
        throw new Error('Simulated out of memory error');
      default:
        throw new Error('Generic test error');
    }
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
      <Typography variant="h6">Test Component ({errorType})</Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Click the button below to trigger a {errorType} error:
      </Typography>
      <Button 
        variant="contained" 
        color="error" 
        onClick={() => setShouldError(true)}
        size="small"
      >
        Trigger {errorType} Error
      </Button>
    </Box>
  );
};

const ErrorInjectionTest: React.FC<ErrorInjectionTestProps> = ({ onClose }) => {
  const [selectedIsolationLevel, setSelectedIsolationLevel] = useState<'global' | 'route' | 'component'>('component');

  const errorTypes = [
    { value: 'render', label: 'Render Error', description: 'Error thrown during component render' },
    { value: 'async', label: 'Async Error', description: 'Unhandled promise rejection' },
    { value: 'null', label: 'Null Reference', description: 'Accessing property of null/undefined' },
    { value: 'memory', label: 'Memory Error', description: 'Simulated memory-related error' },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Error Boundary Testing
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This component helps test the error boundary implementation. Each error type is wrapped in a separate 
        error boundary to demonstrate isolation levels.
      </Alert>

      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Isolation Level</InputLabel>
        <Select
          value={selectedIsolationLevel}
          label="Isolation Level"
          onChange={(e) => setSelectedIsolationLevel(e.target.value as any)}
        >
          <MenuItem value="global">Global</MenuItem>
          <MenuItem value="route">Route</MenuItem>
          <MenuItem value="component">Component</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="h5" gutterBottom>
        Error Test Cases
      </Typography>

      {errorTypes.map((errorType) => (
        <ErrorBoundary 
          key={errorType.value}
          isolationLevel={selectedIsolationLevel}
          onError={(error, errorInfo) => {
            console.log(`[ErrorBoundaryTest] ${errorType.label}:`, error.message);
            console.log('Error Info:', errorInfo);
          }}
        >
          <ErrorThrower errorType={errorType.value} />
        </ErrorBoundary>
      ))}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Testing Instructions
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li>Select an isolation level above (Component, Route, or Global)</li>
            <li>Click any "Trigger Error" button to simulate an error</li>
            <li>Observe how the error boundary handles the error</li>
            <li>Try the retry functionality</li>
            <li>Check browser console for error tracking logs</li>
            <li>Test error reporting functionality</li>
          </ol>
        </Typography>
      </Box>

      {onClose && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button variant="outlined" onClick={onClose}>
            Close Test
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ErrorInjectionTest;