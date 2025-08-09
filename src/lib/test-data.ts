// Test data management utilities
import { supabase } from './supabase-server';

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

// Server-side data fetching
export const getTestById = async (testId: string): Promise<TestData | null> => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();
    if (error) {
      console.error('Error fetching test by ID:', error.message);
      return null;
    }
    return data as TestData | null;
  } catch (error) {
    console.error('Error in getTestById:', error);
    return null;
  }
};

export const getAllTests = async (): Promise<TestData[]> => {
  try {
    const { data, error } = await supabase.from('tests').select('*');
    if (error) {
      console.error('Error fetching all tests:', error.message);
      return [];
    }
    return (data as TestData[]) || [];
  } catch (error) {
    console.error('Error in getAllTests:', error);
    return [];
  }
};

export const saveTest = async (testData: Partial<TestData>): Promise<boolean> => {
  try {
    const { error } = await supabase.from('tests').insert([testData]);
    if (error) {
      console.error('Error saving test:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error saving test:', error);
    return false;
  }
};

export const updateTest = async (testId: string, testData: Partial<TestData>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tests')
      .update(testData)
      .eq('id', testId);
    if (error) {
      console.error('Error updating test:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating test:', error);
    return false;
  }
};

export const deleteTest = async (testId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('tests').delete().eq('id', testId);
    if (error) {
      console.error('Error deleting test:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting test:', error);
    return false;
  }
};