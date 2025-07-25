import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import {
  Send,
  Clear,
  Psychology,
  AccessTime,
  QuestionAnswer,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

import { useAppStore } from '../store/appStore';

const TestMode = () => {
  const { processQuestion, connectionStatus, settings } = useAppStore();
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  const exampleQuestions = [
    "What is the difference between let, const, and var in JavaScript?",
    "Explain the concept of closures in JavaScript with an example.",
    "How would you implement a binary search algorithm?",
    "What are the differences between SQL and NoSQL databases?",
    "Explain the SOLID principles in software engineering.",
    "How would you design a scalable chat application?",
    "What is the time complexity of quicksort algorithm?",
    "Explain the concept of microservices architecture.",
  ];

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setIsProcessing(true);
    setAnswer('');
    setResponseTime(null);
    
    const startTime = Date.now();
    
    try {
      const result = await processQuestion(question);
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      
      setAnswer(result);
      setResponseTime(timeTaken);
      
      // Add to test history
      const testResult = {
        id: Date.now().toString(),
        question,
        answer: result,
        responseTime: timeTaken,
        timestamp: new Date().toISOString(),
      };
      
      setTestHistory(prev => [testResult, ...prev.slice(0, 4)]); // Keep last 5
      
    } catch (error) {
      setAnswer('Failed to generate answer. Please check your configuration.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setQuestion('');
    setAnswer('');
    setResponseTime(null);
  };

  const handleExampleClick = (exampleQuestion) => {
    setQuestion(exampleQuestion);
  };

  const formatAnswer = (answer) => {
    // Convert bullet points to proper formatting
    if (answer.includes('•')) {
      return answer.split('\n').map((line, index) => (
        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
          {line}
        </Typography>
      ));
    }
    
    return (
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {answer}
      </Typography>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Test Mode
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test your AI assistant with sample questions or custom queries
        </Typography>
      </Box>

      {/* Connection Warning */}
      {connectionStatus !== 'connected' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          AI connection is not established. Please configure your API key in settings.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ask a Question
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Enter your interview question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here or click an example below..."
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClear}
                disabled={isProcessing}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={isProcessing ? <CircularProgress size={20} /> : <Send />}
                onClick={handleSubmit}
                disabled={isProcessing || !question.trim() || connectionStatus !== 'connected'}
              >
                {isProcessing ? 'Processing...' : 'Ask AI'}
              </Button>
            </Box>
          </Paper>

          {/* Answer Section */}
          <AnimatePresence>
            {(answer || isProcessing) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">AI Response</Typography>
                    {responseTime && (
                      <Chip
                        label={`${responseTime}ms`}
                        size="small"
                        icon={<AccessTime />}
                        sx={{ ml: 'auto' }}
                      />
                    )}
                  </Box>
                  
                  {isProcessing ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} />
                      <Typography color="text.secondary">
                        Generating response using {settings.model}...
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                      {formatAnswer(answer)}
                    </Box>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Example Questions */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Example Questions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click any question to test it
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {exampleQuestions.map((example, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleExampleClick(example)}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="body2">
                        {example}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Paper>

          {/* Test History */}
          {testHistory.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Tests
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {testHistory.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                          {test.question}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(test.timestamp))} ago
                          </Typography>
                          <Chip
                            label={`${test.responseTime}ms`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TestMode;