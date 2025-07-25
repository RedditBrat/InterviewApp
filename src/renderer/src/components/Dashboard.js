import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Mic,
  MicOff,
  Visibility,
  VisibilityOff,
  Speed,
  QuestionAnswer,
  TrendingUp,
  Settings as SettingsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

import { useAppStore } from '../store/appStore';

const Dashboard = () => {
  const {
    isListening,
    connectionStatus,
    settings,
    qaHistory,
    currentSession,
    stats,
    startListening,
    stopListening,
    toggleOverlayPosition,
    showOverlay,
    hideOverlay,
  } = useAppStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState([]);

  useEffect(() => {
    // Update recent questions
    setRecentQuestions(qaHistory.slice(0, 5));
  }, [qaHistory]);

  const handleToggleListening = async () => {
    setIsProcessing(true);
    try {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'testing': return 'warning';
      case 'disconnected': return 'error';
      default: return 'default';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'testing': return 'Testing...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ color: `${color}.main`, mr: 1 }}>
              {icon}
            </Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" component="div" sx={{ color: `${color}.main` }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const RecentQuestionItem = ({ qa, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <ListItem>
        <ListItemText
          primary={qa.question}
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {qa.answer}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(qa.timestamp))} ago
                {qa.responseTime && ` • ${qa.responseTime}ms`}
              </Typography>
            </Box>
          }
        />
      </ListItem>
      {index < recentQuestions.length - 1 && <Divider />}
    </motion.div>
  );

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Interview Assistant Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered real-time interview assistance
        </Typography>
      </Box>

      {/* Status and Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box>
                {isListening ? (
                  <Mic sx={{ fontSize: 48, color: 'success.main' }} />
                ) : (
                  <MicOff sx={{ fontSize: 48, color: 'text.secondary' }} />
                )}
              </Box>
              <Box>
                <Typography variant="h6">
                  {isListening ? 'Listening for Questions' : 'Not Listening'}
                </Typography>
                <Chip
                  label={getConnectionStatusText()}
                  color={getConnectionStatusColor()}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={20} />
                  ) : isListening ? (
                    <Stop />
                  ) : (
                    <PlayArrow />
                  )
                }
                onClick={handleToggleListening}
                disabled={isProcessing || connectionStatus === 'disconnected'}
                color={isListening ? 'error' : 'success'}
              >
                {isProcessing ? 'Processing...' : isListening ? 'Stop Listening' : 'Start Listening'}
              </Button>
              
              <Tooltip title="Toggle Overlay Position">
                <IconButton
                  onClick={toggleOverlayPosition}
                  disabled={!isListening}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Current Session Info */}
        {currentSession && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Session
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Started: {formatDistanceToNow(new Date(currentSession.startTime))} ago
              {currentSession.questions > 0 && ` • ${currentSession.questions} questions processed`}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Alerts */}
      {connectionStatus === 'disconnected' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          AI connection is not established. Please check your API key in settings.
        </Alert>
      )}

      {!settings.apiKey && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome! Please configure your OpenRouter API key in settings to get started.
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Questions"
            value={stats.totalQuestions}
            icon={<QuestionAnswer />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sessions"
            value={stats.totalSessions}
            icon={<HistoryIcon />}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Response"
            value={stats.averageResponseTime ? `${Math.round(stats.averageResponseTime)}ms` : '0ms'}
            icon={<Speed />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Success Rate"
            value={`${Math.round(stats.successRate)}%`}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Recent Questions */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ height: 400 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6">Recent Questions</Typography>
            </Box>
            
            {recentQuestions.length > 0 ? (
              <List sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
                {recentQuestions.map((qa, index) => (
                  <RecentQuestionItem key={qa.id} qa={qa} index={index} />
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  height: 'calc(100% - 64px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No questions yet. Start listening to begin!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                fullWidth
                onClick={() => {/* Navigate to settings */}}
              >
                Configure Settings
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                fullWidth
                onClick={() => {/* Navigate to history */}}
              >
                View Full History
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<QuestionAnswer />}
                fullWidth
                onClick={() => {/* Navigate to test mode */}}
              >
                Test Mode
              </Button>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Overlay Controls
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                fullWidth
                onClick={() => showOverlay('Test overlay content')}
                disabled={!isListening}
              >
                Show Test Overlay
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<VisibilityOff />}
                fullWidth
                onClick={hideOverlay}
              >
                Hide Overlay
              </Button>
              
              {/* Hotkeys Info */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Hotkeys
                </Typography>
                <Typography variant="caption" display="block">
                  {settings.hotkey}: Toggle Listening
                </Typography>
                <Typography variant="caption" display="block">
                  Ctrl+Shift+O: Toggle Overlay
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;