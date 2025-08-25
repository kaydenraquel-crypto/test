import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Notifications, Launch } from '@mui/icons-material';

export function Alerts() {
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Smart Alerts & Notifications
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Set up intelligent alerts for price movements, technical indicators, and market events.
      </Typography>
      
      <Card sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Notifications sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Alert System Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Advanced alert management with custom triggers, notifications, and automated actions.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Launch />}
            onClick={() => window.open('/original', '_blank')}
          >
            Configure Alerts in Original App
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}