import React from 'react';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Mic } from '@mui/icons-material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: 'white',
      }}
    >
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            boxShadow: '0 0 30px rgba(76, 175, 80, 0.3)',
          }}
        >
          <Mic sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      </motion.div>

      {/* Title Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
          Interview Assistant Pro
        </Typography>
      </motion.div>

      {/* Subtitle Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          AI-powered interview assistance
        </Typography>
      </motion.div>

      {/* Progress Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        style={{ width: '200px' }}
      >
        <LinearProgress
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'primary.main',
            },
          }}
        />
      </motion.div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Initializing AI services...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;