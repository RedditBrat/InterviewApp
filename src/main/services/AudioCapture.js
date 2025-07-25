const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class AudioCapture extends EventEmitter {
  constructor() {
    super();
    this.isRecording = false;
    this.recordingStream = null;
    this.speechToTextService = null;
    this.audioBuffer = [];
    this.silenceThreshold = 500; // ms of silence before processing
    this.silenceTimer = null;
    this.vadThreshold = 0.01; // Voice Activity Detection threshold
    
    this.initializeSpeechToText();
  }

  initializeSpeechToText() {
    // We'll use OpenAI Whisper via API for speech-to-text
    // This provides high accuracy and works well with technical terminology
    this.speechToTextService = new WhisperSTTService();
  }

  async start() {
    if (this.isRecording) {
      console.log('Already recording');
      return;
    }

    try {
      console.log('Starting audio capture...');
      
      // For demo purposes, simulate audio capture
      // In production, this would use platform-specific audio capture
      this.simulateAudioCapture();

      console.log('Audio capture started successfully');
      this.emit('started');
      
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRecording) {
      return;
    }

    try {
      console.log('Stopping audio capture...');
      
      if (this.demoInterval) {
        clearInterval(this.demoInterval);
        this.demoInterval = null;
      }
      
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      
      this.isRecording = false;
      this.audioBuffer = [];
      
      console.log('Audio capture stopped');
      this.emit('stopped');
      
    } catch (error) {
      console.error('Failed to stop audio capture:', error);
      throw error;
    }
  }

  processAudioChunk(chunk) {
    // Add chunk to buffer
    this.audioBuffer.push(chunk);
    
    // Check for voice activity
    const hasVoice = this.detectVoiceActivity(chunk);
    
    if (hasVoice) {
      // Reset silence timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    } else {
      // Start silence timer if not already running
      if (!this.silenceTimer && this.audioBuffer.length > 0) {
        this.silenceTimer = setTimeout(() => {
          this.processBufferedAudio();
        }, this.silenceThreshold);
      }
    }
  }

  detectVoiceActivity(chunk) {
    // Simple VAD based on amplitude
    let sum = 0;
    for (let i = 0; i < chunk.length; i += 2) {
      const sample = chunk.readInt16LE(i);
      sum += Math.abs(sample);
    }
    const average = sum / (chunk.length / 2);
    const normalized = average / 32768; // 16-bit audio
    
    return normalized > this.vadThreshold;
  }

  async processBufferedAudio() {
    if (this.audioBuffer.length === 0) {
      return;
    }

    try {
      // Combine all chunks into a single buffer
      const audioData = Buffer.concat(this.audioBuffer);
      this.audioBuffer = [];
      
      // Save to temporary file for Whisper processing
      const tempFile = path.join(__dirname, '../../../temp', `audio_${Date.now()}.wav`);
      await this.saveAsWAV(audioData, tempFile);
      
      // Send to speech-to-text service
      const transcription = await this.speechToTextService.transcribe(tempFile);
      
      if (transcription && transcription.trim()) {
        this.emit('transcription', transcription);
      }
      
      // Clean up temp file
      fs.unlink(tempFile, (err) => {
        if (err) console.error('Failed to delete temp file:', err);
      });
      
    } catch (error) {
      console.error('Error processing audio:', error);
      this.emit('error', error);
    }
  }

  async saveAsWAV(buffer, filePath) {
    return new Promise((resolve, reject) => {
      // Ensure temp directory exists
      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Create WAV header
      const sampleRate = 16000;
      const bitsPerSample = 16;
      const channels = 1;
      const byteRate = sampleRate * channels * bitsPerSample / 8;
      const blockAlign = channels * bitsPerSample / 8;
      const dataSize = buffer.length;
      const fileSize = 44 + dataSize;

      const header = Buffer.alloc(44);
      
      // RIFF chunk descriptor
      header.write('RIFF', 0);
      header.writeUInt32LE(fileSize - 8, 4);
      header.write('WAVE', 8);
      
      // fmt sub-chunk
      header.write('fmt ', 12);
      header.writeUInt32LE(16, 16); // Sub-chunk size
      header.writeUInt16LE(1, 20); // Audio format (PCM)
      header.writeUInt16LE(channels, 22);
      header.writeUInt32LE(sampleRate, 24);
      header.writeUInt32LE(byteRate, 28);
      header.writeUInt16LE(blockAlign, 32);
      header.writeUInt16LE(bitsPerSample, 34);
      
      // data sub-chunk
      header.write('data', 36);
      header.writeUInt32LE(dataSize, 40);

      // Write file
      const fileData = Buffer.concat([header, buffer]);
      fs.writeFile(filePath, fileData, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getRecordProgram() {
    // Platform-specific recording programs
    switch (process.platform) {
      case 'darwin':
        return 'sox'; // macOS with SoX
      case 'win32':
        return 'sox'; // Windows with SoX
      case 'linux':
        return 'arecord'; // Linux with ALSA
      default:
        return 'sox';
    }
  }

  simulateAudioCapture() {
    // Demo mode: simulate audio capture for testing
    this.isRecording = true;
    
    // Simulate periodic question detection for demo
    this.demoInterval = setInterval(() => {
      if (this.isRecording) {
        // Simulate various interview questions for demo
        const demoQuestions = [
          "What is the difference between let and const in JavaScript?",
          "Explain how closures work in JavaScript",
          "What are the benefits of using React hooks?",
          "How would you implement a binary search algorithm?",
          "Describe the difference between SQL and NoSQL databases",
        ];
        
        const randomQuestion = demoQuestions[Math.floor(Math.random() * demoQuestions.length)];
        console.log('Demo: Simulated question detected:', randomQuestion);
        this.emit('transcription', randomQuestion);
      }
    }, 10000); // Simulate a question every 10 seconds for demo
  }

  getSystemAudioDevice() {
    // Platform-specific system audio devices
    switch (process.platform) {
      case 'darwin':
        // macOS: Use system audio device
        return 'default';
      case 'win32':
        // Windows: Use WASAPI loopback
        return 'default';
      case 'linux':
        // Linux: Use PulseAudio monitor
        return 'default';
      default:
        return 'default';
    }
  }
}

class WhisperSTTService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseURL = 'https://api.openai.com/v1';
  }

  updateApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  async transcribe(audioFilePath) {
    try {
      const FormData = require('form-data');
      const axios = require('axios');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'json');
      
      const response = await axios.post(
        `${this.baseURL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders()
          },
          timeout: 30000
        }
      );

      return response.data.text;
      
    } catch (error) {
      console.error('Whisper STT error:', error);
      
      // Fallback to local STT if available
      return await this.fallbackSTT(audioFilePath);
    }
  }

  async fallbackSTT(audioFilePath) {
    // Fallback to local speech recognition
    // This could use system speech recognition APIs
    console.log('Using fallback STT for:', audioFilePath);
    
    // For now, return empty string
    // In production, implement platform-specific STT
    return '';
  }
}

module.exports = AudioCapture;