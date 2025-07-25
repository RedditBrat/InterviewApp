const { app, BrowserWindow, ipcMain, screen, globalShortcut, systemPreferences } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const Store = require('electron-store');
const AudioCapture = require('./services/AudioCapture');
const AIService = require('./services/AIService');
const OverlayManager = require('./services/OverlayManager');

// Initialize store for persistent settings
const store = new Store();

class InterviewAssistantApp {
  constructor() {
    this.mainWindow = null;
    this.overlayWindow = null;
    this.audioCapture = null;
    this.aiService = null;
    this.overlayManager = null;
    this.isListening = false;
    this.settings = {
      apiKey: store.get('apiKey', ''),
      model: store.get('model', 'openai/gpt-4-turbo-preview'),
      answerStyle: store.get('answerStyle', 'concise'),
      jobDescription: store.get('jobDescription', ''),
      resume: store.get('resume', ''),
      autoStart: store.get('autoStart', false),
      overlayPosition: store.get('overlayPosition', { x: 50, y: 50 }),
      hotkey: store.get('hotkey', 'CommandOrControl+Shift+I')
    };
  }

  async initialize() {
    await this.createMainWindow();
    await this.initializeServices();
    this.setupIPC();
    this.setupGlobalShortcuts();
    await this.requestPermissions();
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      icon: path.join(__dirname, '../../assets/icon.png'),
      title: 'Interview Assistant Pro',
      show: false,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    });

    // Load the app
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/build/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  async initializeServices() {
    // Initialize audio capture service
    this.audioCapture = new AudioCapture();
    
    // Initialize AI service
    this.aiService = new AIService(this.settings.apiKey, this.settings.model);
    
    // Initialize overlay manager
    this.overlayManager = new OverlayManager();
    
    // Set up audio processing pipeline
    this.audioCapture.on('transcription', async (text) => {
      if (this.isListening && text.trim()) {
        console.log('Transcribed:', text);
        
        // Detect if this is a question
        const isQuestion = await this.aiService.detectQuestion(text);
        
        if (isQuestion) {
          // Generate answer using AI
          const answer = await this.aiService.generateAnswer(text, {
            jobDescription: this.settings.jobDescription,
            resume: this.settings.resume,
            answerStyle: this.settings.answerStyle
          });
          
          // Show answer in overlay
          this.overlayManager.showAnswer(answer);
          
          // Send to main window for history
          this.mainWindow?.webContents.send('new-qa-pair', {
            question: text,
            answer: answer,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  }

  setupIPC() {
    // Settings management
    ipcMain.handle('get-settings', () => this.settings);
    
    ipcMain.handle('update-settings', (event, newSettings) => {
      this.settings = { ...this.settings, ...newSettings };
      
      // Save to store
      Object.keys(newSettings).forEach(key => {
        store.set(key, newSettings[key]);
      });
      
      // Update services
      if (newSettings.apiKey || newSettings.model) {
        this.aiService.updateConfig(this.settings.apiKey, this.settings.model);
      }
      
      return this.settings;
    });

    // Audio control
    ipcMain.handle('start-listening', async () => {
      try {
        await this.audioCapture.start();
        this.isListening = true;
        return { success: true };
      } catch (error) {
        console.error('Failed to start listening:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('stop-listening', async () => {
      try {
        await this.audioCapture.stop();
        this.isListening = false;
        return { success: true };
      } catch (error) {
        console.error('Failed to stop listening:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-listening-status', () => ({
      isListening: this.isListening
    }));

    // Overlay control
    ipcMain.handle('show-overlay', (event, content) => {
      this.overlayManager.showAnswer(content);
    });

    ipcMain.handle('hide-overlay', () => {
      this.overlayManager.hide();
    });

    ipcMain.handle('toggle-overlay-position', () => {
      const newPosition = this.overlayManager.togglePosition();
      this.settings.overlayPosition = newPosition;
      store.set('overlayPosition', newPosition);
      return newPosition;
    });

    // Test AI connection
    ipcMain.handle('test-ai-connection', async () => {
      try {
        const result = await this.aiService.testConnection();
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Manual question processing
    ipcMain.handle('process-question', async (event, question) => {
      try {
        const answer = await this.aiService.generateAnswer(question, {
          jobDescription: this.settings.jobDescription,
          resume: this.settings.resume,
          answerStyle: this.settings.answerStyle
        });
        return { success: true, answer };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }

  setupGlobalShortcuts() {
    // Toggle listening hotkey
    globalShortcut.register(this.settings.hotkey, () => {
      if (this.isListening) {
        this.audioCapture.stop();
        this.isListening = false;
      } else {
        this.audioCapture.start();
        this.isListening = true;
      }
      
      this.mainWindow?.webContents.send('listening-status-changed', {
        isListening: this.isListening
      });
    });

    // Quick overlay toggle
    globalShortcut.register('CommandOrControl+Shift+O', () => {
      this.overlayManager.toggle();
    });
  }

  async requestPermissions() {
    // Request microphone permissions (macOS)
    if (process.platform === 'darwin') {
      try {
        const microphonePermission = systemPreferences.getMediaAccessStatus('microphone');
        if (microphonePermission !== 'granted') {
          await systemPreferences.askForMediaAccess('microphone');
        }
      } catch (error) {
        console.error('Error requesting microphone permission:', error);
      }
    }
  }
}

// App event handlers
app.whenReady().then(async () => {
  const assistantApp = new InterviewAssistantApp();
  await assistantApp.initialize();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      assistantApp.createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Handle app updates and security
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    // Prevent new window creation for security
    event.preventDefault();
  });
});

// Prevent navigation away from the app
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });
});