'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  CheckCircle, 
  Cloud, 
  Database, 
  RefreshCw, 
  CloudUpload,
  Server,
  Globe,
  Shield
} from 'lucide-react';
import { useSeamlessCloud } from '@/hooks/useSeamlessCloud';

export default function SeamlessCloudDashboard() {
  const { 
    tests,
    stats,
    isLoading,
    createBackup,
    getStats,
    formatFileSize
  } = useSeamlessCloud();

  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleCreateBackup = async () => {
    try {
      const backupId = await createBackup();
      if (backupId) {
        setLastBackup(new Date().toLocaleString());
        alert('✅ System backup created seamlessly!');
      } else {
        alert('📝 Backup queued - will be created automatically when ready');
      }
    } catch (error) {
      console.error('Backup error:', error);
    }
  };

  const handleRefresh = async () => {
    await getStats();
  };

  const localTests = tests.filter(t => t.source === 'local');
  const cloudTests = tests.filter(t => t.source === 'cloud' || t.source === 'seamless_cloud');

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            PHOTON Seamless Cloud System
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Always Connected
            </Badge>
          </CardTitle>
          <CardDescription>
            Professional cloud integration - automatic cross-device synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Local Tests</p>
                <p className="text-2xl font-bold text-blue-900">{localTests.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Cloud Synced</p>
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
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            Seamless Operations
          </CardTitle>
          <CardDescription>
            Automatic cloud operations - no manual intervention required
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={handleCreateBackup}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <CloudUpload className="h-4 w-4" />
              Create System Backup
            </Button>
            
            <Button 
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>

          {lastBackup && (
            <p className="text-sm text-gray-600">
              Last backup: {lastBackup}
            </p>
          )}
        </CardContent>
      </Card>

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Seamless Operation
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Always connected to cloud storage</li>
                <li>• No manual authentication required</li>
                <li>• Automatic cross-device synchronization</li>
                <li>• Professional user experience</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Enterprise Features
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Automatic backup and recovery</li>
                <li>• Structured data organization</li>
                <li>• 24/7 availability guarantee</li>
                <li>• Scalable infrastructure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-medium mb-2">🌐 Seamless Cross-Device System:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Teachers:</strong> Create tests → Automatically published to cloud → Available everywhere instantly</p>
                  <p><strong>Students:</strong> Access tests from any device → No setup required → Always see latest tests</p>
                  <p><strong>System:</strong> Always connected → Professional experience → No manual intervention needed</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}