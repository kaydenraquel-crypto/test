import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  TextField,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Save, Restore, Security } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    notifications: true,
    soundEnabled: false,
    autoSave: true,
    defaultLeverage: 1,
    riskWarnings: true,
    apiKeysConfigured: true,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Settings & Configuration
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Customize your trading experience and manage your account preferences.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="General" />
          <Tab label="Trading" />
          <Tab label="Security" />
          <Tab label="API Keys" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Preferences
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <MenuItem value="dark">Dark Theme</MenuItem>
                    <MenuItem value="light">Light Theme</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="zh">Chinese</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                  }
                  label="Enable Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                    />
                  }
                  label="Sound Alerts"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                  }
                  label="Auto-save Workspace"
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" startIcon={<Save />}>
                    Save Changes
                  </Button>
                  <Button variant="outlined" startIcon={<Restore />}>
                    Reset to Defaults
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trading Preferences
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Default Leverage</InputLabel>
                  <Select
                    value={settings.defaultLeverage}
                    onChange={(e) => handleSettingChange('defaultLeverage', e.target.value)}
                  >
                    <MenuItem value={1}>1x (No Leverage)</MenuItem>
                    <MenuItem value={2}>2x</MenuItem>
                    <MenuItem value={5}>5x</MenuItem>
                    <MenuItem value={10}>10x</MenuItem>
                    <MenuItem value={20}>20x</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.riskWarnings}
                      onChange={(e) => handleSettingChange('riskWarnings', e.target.checked)}
                    />
                  }
                  label="Show Risk Warnings"
                />

                <TextField
                  label="Default Stop Loss (%)"
                  type="number"
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 50 } }}
                />

                <TextField
                  label="Default Take Profit (%)"
                  type="number"
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />

                <Alert severity="warning">
                  <Typography variant="body2">
                    Trading with leverage involves significant risk. Only use leverage if you understand the risks involved.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Security color="primary" />
                <Typography variant="h6">
                  Security Settings
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Your security settings are managed by the NovaSignal installer and cannot be changed here.
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    API Key Encryption: <strong>AES-256 ✅</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your API keys are encrypted and stored securely
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Secure Communication: <strong>HTTPS/WSS ✅</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All data transmission is encrypted
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Auto-Update: <strong>Enabled ✅</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Security updates are installed automatically
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API Key Configuration
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                API keys are managed through the secure NovaSignal installer wizard. 
                Changes here will not affect your actual API configuration.
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Alpha Vantage API
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    ✅ Configured and Active
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Binance API
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    ✅ Configured and Active
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Polygon.io API
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    ⚠️ Not Configured
                  </Typography>
                </Box>

                <Button variant="outlined" disabled>
                  Reconfigure API Keys (Use Installer)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Box>
  );
}