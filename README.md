# Interview Assistant Pro

An industry-leading AI-powered interview assistant application that provides real-time help during technical interviews. The app listens to interview conversations, detects questions, and displays intelligent answers through an undetectable overlay system.

## 🚀 Features

### Core Functionality
- **Real-time Audio Processing**: Captures system-wide audio from any application (Zoom, Teams, browsers)
- **Intelligent Question Detection**: AI-powered detection of interview questions
- **Instant AI Responses**: Fast, contextual answers using OpenRouter's best models
- **Undetectable Overlay**: Answers displayed in a stealth overlay invisible to screen sharing
- **Smart Context Awareness**: Personalizes answers based on your resume and job description

### Technical Capabilities
- **Cross-platform**: Works on Windows, macOS, and Linux
- **System-wide Audio Capture**: Listens to audio from any application
- **Multiple AI Models**: Support for GPT-4, Claude, Llama, and more via OpenRouter
- **Answer Customization**: Choose between concise, detailed, or bullet-point responses
- **Session Management**: Track and analyze your interview performance
- **Export Functionality**: Export your Q&A history for review

### Stealth Features
- **Screen Sharing Safe**: Overlay is completely invisible in screen recordings
- **Undetectable Windows**: Uses advanced techniques to hide from window enumeration
- **No Tab Interference**: Won't show up in browser tab previews or task switchers
- **Background Operation**: Runs silently without drawing attention

## 🎯 Use Cases

- **Technical Interviews**: Get instant help with coding questions, algorithms, and system design
- **Behavioral Interviews**: Receive structured answers for behavioral questions
- **Live Coding Sessions**: Real-time assistance during coding challenges
- **Mock Interviews**: Practice with AI feedback and suggestions
- **Interview Preparation**: Test your knowledge and build confidence

## 📋 Prerequisites

- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher
- **OpenRouter API Key**: Get one free at [openrouter.ai](https://openrouter.ai)
- **Audio Drivers**: Platform-specific audio recording capabilities

### Platform-specific Requirements

#### Windows
- **SoX**: Audio processing library (auto-installed)
- **Windows 10/11**: Required for advanced stealth features

#### macOS
- **Microphone Permission**: Grant audio recording permissions
- **macOS 10.15+**: Required for system audio capture

#### Linux
- **ALSA/PulseAudio**: Audio system support
- **Ubuntu 20.04+** or equivalent distribution

## 🛠️ Installation

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/interview-assistant-pro.git
   cd interview-assistant-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd src/renderer && npm install && cd ../..
   ```

3. **Configure your API key**
   - Get your API key from [OpenRouter](https://openrouter.ai)
   - Start the app and go to Settings
   - Enter your API key and test the connection

4. **Start the application**
   ```bash
   npm run dev
   ```

### Building for Production

```bash
# Build the React frontend
npm run build

# Create distributables
npm run dist

# The built app will be in the `dist` folder
```

## ⚙️ Configuration

### Initial Setup

1. **API Configuration**
   - Open Settings → API & Models
   - Enter your OpenRouter API key
   - Select your preferred AI model (GPT-4 Turbo recommended)
   - Test the connection

2. **Personal Context**
   - Add your resume/experience in Settings
   - Paste the job description you're interviewing for
   - Set your technical specialization
   - Choose your preferred answer style

3. **Overlay Settings**
   - Adjust overlay size and position
   - Set opacity and font size
   - Configure auto-hide duration
   - Test overlay visibility

### Hotkeys

- **Ctrl+Shift+I** (Windows/Linux) or **Cmd+Shift+I** (Mac): Toggle listening
- **Ctrl+Shift+O**: Toggle overlay visibility
- **Customizable**: Change hotkeys in Settings

## 🎮 Usage

### Basic Operation

1. **Start Listening**
   - Click "Start Listening" or use the hotkey
   - The app will begin capturing system audio
   - Green microphone icon indicates active listening

2. **During Interviews**
   - Join your video call normally
   - Keep the app running in the background
   - Questions will be automatically detected
   - Answers appear in the overlay within seconds

3. **Overlay Management**
   - Position overlay where it won't interfere
   - Use hotkeys to show/hide as needed
   - Overlay automatically hides after showing answers

### Advanced Features

#### Test Mode
- Practice with sample questions
- Test your configuration
- Verify response times and quality

#### History Review
- View all past Q&A sessions
- Search through your interview history
- Export data for analysis

#### Session Tracking
- Monitor active interview sessions
- Track questions asked and response times
- Analyze performance metrics

## 🔧 Troubleshooting

### Audio Issues

**Problem**: App not detecting audio
- **Solution**: Check microphone permissions
- **Windows**: Ensure microphone privacy settings allow app access
- **macOS**: Grant microphone permissions in System Preferences
- **Linux**: Verify PulseAudio/ALSA configuration

**Problem**: No system audio capture
- **Solution**: Install required audio drivers
- **Windows**: SoX should auto-install, manual installation may be needed
- **macOS**: Use system audio loopback tools if needed
- **Linux**: Configure ALSA/PulseAudio monitor devices

### API Issues

**Problem**: Connection failed
- **Solution**: Verify API key and internet connection
- Check OpenRouter account status and credits
- Try different AI models if one is unavailable

**Problem**: Slow responses
- **Solution**: Switch to faster models (GPT-3.5 vs GPT-4)
- Check internet connection speed
- Reduce answer complexity in settings

### Overlay Issues

**Problem**: Overlay visible in screen sharing
- **Solution**: This shouldn't happen with proper setup
- Restart the app to reinitialize stealth mode
- Check platform-specific requirements

**Problem**: Overlay not showing
- **Solution**: Check overlay position and opacity settings
- Ensure overlay isn't behind other windows
- Try toggling overlay visibility hotkey

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + Material-UI + Framer Motion
- **Backend**: Electron + Node.js
- **AI Integration**: OpenRouter API
- **Audio Processing**: node-record-lpcm16 + SoX
- **State Management**: Zustand
- **Build System**: electron-builder

### Project Structure
```
interview-assistant-pro/
├── src/
│   ├── main/                  # Electron main process
│   │   ├── main.js           # App entry point
│   │   ├── preload.js        # IPC bridge
│   │   └── services/         # Core services
│   │       ├── AudioCapture.js
│   │       ├── AIService.js
│   │       └── OverlayManager.js
│   └── renderer/             # React frontend
│       ├── src/
│       │   ├── components/   # UI components
│       │   ├── store/        # State management
│       │   └── App.js        # Main app component
│       └── public/           # Static assets
├── assets/                   # App icons and resources
├── package.json             # Main dependencies
└── README.md               # This file
```

## 🔒 Privacy & Security

### Data Handling
- **Local Processing**: All audio is processed locally
- **No Recording**: Audio is not saved or transmitted
- **API Only**: Only transcribed text sent to AI service
- **No Tracking**: No user behavior tracking

### Stealth Technology
- **Window Hiding**: Advanced techniques to hide overlay from capture
- **Process Concealment**: Minimal system footprint
- **Memory Protection**: Secure handling of sensitive data

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/interview-assistant-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/interview-assistant-pro/discussions)
- **Email**: support@interview-assistant-pro.com

## 🎉 Acknowledgments

- OpenRouter for providing access to multiple AI models
- The Electron community for cross-platform desktop development
- React and Material-UI teams for excellent UI frameworks
- All contributors and users who help improve this tool

## ⚖️ Disclaimer

This tool is designed for educational and practice purposes. Users are responsible for ensuring compliance with their interview policies and local laws. Use responsibly and ethically.

---

**Made with ❤️ for successful interviews**