import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save,
  TestTube,
  Refresh,
  Key,
  Palette,
  Tune,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/appStore';

const Settings = () => {
  const {
    settings,
    connectionStatus,
    updateSettings,
    testConnection,
  } = useAppStore();

  const [localSettings, setLocalSettings] = useState(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      // Save current settings first
      if (hasChanges) {
        await updateSettings(localSettings);
        setHasChanges(false);
      }
      await testConnection();
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const updateLocalSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateOverlaySetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      overlaySettings: {
        ...prev.overlaySettings,
        [key]: value
      }
    }));
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your AI assistant and preferences
        </Typography>
      </Box>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            }
          >
            You have unsaved changes
          </Alert>
        </motion.div>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Key />} label="API & Models" />
          <Tab icon={<Palette />} label="Overlay" />
          <Tab icon={<Tune />} label="Behavior" />
        </Tabs>

        {/* API & Models Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* API Configuration */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    OpenRouter API Configuration
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="API Key"
                        type={showApiKey ? 'text' : 'password'}
                        value={localSettings.apiKey}
                        onChange={(e) => updateLocalSetting('apiKey', e.target.value)}
                        helperText="Get your API key from openrouter.ai"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowApiKey(!showApiKey)}
                                edge="end"
                              >
                                {showApiKey ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                      <FormControl fullWidth>
                        <InputLabel>AI Model</InputLabel>
                        <Select
                          value={localSettings.model}
                          label="AI Model"
                          onChange={(e) => updateLocalSetting('model', e.target.value)}
                        >
                          <MenuItem value="openai/gpt-4-turbo-preview">GPT-4 Turbo (Recommended)</MenuItem>
                          <MenuItem value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                          <MenuItem value="anthropic/claude-3-sonnet">Claude 3 Sonnet</MenuItem>
                          <MenuItem value="anthropic/claude-3-haiku">Claude 3 Haiku</MenuItem>
                          <MenuItem value="meta-llama/llama-3-70b-instruct">Llama 3 70B</MenuItem>
                          <MenuItem value="mistralai/mixtral-8x7b-instruct">Mixtral 8x7B</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={isTesting ? <Refresh className="spin" /> : <TestTube />}
                        onClick={handleTest}
                        disabled={isTesting || !localSettings.apiKey}
                        color={connectionStatus === 'connected' ? 'success' : 'primary'}
                      >
                        {isTesting ? 'Testing...' : 'Test Connection'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Response Configuration */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Response Configuration
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Answer Style</InputLabel>
                        <Select
                          value={localSettings.answerStyle}
                          label="Answer Style"
                          onChange={(e) => updateLocalSetting('answerStyle', e.target.value)}
                        >
                          <MenuItem value="concise">Concise</MenuItem>
                          <MenuItem value="detailed">Detailed</MenuItem>
                          <MenuItem value="bullet">Bullet Points</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Job Description"
                        value={localSettings.jobDescription}
                        onChange={(e) => updateLocalSetting('jobDescription', e.target.value)}
                        helperText="Paste the job description to get tailored answers"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Your Resume/Experience"
                        value={localSettings.resume}
                        onChange={(e) => updateLocalSetting('resume', e.target.value)}
                        helperText="Add your background to personalize responses"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Overlay Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overlay Appearance
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Width: {localSettings.overlaySettings.width}px</Typography>
                    <Slider
                      value={localSettings.overlaySettings.width}
                      min={300}
                      max={800}
                      onChange={(e, value) => updateOverlaySetting('width', value)}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Height: {localSettings.overlaySettings.height}px</Typography>
                    <Slider
                      value={localSettings.overlaySettings.height}
                      min={200}
                      max={600}
                      onChange={(e, value) => updateOverlaySetting('height', value)}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Opacity: {Math.round(localSettings.overlaySettings.opacity * 100)}%</Typography>
                    <Slider
                      value={localSettings.overlaySettings.opacity}
                      min={0.1}
                      max={1}
                      step={0.1}
                      onChange={(e, value) => updateOverlaySetting('opacity', value)}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Font Size: {localSettings.overlaySettings.fontSize}px</Typography>
                    <Slider
                      value={localSettings.overlaySettings.fontSize}
                      min={10}
                      max={24}
                      onChange={(e, value) => updateOverlaySetting('fontSize', value)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overlay Behavior
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>
                      Auto-hide Duration: {Math.round(localSettings.overlaySettings.autoHideDuration / 1000)}s
                    </Typography>
                    <Slider
                      value={localSettings.overlaySettings.autoHideDuration}
                      min={5000}
                      max={60000}
                      step={1000}
                      onChange={(e, value) => updateOverlaySetting('autoHideDuration', value)}
                    />
                  </Box>
                  
                  <Alert severity="info">
                    The overlay is designed to be undetectable in screen sharing and video calls.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Behavior Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    General Behavior
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Global Hotkey"
                        value={localSettings.hotkey}
                        onChange={(e) => updateLocalSetting('hotkey', e.target.value)}
                        helperText="Hotkey to toggle listening (e.g., Ctrl+Shift+I)"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localSettings.autoStart}
                            onChange={(e) => updateLocalSetting('autoStart', e.target.checked)}
                          />
                        }
                        label="Auto-start listening when app opens"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Specialization"
                        value={localSettings.specialization}
                        onChange={(e) => updateLocalSetting('specialization', e.target.value)}
                        helperText="Your area of expertise (e.g., Frontend, Backend, DevOps, ML)"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={!hasChanges}
        >
          Reset Changes
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;