import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Search,
  Delete,
  Download,
  Visibility,
  FilterList,
  Clear,
  MoreVert,
  ContentCopy,
  AccessTime,
  QuestionAnswer,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/appStore';

const History = () => {
  const { qaHistory, deleteQAPair, clearHistory, exportHistory } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQA, setSelectedQA] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let filtered = qaHistory;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(qa =>
        qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      // Here you could add logic to categorize questions
      // For now, we'll use response time as a simple filter
      if (filterBy === 'fast') {
        filtered = filtered.filter(qa => qa.responseTime && qa.responseTime < 2000);
      } else if (filterBy === 'slow') {
        filtered = filtered.filter(qa => qa.responseTime && qa.responseTime >= 2000);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'fastest':
          return (a.responseTime || 0) - (b.responseTime || 0);
        case 'slowest':
          return (b.responseTime || 0) - (a.responseTime || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [qaHistory, searchQuery, sortBy, filterBy]);

  const handleViewQA = (qa) => {
    setSelectedQA(qa);
    setViewDialogOpen(true);
  };

  const handleDeleteQA = (id) => {
    deleteQAPair(id);
  };

  const handleCopyAnswer = (answer) => {
    navigator.clipboard.writeText(answer);
    toast.success('Answer copied to clipboard');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  const handleExport = () => {
    exportHistory();
  };

  const formatAnswer = (answer) => {
    if (answer.length > 150) {
      return answer.substring(0, 150) + '...';
    }
    return answer;
  };

  const QACard = ({ qa, index }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1, mr: 2 }}>
                {qa.question}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => { handleViewQA(qa); setAnchorEl(null); }}>
                  <Visibility sx={{ mr: 1 }} /> View Full
                </MenuItem>
                <MenuItem onClick={() => { handleCopyAnswer(qa.answer); setAnchorEl(null); }}>
                  <ContentCopy sx={{ mr: 1 }} /> Copy Answer
                </MenuItem>
                <MenuItem
                  onClick={() => { handleDeleteQA(qa.id); setAnchorEl(null); }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formatAnswer(qa.answer)}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<AccessTime />}
                label={formatDistanceToNow(new Date(qa.timestamp)) + ' ago'}
                size="small"
                variant="outlined"
              />
              {qa.responseTime && (
                <Chip
                  label={`${qa.responseTime}ms`}
                  size="small"
                  color={qa.responseTime < 2000 ? 'success' : 'warning'}
                  variant="outlined"
                />
              )}
              {qa.sessionId && (
                <Chip
                  label="Session"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Q&A History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your interview question history
        </Typography>
      </Box>

      {/* Search and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search questions and answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchQuery('')} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                startIcon={<FilterList />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                variant="outlined"
              >
                Filter & Sort
              </Button>
              <Button
                startIcon={<Download />}
                onClick={handleExport}
                variant="outlined"
                disabled={qaHistory.length === 0}
              >
                Export
              </Button>
              <Button
                startIcon={<Delete />}
                onClick={handleClearAll}
                variant="outlined"
                color="error"
                disabled={qaHistory.length === 0}
              >
                Clear All
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">Sort By</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('newest'); setFilterMenuAnchor(null); }}>
            Newest First
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('oldest'); setFilterMenuAnchor(null); }}>
            Oldest First
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('fastest'); setFilterMenuAnchor(null); }}>
            Fastest Response
          </MenuItem>
          <MenuItem onClick={() => { setSortBy('slowest'); setFilterMenuAnchor(null); }}>
            Slowest Response
          </MenuItem>
          <Divider />
          <MenuItem disabled>
            <Typography variant="subtitle2">Filter By</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setFilterBy('all'); setFilterMenuAnchor(null); }}>
            All Questions
          </MenuItem>
          <MenuItem onClick={() => { setFilterBy('fast'); setFilterMenuAnchor(null); }}>
            Fast Responses (&lt;2s)
          </MenuItem>
          <MenuItem onClick={() => { setFilterBy('slow'); setFilterMenuAnchor(null); }}>
            Slow Responses (≥2s)
          </MenuItem>
        </Menu>
      </Paper>

      {/* Stats */}
      {qaHistory.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {qaHistory.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Questions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {filteredHistory.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filtered Results
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {Math.round(qaHistory.reduce((sum, qa) => sum + (qa.responseTime || 0), 0) / qaHistory.length)}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Response Time
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {qaHistory.filter(qa => qa.sessionId).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Session Questions
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <Box>
          <AnimatePresence>
            {filteredHistory.map((qa, index) => (
              <QACard key={qa.id} qa={qa} index={index} />
            ))}
          </AnimatePresence>
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuestionAnswer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchQuery ? 'No matching questions found' : 'No questions in history'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery 
              ? 'Try adjusting your search terms or filters'
              : 'Start asking questions to build your history'
            }
          </Typography>
        </Paper>
      )}

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedQA && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Question Details</Typography>
                <IconButton onClick={() => handleCopyAnswer(selectedQA.answer)}>
                  <ContentCopy />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Question:
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                {selectedQA.question}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Answer:
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                {selectedQA.answer}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Timestamp:</strong> {format(new Date(selectedQA.timestamp), 'PPpp')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Response Time:</strong> {selectedQA.responseTime ? `${selectedQA.responseTime}ms` : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => handleDeleteQA(selectedQA.id)}
                color="error"
                variant="outlined"
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default History;