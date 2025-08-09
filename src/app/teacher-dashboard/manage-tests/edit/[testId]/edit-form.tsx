"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TestData, updateTest } from '@/lib/test-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditTestFormProps {
  test: TestData;
}

export default function EditTestForm({ test }: EditTestFormProps) {
  const router = useRouter();
  const [name, setName] = useState(test.title);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update only supported fields in TestData via lib/test-data API
      updateTest(test.id, { title: name });
      alert('Test updated successfully!');
      router.push('/teacher-dashboard');
    } catch (error) {
      console.error('Failed to update test:', error);
      alert('Failed to update test. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Test: {test.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Test Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
