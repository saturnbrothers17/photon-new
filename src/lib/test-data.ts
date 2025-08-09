// Test data management utilities
// This module provides compatibility for legacy test data operations

export interface TestData {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  duration_minutes: number;
  questions: Question[];
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  marks: number;
}

// Legacy compatibility functions
export const getTestById = async (testId: string): Promise<TestData | null> => {
  try {
    // Redirect to Supabase API
    const response = await fetch(`/api/supabase/tests?action=get-by-id&testId=${testId}`);
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching test:', error);
    return null;
  }
};

export const getAllTests = async (): Promise<TestData[]> => {
  try {
    // Redirect to Supabase API
    const response = await fetch('/api/supabase/tests?action=get-all');
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching tests:', error);
    return [];
  }
};

export const saveTest = async (testData: Partial<TestData>): Promise<boolean> => {
  try {
    // Redirect to Supabase API
    const response = await fetch('/api/supabase/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', testData })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving test:', error);
    return false;
  }
};

export const updateTest = async (testId: string, testData: Partial<TestData>): Promise<boolean> => {
  try {
    // Redirect to Supabase API
    const response = await fetch('/api/supabase/tests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', testId, testData })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error updating test:', error);
    return false;
  }
};

export const deleteTest = async (testId: string): Promise<boolean> => {
  try {
    // Redirect to Supabase API
    const response = await fetch('/api/supabase/tests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', testId })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting test:', error);
    return false;
  }
};