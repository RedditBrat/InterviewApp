const axios = require('axios');

class AIService {
  constructor(apiKey = '', model = 'openai/gpt-4-turbo-preview') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    
    // Question detection patterns and ML model
    this.questionPatterns = [
      /\b(what|how|why|when|where|who|which|can you|could you|would you|do you|are you|is there|have you|will you)\b/i,
      /\?$/,
      /\b(explain|describe|tell me|walk me through|show me)\b/i,
      /\b(implement|write|code|create|build|design)\b/i,
      /\b(algorithm|function|method|class|variable|loop|condition)\b/i
    ];
  }

  updateConfig(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async testConnection() {
    try {
      const response = await this.makeAPICall([
        {
          role: 'user',
          content: 'Respond with "Connection successful" if you can see this message.'
        }
      ]);
      
      return response.includes('Connection successful') || response.includes('successful');
    } catch (error) {
      throw new Error(`API connection failed: ${error.message}`);
    }
  }

  async detectQuestion(text) {
    try {
      // First, use pattern matching for quick detection
      const hasQuestionPattern = this.questionPatterns.some(pattern => pattern.test(text));
      
      if (!hasQuestionPattern) {
        return false;
      }

      // Use AI for more sophisticated question detection
      const prompt = `Analyze the following text and determine if it's a question that requires an answer in an interview context. 
      
      Consider:
      - Direct questions (starting with question words)
      - Implied questions or requests for information
      - Technical challenges or coding problems
      - Requests to explain concepts
      - Scenario-based questions
      
      Text: "${text}"
      
      Respond with only "YES" if it's a question requiring an answer, or "NO" if it's not.`;

      const response = await this.makeAPICall([
        {
          role: 'system',
          content: 'You are an expert at identifying questions in interview contexts. Be very precise and concise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return response.trim().toUpperCase().includes('YES');
      
    } catch (error) {
      console.error('Question detection error:', error);
      // Fallback to pattern matching
      return this.questionPatterns.some(pattern => pattern.test(text));
    }
  }

  async generateAnswer(question, context = {}) {
    try {
      const {
        jobDescription = '',
        resume = '',
        answerStyle = 'concise',
        experience = '',
        specialization = ''
      } = context;

      // Build the system prompt based on context
      const systemPrompt = this.buildSystemPrompt(answerStyle, jobDescription, resume, experience, specialization);
      
      // Add question to conversation history
      this.addToHistory('user', question);
      
      // Generate answer
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user', content: this.formatQuestionPrompt(question, answerStyle) }
      ];

      const answer = await this.makeAPICall(messages);
      
      // Add answer to conversation history
      this.addToHistory('assistant', answer);
      
      return answer;
      
    } catch (error) {
      console.error('Answer generation error:', error);
      return this.generateFallbackAnswer(question, context);
    }
  }

  buildSystemPrompt(answerStyle, jobDescription, resume, experience, specialization) {
    let prompt = `You are an expert interview assistant helping a software engineer in a live interview. Your goal is to provide accurate, helpful, and natural-sounding answers that demonstrate technical competence.

CRITICAL INSTRUCTIONS:
1. Answer as if YOU are the candidate being interviewed
2. Use first person ("I", "my", "me") when discussing experience
3. Keep answers natural and conversational
4. Show confidence without being arrogant
5. Include specific examples when possible
6. Demonstrate problem-solving thinking process

ANSWER STYLE: ${answerStyle}`;

    if (answerStyle === 'concise') {
      prompt += `
- Keep answers under 30 seconds when spoken
- Focus on key points only
- Be direct and clear`;
    } else if (answerStyle === 'detailed') {
      prompt += `
- Provide comprehensive explanations
- Include examples and edge cases
- Walk through your thinking process`;
    } else if (answerStyle === 'bullet') {
      prompt += `
- Structure answers in clear bullet points
- Each point should be concise but complete
- Use bullet points for better clarity`;
    }

    if (jobDescription) {
      prompt += `\n\nJOB CONTEXT:\n${jobDescription}`;
    }

    if (resume) {
      prompt += `\n\nYOUR BACKGROUND:\n${resume}`;
    }

    if (experience) {
      prompt += `\n\nRELEVANT EXPERIENCE:\n${experience}`;
    }

    if (specialization) {
      prompt += `\n\nSPECIALIZATION:\n${specialization}`;
    }

    prompt += `\n\nTECHNICAL FOCUS AREAS:
- Data Structures & Algorithms
- System Design & Architecture
- Code Optimization & Best Practices
- Problem-Solving Methodology
- Technology Stack Expertise
- Project Management & Collaboration

Remember: You're in a live interview. Answer naturally as the candidate would.`;

    return prompt;
  }

  formatQuestionPrompt(question, answerStyle) {
    let prompt = `Interview Question: "${question}"

Please provide a ${answerStyle} answer that:
1. Directly addresses the question
2. Shows your technical expertise
3. Demonstrates your thought process
4. Sounds natural and confident`;

    if (answerStyle === 'bullet') {
      prompt += '\n5. Uses clear bullet points for structure';
    }

    return prompt;
  }

  generateFallbackAnswer(question, context) {
    const { answerStyle = 'concise' } = context;
    
    // Basic fallback responses for common question types
    if (question.toLowerCase().includes('algorithm')) {
      return answerStyle === 'bullet' 
        ? '• I would approach this by first understanding the problem constraints\n• Then identify the optimal data structure\n• Implement with clear time/space complexity analysis'
        : 'I would start by analyzing the problem constraints, choose the appropriate data structure, and implement with consideration for time and space complexity.';
    }
    
    if (question.toLowerCase().includes('system design')) {
      return answerStyle === 'bullet'
        ? '• Start with requirements gathering and scale estimation\n• Design the high-level architecture\n• Deep dive into component details\n• Consider scalability and reliability'
        : 'I would begin with requirements gathering, estimate scale, design the high-level architecture, and then deep dive into component details while considering scalability.';
    }
    
    return answerStyle === 'bullet'
      ? '• Let me think through this step by step\n• I would need to understand the specific requirements\n• Then apply relevant technical principles\n• And ensure the solution is scalable and maintainable'
      : 'That\'s a great question. Let me think through this systematically, considering the requirements and applying relevant technical principles to ensure a scalable solution.';
  }

  async makeAPICall(messages, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 500,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://interview-assistant-pro.com',
              'X-Title': 'Interview Assistant Pro'
            },
            timeout: 30000
          }
        );

        return response.data.choices[0].message.content;
        
      } catch (error) {
        console.error(`API call attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`API call failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  addToHistory(role, content) {
    this.conversationHistory.push({ role, content });
    
    // Keep history manageable
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return this.conversationHistory;
  }

  // Advanced question analysis
  async analyzeQuestionType(question) {
    try {
      const prompt = `Classify this interview question into one of these categories:
      
      1. CODING - Programming problems, algorithms, data structures
      2. SYSTEM_DESIGN - Architecture, scalability, system components
      3. BEHAVIORAL - Past experience, teamwork, leadership
      4. TECHNICAL_CONCEPT - Explaining technologies, frameworks, concepts
      5. PROBLEM_SOLVING - Logic puzzles, analytical thinking
      6. OTHER - Doesn't fit above categories
      
      Question: "${question}"
      
      Respond with only the category name.`;

      const response = await this.makeAPICall([
        {
          role: 'system',
          content: 'You are an expert at categorizing interview questions. Be precise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return response.trim().toUpperCase();
      
    } catch (error) {
      console.error('Question analysis error:', error);
      return 'OTHER';
    }
  }

  // Get difficulty estimation
  async estimateQuestionDifficulty(question) {
    try {
      const prompt = `Rate the difficulty of this interview question on a scale of 1-5:
      
      1 - Very Easy (basic concepts)
      2 - Easy (simple application)
      3 - Medium (requires some thinking)
      4 - Hard (complex problem-solving)
      5 - Very Hard (expert-level)
      
      Question: "${question}"
      
      Respond with only the number.`;

      const response = await this.makeAPICall([
        {
          role: 'system',
          content: 'You are an expert at assessing interview question difficulty.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      const difficulty = parseInt(response.trim());
      return isNaN(difficulty) ? 3 : Math.max(1, Math.min(5, difficulty));
      
    } catch (error) {
      console.error('Difficulty estimation error:', error);
      return 3; // Default to medium
    }
  }
}

module.exports = AIService;