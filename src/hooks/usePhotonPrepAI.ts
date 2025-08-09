/**
 * React Hook for PHOTON Prep AI Solutions
 * Manages AI solution generation for test questions
 */

import { useState, useEffect, useCallback } from 'react';

interface AISolution {
  explanation: string;
  stepByStep: string[];
  tips: string[];
  relatedConcepts: string[];
  correctAnswer: string;
  confidence: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionData {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  studentAnswer?: string;
  isCorrect?: boolean;
}

interface UsePhotonPrepAIProps {
  questions: QuestionData[];
  enabled?: boolean;
}

interface UsePhotonPrepAIResult {
  solutions: { [key: string]: AISolution };
  isLoading: boolean;
  error: string | null;
  generateSolution: (question: QuestionData) => Promise<AISolution | null>;
  regenerateSolution: (questionId: string) => Promise<void>;
  aiStatus: string;
}

export function usePhotonPrepAI({ 
  questions = [], 
  enabled = true 
}: UsePhotonPrepAIProps): UsePhotonPrepAIResult {
  const [solutions, setSolutions] = useState<{ [key: string]: AISolution }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string>('Ready');

  /**
   * Generate AI solution for a single question
   */
  const generateSolution = useCallback(async (question: QuestionData): Promise<AISolution | null> => {
    if (!enabled) return null;

    setIsLoading(true);
    setError(null);
    setAiStatus('PHOTON Prep is analyzing...');

    try {
      const response = await fetch('/api/ai-solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-single-solution',
          question: question
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI solution');
      }

      const data = await response.json();
      const solution = data.solution;

      setSolutions(prev => ({
        ...prev,
        [question.id]: solution
      }));

      setAiStatus('Solution generated successfully');
      return solution;

    } catch (error) {
      console.error('Error generating AI solution:', error);
      setError('Failed to generate AI solution');
      setAiStatus('Error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  /**
   * Generate solutions for all questions
   */
  const generateAllSolutions = useCallback(async () => {
    if (!enabled || questions.length === 0) return;

    setIsLoading(true);
    setError(null);
    setAiStatus('PHOTON Prep is analyzing all questions...');

    try {
      const response = await fetch('/api/ai-solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-solutions',
          questions: questions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI solutions');
      }

      const data = await response.json();
      const solutionsMap: { [key: string]: AISolution } = {};

      data.solutions.forEach((sol: any) => {
        if (sol.solution) {
          solutionsMap[sol.questionId] = sol.solution;
        }
      });

      setSolutions(solutionsMap);
      setAiStatus('All solutions generated successfully');

    } catch (error) {
      console.error('Error generating AI solutions:', error);
      setError('Failed to generate AI solutions');
      setAiStatus('Error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [questions, enabled]);

  /**
   * Regenerate solution for a specific question
   */
  const regenerateSolution = useCallback(async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    setAiStatus('Regenerating solution...');
    await generateSolution(question);
  }, [questions, generateSolution]);

  /**
   * Generate fallback solution locally
   */
  const generateFallbackSolution = useCallback((question: QuestionData): AISolution => {
    const subject = question.subject.toLowerCase();
    
    return {
      explanation: `PHOTON Prep's analysis for ${question.subject}: ${question.questionText}`,
      stepByStep: [
        "Step 1: Carefully read and understand the question",
        "Step 2: Identify the key concepts being tested",
        "Step 3: Apply the appropriate problem-solving approach",
        `Step 4: The correct answer is ${question.correctAnswer}`
      ],
      tips: [
        'Take your time to understand what the question is asking',
        'Break complex problems into smaller parts',
        'Practice similar problems to improve',
        'Review the fundamental concepts regularly'
      ],
      relatedConcepts: [
        question.subject,
        'Problem Solving',
        'Critical Thinking',
        'Exam Strategy'
      ],
      correctAnswer: question.correctAnswer,
      confidence: 0.85,
      subject: question.subject,
      difficulty: 'medium'
    };
  }, []);

  /**
   * Auto-generate solutions when questions change
   */
  useEffect(() => {
    if (enabled && questions.length > 0) {
      generateAllSolutions();
    }
  }, [questions, enabled, generateAllSolutions]);

  return {
    solutions,
    isLoading,
    error,
    generateSolution,
    regenerateSolution,
    aiStatus
  };
}

/**
 * Hook for single question AI solution
 */
export function useSinglePhotonPrepAI(question: QuestionData | null) {
  const [solution, setSolution] = useState<AISolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSolution = useCallback(async () => {
    if (!question) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-single-solution',
          question: question
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI solution');
      }

      const data = await response.json();
      setSolution(data.solution);

    } catch (error) {
      console.error('Error generating AI solution:', error);
      setError('Failed to generate AI solution');
    } finally {
      setIsLoading(false);
    }
  }, [question]);

  useEffect(() => {
    if (question) {
      generateSolution();
    }
  }, [question, generateSolution]);

  return {
    solution,
    isLoading,
    error,
    generateSolution
  };
}
