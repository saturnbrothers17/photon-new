export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tests: {
        Row: {
          id: string
          title: string
          description: string | null
          subject: string
          class_level: string | null
          duration_minutes: number | null
          total_marks: number | null
          passing_marks: number | null
          is_published: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          subject: string
          class_level?: string | null
          duration_minutes?: number | null
          total_marks?: number | null
          passing_marks?: number | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          subject?: string
          class_level?: string | null
          duration_minutes?: number | null
          total_marks?: number | null
          passing_marks?: number | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      questions: {
        Row: {
          id: string
          test_id: string
          question_text: string
          question_type: string
          options: Json | null
          correct_answer: string | null
          marks: number
          solution: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          question_text: string
          question_type?: string
          options?: Json | null
          correct_answer?: string | null
          marks?: number
          solution?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          question_text?: string
          question_type?: string
          options?: Json | null
          correct_answer?: string | null
          marks?: number
          solution?: Json | null
          created_at?: string
        }
      }
      test_attempts: {
        Row: {
          id: string
          test_id: string
          student_id: string
          started_at: string
          submitted_at: string | null
          score: number | null
          percentage: number | null
          status: string
        }
        Insert: {
          id?: string
          test_id: string
          student_id: string
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          percentage?: number | null
          status?: string
        }
        Update: {
          id?: string
          test_id?: string
          student_id?: string
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          percentage?: number | null
          status?: string
        }
      }
      student_answers: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          selected_answer: string | null
          is_correct: boolean | null
          marks_obtained: number | null
          time_spent_seconds: number | null
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          selected_answer?: string | null
          is_correct?: boolean | null
          marks_obtained?: number | null
          time_spent_seconds?: number | null
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          selected_answer?: string | null
          is_correct?: boolean | null
          marks_obtained?: number | null
          time_spent_seconds?: number | null
        }
      }
      study_materials: {
        Row: {
          id: string
          title: string
          description: string | null
          file_path: string
          file_type: string | null
          file_size: number | null
          subject: string | null
          tags: string[] | null
          is_public: boolean
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          file_path: string
          file_type?: string | null
          file_size?: number | null
          subject?: string | null
          tags?: string[] | null
          is_public?: boolean
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          file_path?: string
          file_type?: string | null
          file_size?: number | null
          subject?: string | null
          tags?: string[] | null
          is_public?: boolean
          uploaded_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
