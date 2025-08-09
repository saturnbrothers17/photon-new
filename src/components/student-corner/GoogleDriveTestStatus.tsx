'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, CheckCircle, Sync, Database, Shield, RefreshCw, Globe } from 'lucide-react';
import { useCloudTests } from '@/hooks/useCloudTests';

export default function GoogleDriveTestStatus() {
  const { 
    fetchCloudTests, 
    isCloudAvailable, 
    isLoading, 
    cloudTests,
    getLocalTests 
  } = useCloudTests();
  
  const [localTestCount, setLocalTestCount] = useState(0);
  const [cloudTestCount, setCloudTestCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    checkTestStatus();
    if (isCloudAvailable) {
      loadCloudTests();
    }
  }, [isCloudAvailable]);

  const checkTestStatus = () => {
    try {
      // Get local test count
      const localTests = getLocalTests();
      setLocalTestCount(localTests.length);

      // Get last sync time
      if (isCloudAvailable) {
        setLastSync(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Error checking test status:', error);
    }
  };

  const loadCloudTests = async () => {
    try {
      const tests = await fetchCloudTests();
      setCloudTestCount(tests.filter(t => t.isCloudTest).length);
    } catch (error) {
      console.error('Error loading cloud tests:', error);
    }
  };

  const handleRefresh = async () => {
    if (isCloudAvailable) {
      await loadCloudTests();
      checkTestStatus();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Test Availability Status
          <Badge variant={isCloudBackedUp ? 'default' : 'secondary'}>
            {isCloudBackedUp ? 'Cloud Synced' : 'Local Only'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time status of available tests and cloud backup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Database className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Local Tests</p>
              <p className="text-2xl font-bold text-blue-900">{localTestCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Globe className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Cloud Tests</p>
              <p className="text-2xl font-bold text-green-900">{cloudTestCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Cloud className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-800">Cross-Device</p>
              <p className="text-sm text-purple-700">
                {isCloudAvailable ? 'Available' : 'Not Connected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <Sync className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Last Sync</p>
              <p className="text-sm text-orange-700">
                {lastSync ? 'Just now' : 'Not synced'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Button 
            onClick={handleRefresh}
            disabled={isLoading || !isCloudAvailable}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Refresh Tests'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Cross-Device Test Access:</p>
              <ul className="space-y-1 text-xs">
                <li>• Teachers create tests on their devices → Published to cloud</li>
                <li>• Students access tests from any device/browser</li>
                <li>• {isCloudAvailable ? 'Cloud sync active - tests available everywhere' : 'Connect to Google Drive for cross-device access'}</li>
                <li>• Local tests for fast access, cloud tests for universal availability</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}