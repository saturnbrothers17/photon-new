'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudUpload, AlertCircle, User, CheckCircle, ExternalLink } from 'lucide-react';

export default function GoogleDriveSimple() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleManualBackup = () => {
    try {
      // Get all localStorage data
      const backupData: { [key: string]: string | null } = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          backupData[key] = localStorage.getItem(key);
        }
      }

      // Create backup object
      const backup = {
        timestamp: new Date().toISOString(),
        data: backupData,
        metadata: {
          totalKeys: Object.keys(backupData).length,
          backupSize: JSON.stringify(backupData).length,
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `coaching-institute-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString());
      alert('Backup downloaded successfully! You can now upload this file to your Google Drive manually.');
      
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Failed to create backup. Please try again.');
    }
  };

  const handleGoogleDriveUpload = () => {
    // Open Google Drive in a new tab
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLocalStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Manual Backup Solution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Drive Backup (Manual Upload)
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Simple & Reliable
            </Badge>
          </CardTitle>
          <CardDescription>
            Download your test data as a backup file and upload it to your Google Drive manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Why This Approach Works:</span>
            </div>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• No OAuth configuration needed</li>
              <li>• Works immediately without setup</li>
              <li>• You control where files are stored</li>
              <li>• Uses your full 2TB Google Drive storage</li>
              <li>• No API quotas or restrictions</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={handleManualBackup}
              className="flex-1"
            >
              <CloudUpload className="h-4 w-4 mr-2" />
              Download Backup File
            </Button>
            
            <Button 
              onClick={handleGoogleDriveUpload}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Google Drive
            </Button>
          </div>

          {lastBackup && (
            <p className="text-sm text-gray-600">
              Last backup created: {lastBackup}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Backup to Google Drive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <p className="font-medium">Download Backup</p>
                <p className="text-gray-600">Click "Download Backup File" to save your test data as a JSON file</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <p className="font-medium">Open Google Drive</p>
                <p className="text-gray-600">Click "Open Google Drive" or go to drive.google.com</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <p className="font-medium">Upload File</p>
                <p className="text-gray-600">Drag and drop the backup file or click "New" → "File upload"</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <p className="font-medium">Done!</p>
                <p className="text-gray-600">Your test data is now safely backed up in your Google Drive</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Your Google Drive</p>
              <p className="text-gray-600">2 TB Available</p>
            </div>
            <div>
              <p className="font-medium">Current Data Size</p>
              <p className="text-gray-600">{formatFileSize(getLocalStorageSize())}</p>
            </div>
            <div>
              <p className="font-medium">Backup Format</p>
              <p className="text-gray-600">JSON (Human readable)</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Perfect for your needs:</strong> This simple approach gives you full control over your backups 
              and uses your entire 2TB Google Drive storage without any API limitations!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Restore Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Restore from Backup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>To restore your data from a backup file:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Download the backup JSON file from your Google Drive</li>
              <li>Open browser developer tools (F12)</li>
              <li>Go to Console tab</li>
              <li>Paste the restore script (contact support for the script)</li>
              <li>Select your backup file when prompted</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">
              Note: We can provide a detailed restore script if needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}