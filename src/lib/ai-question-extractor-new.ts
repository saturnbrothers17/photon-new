// POWERFUL AI QUESTION EXTRACTION SYSTEM
// Uses OpenRouter AI (Primary) + Qwen AI + Gemini (Fallback) + Advanced OCR for maximum accuracy
'use client';

export interface AIExtractedQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer?: number;
  subject?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  marks?: number;
  explanation?: string;
  confidence: number;
  extractionMethod: 'AI_VISION' | 'OCR_ADVANCED' | 'HYBRID';
}

export interface ExtractionResult {
  questions: AIExtractedQuestion[];
  totalFound: number;
  successRate: number;
  processingTime: number;
  rawText?: string;
  debugInfo: string[];
}

export interface ExtractionOptions {
  geminiApiKey?: string;
  qwenApiKey?: string;
  openRouterApiKey?: string;
  debug?: boolean;
  primaryProvider?: 'qwen' | 'gemini' | 'openrouter';
}

export class PowerfulQuestionExtractor {
  private openRouterApiKey: string | null;
  private geminiApiKey: string | null;
  private qwenApiKey: string | null;
  private debugLogs: string[] = [];
  private primaryProvider: 'qwen' | 'gemini' | 'openrouter';

  constructor(options: ExtractionOptions = {}) {
    this.openRouterApiKey = options.openRouterApiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || null;
    this.geminiApiKey = options.geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
    this.qwenApiKey = options.qwenApiKey || process.env.NEXT_PUBLIC_QWEN_API_KEY || null;
    this.primaryProvider = options.primaryProvider || 'openrouter';
  }

  setApiKey(apiKey: string, provider: 'qwen' | 'gemini' | 'openrouter' = 'openrouter') {
    if (provider === 'qwen') {
      this.qwenApiKey = apiKey;
      this.log(' Qwen API key configured');
    } else if (provider === 'gemini') {
      this.geminiApiKey = apiKey;
      this.log(' Gemini API key configured');
    } else if (provider === 'openrouter') {
      this.openRouterApiKey = apiKey;
      this.log(' OpenRouter API key configured');
    }
  }

  setProvider(provider: 'qwen' | 'gemini' | 'openrouter') {
    this.primaryProvider = provider;
    this.log(` Switched to ${provider} AI provider`);
  }

  private log(message: string) {
    console.log(message);
    this.debugLogs.push(`${new Date().toLocaleTimeString()}: ${message}`);
  }

  // MAIN EXTRACTION METHOD
  async extractQuestions(file: File): Promise<ExtractionResult> {
    const startTime = Date.now();
    this.debugLogs = [];
    this.log(' Starting AI-powered question extraction...');

    try {
      if (!file) {
        throw new Error('No file provided');
      }

      this.log(` Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      let questions: AIExtractedQuestion[] = [];

      // Strategy 1: Try OpenRouter AI Vision first
      if (this.openRouterApiKey && file.type.startsWith('image/')) {
        this.log(' Attempting OpenRouter AI Vision extraction...');
        try {
          questions = await this.extractWithOpenRouterVision(file);
          if (questions.length > 0) {
            this.log(` OpenRouter AI found ${questions.length} questions`);
          }
        } catch (error: any) {
          this.log(` OpenRouter AI Vision failed: ${error.message}`);
        }
      }

      // Fallback to direct Qwen API
      if (questions.length === 0 && this.qwenApiKey && file.type.startsWith('image/')) {
        this.log(' Attempting Qwen AI Vision extraction...');
        try {
          questions = await this.extractWithQwenVision(file);
          if (questions.length > 0) {
            this.log(` Qwen AI found ${questions.length} questions`);
          }
        } catch (error: any) {
          this.log(` Qwen AI Vision failed: ${error.message}`);
        }
      }

      // Fallback to direct Gemini API
      if (questions.length === 0 && this.geminiApiKey && file.type.startsWith('image/')) {
        this.log(' Attempting Gemini AI Vision extraction...');
        try {
          questions = await this.extractWithGeminiVision(file);
          if (questions.length > 0) {
            this.log(` Gemini AI found ${questions.length} questions`);
          }
        } catch (error: any) {
          this.log(` Gemini AI Vision failed: ${error.message}`);
        }
      }

      // Strategy 2: Advanced OCR fallback
      if (questions.length === 0) {
        this.log(' Using Advanced OCR extraction...');
        try {
          questions = await this.extractWithAdvancedOCR(file);
          this.log(` OCR found ${questions.length} questions`);
        } catch (error: any) {
          this.log(` OCR failed: ${error.message}`);
        }
      }

      // Strategy 3: Hybrid approach (combine both)
      if (questions.length === 0 && (this.qwenApiKey || this.geminiApiKey)) {
        this.log(' Trying hybrid AI + OCR approach...');
        try {
          questions = await this.extractWithHybridMethod(file);
          this.log(` Hybrid method found ${questions.length} questions`);
        } catch (error: any) {
          this.log(` Hybrid method failed: ${error.message}`);
        }
      }

      const processingTime = Date.now() - startTime;
      const successRate = questions.length > 0 ? 
        questions.filter(q => q.confidence > 70).length / questions.length * 100 : 0;

      this.log(` Extraction complete: ${questions.length} questions in ${processingTime}ms`);

      return {
        questions,
        totalFound: questions.length,
        successRate,
        processingTime,
        debugInfo: [...this.debugLogs]
      };

    } catch (error: any) {
      this.log(` Extraction failed: ${error.message}`);
      throw error;
    }
  }

  // OPENROUTER AI VISION EXTRACTION (Primary)
  private async extractWithOpenRouterVision(file: File): Promise<AIExtractedQuestion[]> {
    if (!this.openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(file);
      
      const prompt = `
You are an expert question extraction AI. Analyze this image and extract ALL multiple choice questions (MCQs) with perfect accuracy.

EXTRACTION RULES:
1. Find ALL questions in the image
2. Extract question text exactly as written
3. Extract ALL options (A, B, C, D) exactly as written
4. Identify the correct answer if marked
5. Determine subject and difficulty if possible
6. Assign confidence score (0-100)

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "questionText": "exact question text",
      "options": ["option A text", "option B text", "option C text", "option D text"],
      "correctAnswer": 2,
      "subject": "Physics/Chemistry/Math/Biology/etc",
      "difficulty": "Easy/Medium/Hard",
      "confidence": 95
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No explanations or extra text.
`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4-vision-preview',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64Image}` } }
            ]
          }],
          max_tokens: 2000,
          temperature: 0.4
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from OpenRouter AI');
      }

      // Parse AI response
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanResponse);
      } catch (parseError: any) {
        this.log(`JSON parse error in OpenRouter Vision: ${parseError.message}`);
        this.log(`Raw response: ${cleanResponse.substring(0, 200)}...`);
        throw new Error('Failed to parse OpenRouter Vision response as JSON');
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid OpenRouter Vision response format: questions array not found');
      }

      return parsed.questions.map((q: any, index: number) => ({
        id: `openrouter_${Date.now()}_${index}`,
        questionText: q.questionText || '',
        options: q.options || ['', '', '', ''],
        correctAnswer: q.correctAnswer,
        subject: q.subject || 'General',
        difficulty: q.difficulty || 'Medium',
        marks: 4,
        explanation: q.explanation || '',
        confidence: q.confidence || 95,
        extractionMethod: 'AI_VISION' as const
      }));

    } catch (error: any) {
      this.log(`OpenRouter Vision error: ${error.message}`);
      throw error;
    }
  }

  // QWEN AI VISION EXTRACTION (Primary)
  private async extractWithQwenVision(file: File): Promise<AIExtractedQuestion[]> {
    if (!this.qwenApiKey) {
      throw new Error('Qwen API key not configured');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(file);
      
      const prompt = `
You are an expert question extraction AI. Analyze this image and extract ALL multiple choice questions (MCQs) with perfect accuracy.

EXTRACTION RULES:
1. Find ALL questions in the image
2. Extract question text exactly as written
3. Extract ALL options (A, B, C, D) exactly as written
4. Identify the correct answer if marked
5. Determine subject and difficulty if possible
6. Assign confidence score (0-100)

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "questionText": "exact question text",
      "options": ["option A text", "option B text", "option C text", "option D text"],
      "correctAnswer": 2,
      "subject": "Physics/Chemistry/Math/Biology/etc",
      "difficulty": "Easy/Medium/Hard",
      "confidence": 95
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No explanations or extra text.
`;

      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.qwenApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-vl-max',
          input: {
            messages: [{
              role: 'user',
              content: [{
                image: `data:${file.type};base64,${base64Image}`
              }, {
                text: prompt
              }]
            }]
          },
          parameters: {
            max_tokens: 2000,
            temperature: 0.4
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.output?.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from Qwen AI');
      }

      // Parse AI response
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanResponse);
      } catch (parseError: any) {
        this.log(`JSON parse error in Qwen Vision: ${parseError.message}`);
        this.log(`Raw response: ${cleanResponse.substring(0, 200)}...`);
        throw new Error('Failed to parse Qwen Vision response as JSON');
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid Qwen Vision response format: questions array not found');
      }

      return parsed.questions.map((q: any, index: number) => ({
        id: `qwen_${Date.now()}_${index}`,
        questionText: q.questionText || '',
        options: q.options || ['', '', '', ''],
        correctAnswer: q.correctAnswer,
        subject: q.subject || 'General',
        difficulty: q.difficulty || 'Medium',
        marks: 4,
        explanation: q.explanation || '',
        confidence: q.confidence || 90,
        extractionMethod: 'AI_VISION' as const
      }));

    } catch (error: any) {
      this.log(`Qwen Vision error: ${error.message}`);
      throw error;
    }
  }

  // GEMINI AI VISION EXTRACTION (Fallback)
  private async extractWithGeminiVision(file: File): Promise<AIExtractedQuestion[]> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(file);
      
      const prompt = `
You are an expert question extraction AI. Analyze this image and extract ALL multiple choice questions (MCQs) with perfect accuracy.

EXTRACTION RULES:
1. Find ALL questions in the image
2. Extract question text exactly as written
3. Extract ALL options (A, B, C, D) exactly as written
4. Identify the correct answer if marked
5. Determine subject and difficulty if possible
6. Assign confidence score (0-100)

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "questionText": "exact question text",
      "options": ["option A text", "option B text", "option C text", "option D text"],
      "correctAnswer": 2,
      "subject": "Physics/Chemistry/Math/Biology/etc",
      "difficulty": "Easy/Medium/Hard",
      "confidence": 95
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No explanations or extra text.
`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + this.geminiApiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Image.split(',')[1]
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from Gemini AI');
      }

      // Parse AI response
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanResponse);
      } catch (parseError: any) {
        this.log(`JSON parse error in Gemini Vision: ${parseError.message}`);
        this.log(`Raw response: ${cleanResponse.substring(0, 200)}...`);
        throw new Error('Failed to parse Gemini Vision response as JSON');
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid Gemini Vision response format: questions array not found');
      }

      return parsed.questions.map((q: any, index: number) => ({
        id: `gemini_${Date.now()}_${index}`,
        questionText: q.questionText || '',
        options: q.options || ['', '', '', ''],
        correctAnswer: q.correctAnswer,
        subject: q.subject || 'General',
        difficulty: q.difficulty || 'Medium',
        marks: 4,
        explanation: '',
        confidence: q.confidence || 90,
        extractionMethod: 'AI_VISION' as const
      }));

    } catch (error: any) {
      this.log(`Gemini Vision error: ${error.message}`);
      throw error;
    }
  }

  // ADVANCED OCR EXTRACTION
  private async extractWithAdvancedOCR(file: File): Promise<AIExtractedQuestion[]> {
    try {
      // Dynamic import to avoid SSR issues
      const Tesseract = await import('tesseract.js');
      
      this.log(' Processing with advanced OCR...');
      
      const { data: { text, confidence } } = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              this.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      this.log(` OCR completed with ${confidence}% confidence`);
      this.log(`Raw text length: ${text.length} characters`);

      // Parse the OCR text
      const questions = this.parseOCRText(text);
      
      return questions.map((q, index) => ({
        ...q,
        id: `ocr_${Date.now()}_${index}`,
        extractionMethod: 'OCR_ADVANCED' as const
      }));

    } catch (error: any) {
      this.log(`OCR error: ${error.message}`);
      throw error;
    }
  }

  // HYBRID METHOD (AI + OCR)
  private async extractWithHybridMethod(file: File): Promise<AIExtractedQuestion[]> {
    try {
      // First get OCR text
      const Tesseract = await import('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text extracted from OCR in hybrid method');
      }
      
      // Then use AI to parse the OCR text - try Qwen first, then Gemini
      const prompt = `
Extract MCQ questions from this OCR text. Fix any OCR errors and format properly.

OCR TEXT:
${text}

Return JSON format:
{
  "questions": [
    {
      "questionText": "corrected question text",
      "options": ["option A", "option B", "option C", "option D"],
      "confidence": 85
    }
  ]
}
`;

      let apiUrl = '';
      let headers = {};
      let body = {};

      // Try Qwen first for hybrid method
      if (this.qwenApiKey) {
        apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.qwenApiKey}`
        };
        body = {
          model: 'qwen-turbo',
          input: {
            messages: [{ role: 'user', content: prompt }]
          },
          parameters: {
            max_tokens: 2000,
            temperature: 0.1
          }
        };
      } else if (this.geminiApiKey) {
        apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + this.geminiApiKey;
        headers = { 'Content-Type': 'application/json' };
        body = {
          contents: [{ parts: [{ text: prompt }] }]
        };
      }

      if (!apiUrl) {
        throw new Error('No AI API key configured for hybrid method');
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Hybrid method API error: ${response.status}`);
      }

      const data = await response.json();
      
      let aiResponse = '';
      if (this.qwenApiKey && this.qwenApiKey.length > 0) {
        aiResponse = data.output?.choices?.[0]?.message?.content;
      } else {
        aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      }
      
      if (!aiResponse) {
        throw new Error('No response from AI in hybrid method');
      }
      
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanResponse);
      } catch (parseError: any) {
        this.log(`JSON parse error in hybrid method: ${parseError.message}`);
        this.log(`Raw response: ${cleanResponse.substring(0, 200)}...`);
        throw new Error('Failed to parse hybrid AI response as JSON');
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        this.log('Invalid hybrid response format: questions array not found');
        return []; // Return empty array instead of throwing
      }

      return parsed.questions.map((q: any, index: number) => ({
        id: `hybrid_${Date.now()}_${index}`,
        questionText: q.questionText || '',
        options: q.options || ['', '', '', ''],
        subject: 'General',
        difficulty: 'Medium' as const,
        marks: 4,
        explanation: '',
        confidence: q.confidence || 80,
        extractionMethod: 'HYBRID' as const
      }));

    } catch (error: any) {
      this.log(`Hybrid method error: ${error.message}`);
      throw error;
    }
  }

  // PARSE OCR TEXT
  private parseOCRText(text: string): Omit<AIExtractedQuestion, 'id' | 'extractionMethod'>[] {
    const questions: Omit<AIExtractedQuestion, 'id' | 'extractionMethod'>[] = [];
    
    // Clean and normalize text
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[|]/g, 'I')
      .replace(/[0O]/g, 'O')
      .trim();

    // Find question patterns
    const questionBlocks = cleanText.split(/(?=\d+[\.\)]\s*)/);
    
    for (const block of questionBlocks) {
      if (block.trim().length < 20) continue;
      
      const question = this.parseQuestionBlock(block);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  // PARSE QUESTION BLOCK
  private parseQuestionBlock(block: string): Omit<AIExtractedQuestion, 'id' | 'extractionMethod'> | null {
    try {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let questionText = '';
      const options: string[] = [];
      let foundOptions = false;
      
      for (const line of lines) {
        if (this.isOptionLine(line)) {
          foundOptions = true;
          const optionText = this.extractOptionText(line);
          if (optionText) {
            options.push(optionText);
          }
        } else if (!foundOptions) {
          questionText += (questionText ? ' ' : '') + line;
        }
      }
      
      // Clean question text
      questionText = questionText.replace(/^\d+[\.\)]\s*/, '').trim();
      
      // Ensure 4 options
      while (options.length < 4) {
        options.push('');
      }
      
      if (questionText.length > 10 && options.filter(opt => opt.length > 0).length >= 3) {
        return {
          questionText,
          options: options.slice(0, 4),
          subject: 'General',
          difficulty: 'Medium',
          marks: 4,
          explanation: '',
          confidence: this.calculateConfidence(questionText, options)
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // HELPER METHODS
  private isOptionLine(line: string): boolean {
    return /^[A-D][\.\)]\s*/.test(line) || /^\([A-D]\)\s*/.test(line);
  }

  private extractOptionText(line: string): string {
    return line.replace(/^[A-D][\.\)]\s*/, '').replace(/^\([A-D]\)\s*/, '').trim();
  }

  private calculateConfidence(questionText: string, options: string[]): number {
    let score = 100;
    
    if (questionText.length < 20) score -= 20;
    if (questionText.length < 10) score -= 30;
    
    const emptyOptions = options.filter(opt => opt.length === 0).length;
    score -= emptyOptions * 15;
    
    if (questionText.includes('?')) score += 10;
    if (/\b(what|which|how|when|where|why|who)\b/i.test(questionText)) score += 5;
    
    return Math.max(30, Math.min(100, score));
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instance
export const powerfulExtractor = new PowerfulQuestionExtractor();