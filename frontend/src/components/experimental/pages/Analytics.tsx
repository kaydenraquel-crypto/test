import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Analytics as AnalyticsIcon, Launch } from '@mui/icons-material';

export function Analytics() {
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Performance Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Deep dive into your trading performance with advanced analytics and insights.
      </Typography>
      
      <Card sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <AnalyticsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Analytics Dashboard Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comprehensive trading analytics, performance metrics, and AI-powered insights will be available here.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Launch />}
            onClick={() => window.open('/original', '_blank')}
          >
            View Analytics in Original App
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}