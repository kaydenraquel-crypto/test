import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { AccountBalance, Launch } from '@mui/icons-material';

export function Portfolio() {
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Portfolio Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Track your investments, analyze performance, and manage risk across all your assets.
      </Typography>
      
      <Card sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <AccountBalance sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Portfolio Dashboard Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Advanced portfolio analytics, asset allocation, and performance tracking will be available here.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Launch />}
            onClick={() => window.open('/original', '_blank')}
          >
            View Current Portfolio in Original App
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}