'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, CheckCircle, Zap, Database, Shield, RefreshCw, Globe, Server } from 'lucide-react';
import { useSeamlessCloud } from '@/hooks/useSeamlessCloud';

export default function SeamlessCloudStatus() {
  const { 
    tests,
    stats,
    isLoading,
    getStats,
    formatFileSize
  } = useSeamlessCloud();

  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    // Only update timestamp if we have actual data
    if (tests.length > 0 || stats.connected) {
      setLastRefresh(new Date().toLocaleString());
    }
  }, [tests.length, stats.connected]);

  const handleRefresh = async () => {
    await getStats();
    setLastRefresh(new Date().toLocaleString());
  };

  const localTests = tests.filter(t => t.source === 'local');
  const cloudTests = tests.filter(t => t.source === 'cloud' || t.source === 'seamless_cloud');

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Seamless Cloud System
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Always Connected
          </Badge>
        </CardTitle>
        <CardDescription>
          Professional cloud integration - no manual connection required
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Database className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Local Cache</p>
              <p className="text-2xl font-bold text-blue-900">{localTests.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Globe className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Cloud Tests</p>
              <p className="text-2xl font-bold text-green-900">{cloudTests.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Server className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-800">System Status</p>
              <p className="text-sm text-purple-700">{stats.status}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <Cloud className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Storage Used</p>
              <p className="text-sm text-orange-700">
                {formatFileSize(stats.totalSize)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {lastRefresh && `Last updated: ${lastRefresh}`}
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-700">
              <p className="font-medium mb-1">🌐 Seamless Cross-Device Access:</p>
              <ul className="space-y-1 text-xs">
                <li>• Teachers create tests → Automatically available everywhere</li>
                <li>• Students access from any device → No setup required</li>
                <li>• Always connected to cloud → Professional experience</li>
                <li>• Local cache for speed → Cloud sync for availability</li>
                <li>• No manual authentication → Seamless operation 24/7</li>
              </ul>
            </div>
          </div>
        </div>

        {stats.connected && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-700">
              <strong>✅ Professional Cloud Integration Active</strong> - All tests automatically synchronized across devices
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}