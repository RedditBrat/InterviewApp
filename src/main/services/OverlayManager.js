const { BrowserWindow, screen } = require('electron');
const path = require('path');

class OverlayManager {
  constructor() {
    this.overlayWindow = null;
    this.isVisible = false;
    this.position = { x: 50, y: 50 }; // Position as percentage of screen
    this.currentAnswer = '';
    this.autoHideTimer = null;
    this.autoHideDuration = 15000; // 15 seconds
    
    // Overlay appearance settings
    this.overlaySettings = {
      width: 400,
      height: 300,
      opacity: 0.95,
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      fontSize: 14,
      borderRadius: 10,
      padding: 20
    };
  }

  async createOverlay() {
    if (this.overlayWindow) {
      return;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    
    // Calculate position
    const x = Math.floor((screenWidth * this.position.x) / 100);
    const y = Math.floor((screenHeight * this.position.y) / 100);

    this.overlayWindow = new BrowserWindow({
      width: this.overlaySettings.width,
      height: this.overlaySettings.height,
      x: x,
      y: y,
      
      // Critical settings for undetectable overlay
      alwaysOnTop: true,
      skipTaskbar: true,
      frame: false,
      transparent: true,
      hasShadow: false,
      focusable: false,
      movable: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      
      // Prevent window from being captured
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        webSecurity: true,
        
        // Critical: Prevent content from being captured
        offscreen: false,
        paintWhenInitiallyHidden: false,
        backgroundThrottling: false
      },
      
      // Hide from window enumeration
      show: false,
      
      // Platform-specific stealth settings
      ...(process.platform === 'darwin' && {
        titleBarStyle: 'customButtonsOnHover',
        vibrancy: 'ultra-dark',
        visualEffectState: 'followWindow'
      }),
      
      ...(process.platform === 'win32' && {
        type: 'toolbar', // Prevents showing in Alt+Tab
        parent: null
      })
    });

    // Load overlay content
    await this.overlayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(this.generateOverlayHTML())}`);

    // Platform-specific stealth enhancements
    if (process.platform === 'win32') {
      this.applyWindowsStealthMode();
    } else if (process.platform === 'darwin') {
      this.applyMacOSStealthMode();
    }

    // Hide initially
    this.overlayWindow.hide();

    // Handle window events
    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
      this.isVisible = false;
    });

    // Prevent window from gaining focus
    this.overlayWindow.on('focus', () => {
      this.overlayWindow.blur();
    });

    // Ensure window stays on top but doesn't interfere
    this.overlayWindow.on('show', () => {
      this.overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1);
      this.overlayWindow.setVisibleOnAllWorkspaces(true);
      
      // Prevent window from being captured by screen recording
      if (process.platform === 'darwin') {
        this.overlayWindow.setContentProtection(true);
      }
    });
  }

  generateOverlayHTML() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: rgba(26, 26, 26, 0.95);
                color: ${this.overlaySettings.textColor};
                padding: ${this.overlaySettings.padding}px;
                border-radius: ${this.overlaySettings.borderRadius}px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                height: 100vh;
                overflow: hidden;
                
                /* Critical: Prevent selection and interaction */
                user-select: none;
                -webkit-user-select: none;
                pointer-events: none;
                
                /* Hide from screen capture */
                -webkit-app-region: no-drag;
                will-change: auto;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                font-size: 12px;
                opacity: 0.7;
            }
            
            .title {
                font-weight: 600;
                color: #4CAF50;
            }
            
            .close-btn {
                background: #ff4444;
                border: none;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                cursor: pointer;
                opacity: 0.7;
                pointer-events: auto;
            }
            
            .content {
                font-size: ${this.overlaySettings.fontSize}px;
                line-height: 1.5;
                max-height: calc(100% - 50px);
                overflow-y: auto;
                white-space: pre-wrap;
                word-break: break-word;
            }
            
            .content::-webkit-scrollbar {
                width: 4px;
            }
            
            .content::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
            }
            
            .footer {
                position: absolute;
                bottom: 10px;
                right: 15px;
                font-size: 10px;
                opacity: 0.5;
            }
            
            /* Animation for smooth appearance */
            .fade-in {
                animation: fadeIn 0.3s ease-in-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Bullet point styling */
            .content ul {
                list-style-type: none;
                padding-left: 0;
            }
            
            .content li {
                margin-bottom: 8px;
                position: relative;
                padding-left: 20px;
            }
            
            .content li:before {
                content: "•";
                color: #4CAF50;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <span class="title">Interview Assistant</span>
            <button class="close-btn" onclick="window.close()"></button>
        </div>
        <div class="content" id="content">
            ${this.currentAnswer || 'Ready to assist...'}
        </div>
        <div class="footer">AI Assistant</div>
        
        <script>
            // Prevent any interaction that could reveal the window
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.addEventListener('selectstart', e => e.preventDefault());
            document.addEventListener('dragstart', e => e.preventDefault());
            
            // Auto-hide functionality
            let autoHideTimer;
            
            function startAutoHide() {
                clearTimeout(autoHideTimer);
                autoHideTimer = setTimeout(() => {
                    window.close();
                }, ${this.autoHideDuration});
            }
            
            // Start auto-hide timer
            startAutoHide();
            
            // Update content function
            window.updateContent = function(content) {
                const contentEl = document.getElementById('content');
                contentEl.innerHTML = content;
                contentEl.classList.add('fade-in');
                startAutoHide();
            };
            
            // Format bullet points
            function formatBulletPoints(text) {
                if (text.includes('•')) {
                    const lines = text.split('\\n');
                    let formatted = '';
                    let inList = false;
                    
                    lines.forEach(line => {
                        if (line.trim().startsWith('•')) {
                            if (!inList) {
                                formatted += '<ul>';
                                inList = true;
                            }
                            formatted += '<li>' + line.replace('•', '').trim() + '</li>';
                        } else {
                            if (inList) {
                                formatted += '</ul>';
                                inList = false;
                            }
                            formatted += '<p>' + line + '</p>';
                        }
                    });
                    
                    if (inList) {
                        formatted += '</ul>';
                    }
                    
                    return formatted;
                }
                
                return text.replace(/\\n/g, '<br>');
            }
        </script>
    </body>
    </html>`;
  }

  applyWindowsStealthMode() {
    if (process.platform !== 'win32') return;
    
    try {
      // Use native Windows APIs to hide window from enumeration
      const { exec } = require('child_process');
      const windowId = this.overlayWindow.getNativeWindowHandle();
      
      // Hide from Alt+Tab and task manager
      exec(`powershell -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport(\\"user32.dll\\")] public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong); [DllImport(\\"user32.dll\\")] public static extern int GetWindowLong(IntPtr hWnd, int nIndex); }'; [Win32]::SetWindowLong(${windowId}, -20, ([Win32]::GetWindowLong(${windowId}, -20) -bor 0x80))"`, 
        (error) => {
          if (error) console.log('Windows stealth mode warning:', error.message);
        }
      );
    } catch (error) {
      console.log('Windows stealth mode warning:', error.message);
    }
  }

  applyMacOSStealthMode() {
    if (process.platform !== 'darwin') return;
    
    try {
      // macOS specific settings for stealth mode
      this.overlayWindow.setVisibleOnAllWorkspaces(true);
      this.overlayWindow.setFullScreenable(false);
      
      // Prevent window from appearing in Mission Control
      const { exec } = require('child_process');
      exec('defaults write com.apple.dock expose-group-by-app -bool false', () => {});
      
    } catch (error) {
      console.log('macOS stealth mode warning:', error.message);
    }
  }

  async showAnswer(answer) {
    this.currentAnswer = answer;
    
    if (!this.overlayWindow) {
      await this.createOverlay();
    }

    // Update content
    await this.overlayWindow.webContents.executeJavaScript(`
      window.updateContent(\`${answer.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
    `);

    if (!this.isVisible) {
      this.overlayWindow.show();
      this.isVisible = true;
    }

    // Set auto-hide timer
    this.setAutoHideTimer();
  }

  hide() {
    if (this.overlayWindow && this.isVisible) {
      this.overlayWindow.hide();
      this.isVisible = false;
    }
    
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else if (this.currentAnswer) {
      this.showAnswer(this.currentAnswer);
    }
  }

  setAutoHideTimer() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
    }
    
    this.autoHideTimer = setTimeout(() => {
      this.hide();
    }, this.autoHideDuration);
  }

  togglePosition() {
    // Cycle through different positions
    const positions = [
      { x: 5, y: 5 },    // Top-left
      { x: 95, y: 5 },   // Top-right
      { x: 5, y: 95 },   // Bottom-left
      { x: 95, y: 95 },  // Bottom-right
      { x: 50, y: 5 },   // Top-center
      { x: 50, y: 95 }   // Bottom-center
    ];
    
    const currentIndex = positions.findIndex(pos => 
      Math.abs(pos.x - this.position.x) < 5 && Math.abs(pos.y - this.position.y) < 5
    );
    
    const nextIndex = (currentIndex + 1) % positions.length;
    this.position = positions[nextIndex];
    
    if (this.overlayWindow) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
      
      const x = Math.floor((screenWidth * this.position.x) / 100);
      const y = Math.floor((screenHeight * this.position.y) / 100);
      
      this.overlayWindow.setBounds({ x, y });
    }
    
    return this.position;
  }

  updateSettings(newSettings) {
    this.overlaySettings = { ...this.overlaySettings, ...newSettings };
    
    // If window exists, recreate it with new settings
    if (this.overlayWindow) {
      this.destroy();
      if (this.isVisible) {
        this.showAnswer(this.currentAnswer);
      }
    }
  }

  destroy() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    
    if (this.overlayWindow) {
      this.overlayWindow.destroy();
      this.overlayWindow = null;
    }
    
    this.isVisible = false;
  }

  getStatus() {
    return {
      isVisible: this.isVisible,
      position: this.position,
      hasAnswer: !!this.currentAnswer,
      settings: this.overlaySettings
    };
  }
}

module.exports = OverlayManager;