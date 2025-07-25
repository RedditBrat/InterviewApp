import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import toast from 'react-hot-toast';

export const useAppStore = create(
  subscribeWithSelector((set, get) => ({
    // App State
    isInitialized: false,
    isListening: false,
    connectionStatus: 'disconnected', // 'connected', 'disconnected', 'testing'
    
    // Settings
    settings: {
      apiKey: '',
      model: 'openai/gpt-4-turbo-preview',
      answerStyle: 'concise',
      jobDescription: '',
      resume: '',
      experience: '',
      specialization: '',
      autoStart: false,
      hotkey: 'CommandOrControl+Shift+I',
      overlayPosition: { x: 50, y: 50 },
      overlaySettings: {
        width: 400,
        height: 300,
        opacity: 0.95,
        fontSize: 14,
        autoHideDuration: 15000
      }
    },

    // Q&A History
    qaHistory: [],
    currentSession: null,

    // Statistics
    stats: {
      totalQuestions: 0,
      totalSessions: 0,
      averageResponseTime: 0,
      successRate: 0,
      lastUsed: null
    },

    // Actions
    initializeApp: async () => {
      try {
        if (!window.electronAPI) {
          throw new Error('Electron API not available');
        }

        // Get initial settings
        const settings = await window.electronAPI.getSettings();
        const listeningStatus = await window.electronAPI.getListeningStatus();

        set({
          settings,
          isListening: listeningStatus.isListening,
          isInitialized: true
        });

        // Test connection if API key exists
        if (settings.apiKey) {
          get().testConnection();
        }

      } catch (error) {
        console.error('Failed to initialize app:', error);
        toast.error('Failed to initialize application');
      }
    },

    updateSettings: async (newSettings) => {
      try {
        const updatedSettings = await window.electronAPI.updateSettings(newSettings);
        
        set({ settings: updatedSettings });
        toast.success('Settings updated successfully');

        // Test connection if API key changed
        if (newSettings.apiKey || newSettings.model) {
          get().testConnection();
        }

        return updatedSettings;
      } catch (error) {
        console.error('Failed to update settings:', error);
        toast.error('Failed to update settings');
        throw error;
      }
    },

    testConnection: async () => {
      try {
        set({ connectionStatus: 'testing' });
        
        const result = await window.electronAPI.testAIConnection();
        
        if (result.success) {
          set({ connectionStatus: 'connected' });
          toast.success('AI connection successful');
          return true;
        } else {
          set({ connectionStatus: 'disconnected' });
          toast.error(`Connection failed: ${result.error}`);
          return false;
        }
      } catch (error) {
        set({ connectionStatus: 'disconnected' });
        toast.error('Connection test failed');
        return false;
      }
    },

    startListening: async () => {
      try {
        const result = await window.electronAPI.startListening();
        
        if (result.success) {
          set({ isListening: true });
          toast.success('Started listening for questions');
          
          // Start new session
          const sessionId = Date.now().toString();
          set({ 
            currentSession: {
              id: sessionId,
              startTime: new Date().toISOString(),
              questions: 0
            }
          });
          
          return true;
        } else {
          toast.error(`Failed to start listening: ${result.error}`);
          return false;
        }
      } catch (error) {
        console.error('Failed to start listening:', error);
        toast.error('Failed to start listening');
        return false;
      }
    },

    stopListening: async () => {
      try {
        const result = await window.electronAPI.stopListening();
        
        if (result.success) {
          set({ isListening: false });
          toast.success('Stopped listening');
          
          // End current session
          const { currentSession, stats } = get();
          if (currentSession) {
            set({ 
              currentSession: null,
              stats: {
                ...stats,
                totalSessions: stats.totalSessions + 1,
                lastUsed: new Date().toISOString()
              }
            });
          }
          
          return true;
        } else {
          toast.error(`Failed to stop listening: ${result.error}`);
          return false;
        }
      } catch (error) {
        console.error('Failed to stop listening:', error);
        toast.error('Failed to stop listening');
        return false;
      }
    },

    updateListeningStatus: (isListening) => {
      set({ isListening });
    },

    processQuestion: async (question) => {
      try {
        const startTime = Date.now();
        
        const result = await window.electronAPI.processQuestion(question);
        
        if (result.success) {
          const responseTime = Date.now() - startTime;
          
          const qaPair = {
            id: Date.now().toString(),
            question,
            answer: result.answer,
            timestamp: new Date().toISOString(),
            responseTime,
            sessionId: get().currentSession?.id
          };

          get().addQAPair(qaPair);
          toast.success('Question processed successfully');
          
          return result.answer;
        } else {
          toast.error(`Failed to process question: ${result.error}`);
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Failed to process question:', error);
        toast.error('Failed to process question');
        throw error;
      }
    },

    addQAPair: (qaPair) => {
      set((state) => {
        const newHistory = [qaPair, ...state.qaHistory];
        const newStats = {
          ...state.stats,
          totalQuestions: state.stats.totalQuestions + 1,
          averageResponseTime: newHistory.length > 0 
            ? newHistory.reduce((sum, qa) => sum + (qa.responseTime || 0), 0) / newHistory.length
            : 0
        };

        // Update current session
        const updatedSession = state.currentSession ? {
          ...state.currentSession,
          questions: state.currentSession.questions + 1
        } : null;

        return {
          qaHistory: newHistory,
          stats: newStats,
          currentSession: updatedSession
        };
      });
    },

    clearHistory: () => {
      set({ qaHistory: [] });
      toast.success('History cleared');
    },

    deleteQAPair: (id) => {
      set((state) => ({
        qaHistory: state.qaHistory.filter(qa => qa.id !== id)
      }));
      toast.success('Q&A pair deleted');
    },

    showOverlay: async (content) => {
      try {
        await window.electronAPI.showOverlay(content);
      } catch (error) {
        console.error('Failed to show overlay:', error);
      }
    },

    hideOverlay: async () => {
      try {
        await window.electronAPI.hideOverlay();
      } catch (error) {
        console.error('Failed to hide overlay:', error);
      }
    },

    toggleOverlayPosition: async () => {
      try {
        const newPosition = await window.electronAPI.toggleOverlayPosition();
        set((state) => ({
          settings: {
            ...state.settings,
            overlayPosition: newPosition
          }
        }));
        toast.success(`Overlay moved to new position`);
        return newPosition;
      } catch (error) {
        console.error('Failed to toggle overlay position:', error);
        toast.error('Failed to move overlay');
      }
    },

    // Utility functions
    getSessionHistory: (sessionId) => {
      return get().qaHistory.filter(qa => qa.sessionId === sessionId);
    },

    getRecentQuestions: (limit = 10) => {
      return get().qaHistory.slice(0, limit);
    },

    searchHistory: (query) => {
      const history = get().qaHistory;
      return history.filter(qa => 
        qa.question.toLowerCase().includes(query.toLowerCase()) ||
        qa.answer.toLowerCase().includes(query.toLowerCase())
      );
    },

    exportHistory: () => {
      const { qaHistory, stats } = get();
      const exportData = {
        exportDate: new Date().toISOString(),
        stats,
        history: qaHistory
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-assistant-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('History exported successfully');
    },

    // Theme and preferences
    theme: 'dark',
    setTheme: (theme) => set({ theme }),

    // Error handling
    lastError: null,
    setError: (error) => set({ lastError: error }),
    clearError: () => set({ lastError: null }),
  }))
);

// Subscribe to settings changes for persistence
useAppStore.subscribe(
  (state) => state.settings,
  (settings, previousSettings) => {
    if (previousSettings && JSON.stringify(settings) !== JSON.stringify(previousSettings)) {
      // Auto-save settings changes
      localStorage.setItem('interview-assistant-settings', JSON.stringify(settings));
    }
  }
);

// Subscribe to history changes for persistence
useAppStore.subscribe(
  (state) => state.qaHistory,
  (history) => {
    // Save recent history to localStorage (last 100 items)
    const recentHistory = history.slice(0, 100);
    localStorage.setItem('interview-assistant-history', JSON.stringify(recentHistory));
  }
);

export default useAppStore;