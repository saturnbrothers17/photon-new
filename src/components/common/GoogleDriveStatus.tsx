'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Database,
  Wifi
} from 'lucide-react';
import { getDataStats, forceSyncWithDrive } from '@/lib/google-drive-test-data';

export default function GoogleDriveStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');
  const [stats, setStats] = useState<any>(null);
  const [lastSync, setLastSync] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = async () => {
    try {
      const dataStats = await getDataStats();
      if (dataStats) {
        setStatus('connected');
        setStats(dataStats);
        setLastSync(new Date(dataStats.lastSync).toLocaleString());
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
      console.error('Error checking Google Drive status:', error);
    }
  };

  const handleForceSync = async () => {
    setIsRefreshing(true);
    setStatus('syncing');
    try {
      const success = await forceSyncWithDrive();
      if (success) {
        await checkStatus();
        console.log('✅ Force sync completed');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
      console.error('❌ Force sync failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };



  useEffect(() => {
    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Connected</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Syncing...</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 border-red-300">Disconnected</Badge>;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {status === 'connected' ? (
                <Cloud className="h-5 w-5 text-blue-600" />
              ) : (
                <CloudOff className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-800">Google Drive Storage</span>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center gap-3">
            {stats && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  <span>{stats.totalTests} tests</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className="h-4 w-4" />
                  <span>Last sync: {lastSync}</span>
                </div>
              </div>
            )}
            

            
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceSync}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync'}
            </Button>
          </div>
        </div>
        
        {status === 'connected' && stats && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tests:</span>
                <span className="ml-2 font-medium">{stats.totalTests}</span>
              </div>
              <div>
                <span className="text-gray-600">Results:</span>
                <span className="ml-2 font-medium">{stats.totalResults}</span>
              </div>
              <div>
                <span className="text-gray-600">Materials:</span>
                <span className="ml-2 font-medium">{stats.totalMaterials}</span>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-medium">{stats.version}</span>
              </div>
            </div>
          </div>
        )}
        
        {status === 'disconnected' && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Unable to connect to Google Drive. Data may not be persistent.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}