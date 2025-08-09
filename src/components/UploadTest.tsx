'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function UploadTest() {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const testUpload = async () => {
    setIsTesting(true);
    try {
      // Test 1: Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Not authenticated',
          description: 'Please log in to test upload',
          variant: 'destructive',
        });
        return;
      }

      // Test 2: Check if study_materials table exists
      const { data: tableData, error: tableError } = await supabase
        .from('study_materials')
        .select('*')
        .limit(1);

      if (tableError) {
        toast({
          title: 'Table Error',
          description: `study_materials table: ${tableError.message}`,
          variant: 'destructive',
        });
        return;
      }

      // Test 3: Check if storage bucket exists
      const { data: bucketData, error: bucketError } = await supabase.storage
        .from('study-materials')
        .list('', { limit: 1 });

      if (bucketError) {
        toast({
          title: 'Storage Error',
          description: `study-materials bucket: ${bucketError.message}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'All tests passed',
        description: 'Upload system is ready to use',
      });

    } catch (error) {
      toast({
        title: 'Test failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={testUpload} disabled={isTesting}>
        {isTesting ? 'Testing...' : 'Test Upload System'}
      </Button>
    </div>
  );
}
