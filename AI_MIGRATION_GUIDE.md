# AI Migration Guide: DeepSeek to Qwen 2.5 72B via OpenRouter

## Overview
This document outlines the migration from DeepSeek API to Qwen 2.5 72B via OpenRouter for all text-based AI solutions in the PHOTON Coaching Institute platform.

## Changes Made

### 1. Environment Configuration
**Updated `.env.local.example`:**
- Removed: `DEEPSEEK_API_KEY`
- Enhanced: `NEXT_PUBLIC_OPENROUTER_API_KEY` (now primary for text solutions)
- Added: Model configuration variables for better flexibility

### 2. API Routes Updated
**Files Modified:**
- `src/app/api/ai-solutions/route.ts`
- `src/app/api/live-solution/route.ts`
- `src/app/api/solve-question/route.ts` (already using OpenRouter)

**Key Changes:**
- API endpoint: `https://api.deepseek.com/chat/completions` → `https://openrouter.ai/api/v1/chat/completions`
- Model: `deepseek-chat` → `qwen/qwen-2.5-72b-instruct`
- Authentication: Bearer token with OpenRouter API key
- Headers: Added HTTP-Referer and X-Title for OpenRouter requirements

### 3. Error Handling & Logging
- Updated all console logs to reference Qwen instead of DeepSeek
- Maintained the same error handling structure
- Preserved fallback mechanisms for reliability

## Benefits of Migration

### 1. Model Performance
- **Qwen 2.5 72B**: More advanced reasoning capabilities
- **Better Mathematical Understanding**: Enhanced performance on JEE/NEET problems
- **Improved JSON Consistency**: More reliable structured responses

### 2. API Reliability
- **OpenRouter**: Unified API with better uptime
- **Rate Limiting**: More generous limits for educational use
- **Fallback Options**: OpenRouter provides model fallbacks

### 3. Cost Efficiency
- **Competitive Pricing**: OpenRouter offers competitive rates
- **Usage Tracking**: Better monitoring and analytics
- **Flexible Billing**: Pay-per-use model

## Current AI Architecture

### Text-Based Solutions (Students)
- **Primary**: Qwen 2.5 72B via OpenRouter
- **Use Cases**: 
  - Question solving with step-by-step explanations
  - Live tutoring responses
  - Test analysis and feedback
  - Mathematical problem solving

### Image-Based Processing (Teachers)
- **Primary**: Google Gemini Vision
- **Use Cases**:
  - Question extraction from images
  - Handwriting recognition
  - Diagram analysis

## Environment Setup

### Required API Keys
```env
# OpenRouter (Primary for text solutions)
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Gemini (For image processing)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Configuration
NEXT_PUBLIC_AI_PROVIDER=openrouter
NEXT_PUBLIC_QWEN_MODEL=qwen/qwen-2.5-72b-instruct
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

### Getting OpenRouter API Key
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Add credits to your account for usage

## Testing the Migration

### 1. Question Solver Test
```bash
# Test the question solver endpoint
curl -X POST http://localhost:3000/api/solve-question \
  -H "Content-Type: application/json" \
  -d '{"question": {"question": {"id": "test", "questionText": "What is 2+2?", "options": ["3", "4", "5", "6"], "correctAnswer": "4", "subject": "Mathematics"}, "selectedAnswer": "4", "isCorrect": true}}'
```

### 2. Live Solution Test
```bash
# Test the live solution endpoint
curl -X POST http://localhost:3000/api/live-solution \
  -H "Content-Type: application/json" \
  -d '{"question": {"question": {"id": "test", "questionText": "Solve x^2 = 16", "options": ["x=4", "x=±4", "x=-4", "x=8"], "correctAnswer": "x=±4", "subject": "Mathematics"}, "selectedAnswer": "x=4", "isCorrect": false}}'
```

### 3. AI Solutions Test
```bash
# Test the AI solutions endpoint
curl -X POST http://localhost:3000/api/ai-solutions \
  -H "Content-Type: application/json" \
  -d '{"questions": [{"question": {"id": "test", "questionText": "What is the derivative of x^2?", "options": ["x", "2x", "x^2", "2"], "correctAnswer": "2x", "subject": "Mathematics"}, "selectedAnswer": "x", "isCorrect": false}]}'
```

## Monitoring & Maintenance

### 1. Performance Monitoring
- Monitor response times for Qwen 2.5 72B
- Track API usage and costs via OpenRouter dashboard
- Monitor error rates and fallback usage

### 2. Quality Assurance
- Regular testing of solution quality
- Comparison with previous DeepSeek responses
- Student feedback collection

### 3. Backup Plans
- Maintain fallback solution generators
- Consider secondary AI providers if needed
- Regular backup of successful response patterns

## Migration Checklist

- [x] Update environment configuration
- [x] Migrate ai-solutions route
- [x] Migrate live-solution route  
- [x] Update error messages and logging
- [x] Update project documentation
- [x] Create migration guide
- [ ] Test all endpoints thoroughly
- [ ] Deploy to staging environment
- [ ] Monitor performance metrics
- [ ] Deploy to production

## Rollback Plan

If issues arise, rollback involves:
1. Revert API endpoints to DeepSeek
2. Update environment variables
3. Restore previous authentication headers
4. Update error messages back to DeepSeek references

The fallback solution generators remain unchanged, providing continuity during any transition issues.

## Support

For issues related to this migration:
1. Check OpenRouter API status
2. Verify API key configuration
3. Monitor console logs for specific error messages
4. Test with fallback solutions to isolate AI vs. application issues

---

**Migration Completed**: ✅ All text-based AI solutions now use Qwen 2.5 72B via OpenRouter
**Status**: Ready for testing and deployment