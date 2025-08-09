import { useEffect } from 'react';
import { subscribeToTable } from '@/lib/supabase';

type TableName = 'tests' | 'study_materials' | 'questions' | 'test_attempts' | 'student_answers';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export const useRealtime = <T>(
  table: TableName,
  event: EventType,
  filter: string = '',
  callback: (payload: {
    event: EventType;
    new: T;
    old: T;
  }) => void
) => {
  useEffect(() => {
    const unsubscribe = subscribeToTable(
      table,
      filter,
      (payload: any) => {
        if (event === '*' || payload.eventType === event) {
          callback(payload);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [table, event, filter, callback]);
};

export const useRealtimeTests = (
  callback: (payload: {
    event: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Database['public']['Tables']['tests']['Row'];
    old: Database['public']['Tables']['tests']['Row'];
  }) => void,
  filter: string = ''
) => {
  return useRealtime<Database['public']['Tables']['tests']['Row']>('tests', '*', filter, callback);
};

export const useRealtimeStudyMaterials = (
  callback: (payload: {
    event: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Database['public']['Tables']['study_materials']['Row'];
    old: Database['public']['Tables']['study_materials']['Row'];
  }) => void,
  filter: string = ''
) => {
  return useRealtime<Database['public']['Tables']['study_materials']['Row']>(
    'study_materials',
    '*',
    filter,
    callback
  );
};
