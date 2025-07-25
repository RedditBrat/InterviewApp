import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  QuestionAnswer,
  Mic,
  MicOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';

const Sidebar = ({ currentPage, onPageChange }) => {
  const { isListening, connectionStatus, stats } = useAppStore();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      id: 'test',
      label: 'Test Mode',
      icon: <QuestionAnswer />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <HistoryIcon />,
      badge: stats.totalQuestions > 0 ? stats.totalQuestions : null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
    },
  ];

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'testing': return '#FF9800';
      case 'disconnected': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {isListening ? <Mic /> : <MicOff />}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              Interview Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pro Version
            </Typography>
          </Box>
        </Box>
        
        {/* Status Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: getConnectionColor(),
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {connectionStatus === 'connected' ? 'AI Connected' :
             connectionStatus === 'testing' ? 'Testing...' : 'Disconnected'}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 1 }}>
        <List>
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === item.id}
                  onClick={() => onPageChange(item.id)}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: currentPage === item.id ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        bgcolor: currentPage === item.id ? 'primary.dark' : 'primary.main',
                        color: 'white',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Made with ❤️ for interviews
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;