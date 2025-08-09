# AI Question Extraction Integration Guide

## Overview
This guide explains how to configure and use the dual AI provider system for question extraction from images. The system supports both **Qwen AI** (primary) and **Gemini AI** (fallback) for extracting multiple choice questions from test images.

## Features
- **Dual AI Provider Support**: Qwen AI as primary, Gemini AI as fallback
- **Flexible Configuration**: Easy switching between providers
- **Multiple Extraction Methods**: AI Vision, OCR, and Hybrid approaches
- **Detailed Logging**: Comprehensive debug information
- **Real-time Provider Switching**: UI component for provider management

## Quick Setup

### 1. API Keys Configuration

Create a `.env.local` file in your project root:

```bash
# Qwen AI (Primary Provider)
NEXT_PUBLIC_QWEN_API_KEY=your_qwen_api_key_here

# Gemini AI (Fallback Provider)  
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Set default provider (qwen or gemini)
NEXT_PUBLIC_AI_PROVIDER=qwen
```

### 2. Getting API Keys

#### Qwen AI (Alibaba Cloud)
1. Visit [Alibaba Cloud DashScope](https://dashscope.console.aliyun.com/overview)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to `NEXT_PUBLIC_QWEN_API_KEY`

#### Gemini AI (Google)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to `NEXT_PUBLIC_GEMINI_API_KEY`

### 3. Provider Selection

#### Via Environment Variable
Set `NEXT_PUBLIC_AI_PROVIDER=qwen` or `NEXT_PUBLIC_AI_PROVIDER=gemini` in `.env.local`

#### Via UI Component
Use the AI Provider Selector component to switch providers in real-time:

```tsx
import AIProviderSelector from '@/components/AIProviderSelector';

// In your component
<AIProviderSelector onProviderChange={(provider) => console.log('Switched to', provider)} />
```

## Usage Examples

### Basic Usage

```typescript
import { PowerfulQuestionExtractor } from '@/lib/ai-question-extractor';

const extractor = new PowerfulQuestionExtractor({
  qwenApiKey: process.env.NEXT_PUBLIC_QWEN_API_KEY,
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  debug: true
});

// Extract questions from an image file
const result = await extractor.extractQuestions(imageFile);
console.log('Extracted questions:', result.questions);
```

### Advanced Usage with Provider Switching

```typescript
const extractor = new PowerfulQuestionExtractor();

// Switch to Gemini
extractor.setProvider('gemini');

// Switch to Qwen  
extractor.setProvider('qwen');

// Set API keys dynamically
extractor.setApiKey('your_qwen_key', 'qwen');
extractor.setApiKey('your_gemini_key', 'gemini');
```

## Extraction Methods

### 1. Qwen Vision (Primary)
- Uses Qwen's multimodal AI to directly extract questions from images
- Best for: Clear, high-quality images
- Endpoint: `https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`

### 2. Gemini Vision (Fallback)
- Uses Google's Gemini AI for image analysis
- Best for: Various image formats and qualities
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`

### 3. Advanced OCR
- Uses Tesseract.js for text recognition
- Best for: Text-heavy images or when AI fails
- Provides: Raw text extraction with confidence scores

### 4. Hybrid AI+OCR
- Combines OCR text extraction with AI question parsing
- Best for: Complex layouts or mixed content
- Uses OCR for text, then AI for question structure

## Response Format

All extraction methods return questions in this format:

```typescript
interface AIExtractedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  confidence: number;
  extractionMethod: 'AI_VISION' | 'OCR' | 'HYBRID';
}

interface ExtractionResult {
  questions: AIExtractedQuestion[];
  confidence: number; // 0-100
  extractionTime: number; // milliseconds
  methodsUsed: string[];
  debugInfo: any;
}
```

## Testing Your Setup

### 1. Test Qwen Integration
```bash
# Ensure Qwen API key is set
echo $NEXT_PUBLIC_QWEN_API_KEY

# Test with a sample image
node -e "
const { PowerfulQuestionExtractor } = require('./src/lib/ai-question-extractor');
const extractor = new PowerfulQuestionExtractor({
  qwenApiKey: process.env.NEXT_PUBLIC_QWEN_API_KEY,
  debug: true
});
console.log('Qwen ready:', !!extractor);
"
```

### 2. Test Gemini Integration
```bash
# Ensure Gemini API key is set  
echo $NEXT_PUBLIC_GEMINI_API_KEY

# Test fallback mechanism
node -e "
const { PowerfulQuestionExtractor } = require('./src/lib/ai-question-extractor');
const extractor = new PowerfulQuestionExtractor({
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  debug: true
});
console.log('Gemini ready:', !!extractor);
"
```

### 3. Test UI Component
1. Start your development server
2. Navigate to any page with the AI Provider Selector
3. Click the provider switcher to test real-time switching
4. Check browser console for debug logs

## Troubleshooting

### Common Issues

#### "No API keys configured"
- **Solution**: Check your `.env.local` file and ensure API keys are properly set
- **Verify**: Keys should start with `NEXT_PUBLIC_` prefix

#### "API rate limit exceeded"
- **Solution**: Implement retry logic or upgrade your API plan
- **Qwen**: Check usage limits in Alibaba Cloud console
- **Gemini**: Check quota in Google Cloud console

#### "Network errors"
- **Solution**: Check internet connection and firewall settings
- **Verify**: Try accessing API endpoints directly in browser

### Debug Mode
Enable debug logging to see detailed extraction process:

```typescript
const extractor = new PowerfulQuestionExtractor({
  debug: true,
  qwenApiKey: 'your_key',
  geminiApiKey: 'your_key'
});

// Check browser console for detailed logs
```

## Performance Tips

1. **Image Optimization**: Use compressed images (< 1MB) for faster processing
2. **Batch Processing**: Process multiple images sequentially to avoid rate limits
3. **Caching**: Cache extracted questions to avoid re-processing
4. **Error Handling**: Always implement proper error handling for network issues

## Next Steps

1. **Add Rate Limiting**: Implement client-side rate limiting
2. **Add Progress Indicators**: Show extraction progress to users
3. **Add Retry Logic**: Automatic retry on network failures
4. **Add Analytics**: Track extraction success rates per provider
5. **Add Image Preprocessing**: Resize/crop images before extraction

## Support

For issues or questions:
- Check browser console for detailed error messages
- Verify API keys are active and have sufficient quota
- Test with different image formats and sizes
- Enable debug mode for detailed logging
