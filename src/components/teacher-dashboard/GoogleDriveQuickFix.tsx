'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Cloud, 
  CloudUpload, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Download,
  Upload,
  Folder,
  FileText
} from 'lucide-react';

export default function GoogleDriveQuickFix() {
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const createStructuredBackup = () => {
    try {
      // Get all localStorage data
      const allData: { [key: string]: string | null } = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allData[key] = localStorage.getItem(key);
        }
      }

      // Create organized backup structure
      const organizedBackup = {
        metadata: {
          instituteName: 'PHOTON Coaching Institute',
          backupDate: new Date().toISOString(),
          backupType: 'Complete System Backup',
          version: '1.0',
          totalDataKeys: Object.keys(allData).length
        },
        tests: [],
        studentData: [],
        systemSettings: {},
        rawData: allData
      };

      // Parse and organize tests
      if (allData.tests) {
        try {
          const tests = JSON.parse(allData.tests);
          organizedBackup.tests = tests.map((test: any) => ({
            ...test,
            category: 'PHOTON Tests',
            subcategory: test.type || 'General',
            subject: test.subject || 'Mixed',
            uploadPath: `PHOTON Tests/${test.type || 'General'}/${test.subject || 'Mixed'}/`
          }));
        } catch (e) {
          console.error('Error parsing tests:', e);
        }
      }

      // Create multiple backup files for different purposes
      const backups = {
        // Complete backup
        complete: {
          filename: `PHOTON_Complete_Backup_${Date.now()}.json`,
          data: organizedBackup
        },
        // Tests only
        tests: {
          filename: `PHOTON_Tests_Only_${Date.now()}.json`,
          data: {
            metadata: { ...organizedBackup.metadata, backupType: 'Tests Only' },
            tests: organizedBackup.tests
          }
        },
        // Organized for manual upload
        organized: {
          filename: `PHOTON_Organized_Structure_${Date.now()}.json`,
          data: {
            'PHOTON Tests': {
              'JEE Main': { Physics: [], Chemistry: [], Mathematics: [], Biology: [] },
              'JEE Advanced': { Physics: [], Chemistry: [], Mathematics: [], Biology: [] },
              'NEET': { Physics: [], Chemistry: [], Mathematics: [], Biology: [] },
              'Chapter Tests': { Physics: [], Chemistry: [], Mathematics: [], Biology: [] },
              'Mock Tests': { Physics: [], Chemistry: [], Mathematics: [], Biology: [] }
            },
            'Study Materials': { Physics: [], Chemistry: [], Mathematics: [], Biology: [] },
            'Student Data': [],
            'System Backups': [organizedBackup],
            'Analytics': []
          }
        }
      };

      // Download all backup files
      Object.values(backups).forEach(backup => {
        const blob = new Blob([JSON.stringify(backup.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      setLastBackup(new Date().toLocaleString());
      alert('✅ Multiple backup files created!\n\n📁 Files downloaded:\n• Complete backup\n• Tests only\n• Organized structure\n\nYou can now upload these to your Google Drive manually.');
      
    } catch (error) {
      console.error('Backup failed:', error);
      alert('❌ Backup failed. Please try again.');
    }
  };

  const openGoogleDrive = () => {
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  };

  const createFolderStructure = () => {
    const folderStructure = `
📁 PHOTON Coaching Institute/
├── 📁 PHOTON Tests/
│   ├── 📁 JEE Main/
│   │   ├── 📁 Physics/
│   │   ├── 📁 Chemistry/
│   │   ├── 📁 Mathematics/
│   │   └── 📁 Biology/
│   ├── 📁 JEE Advanced/
│   │   └── [Same subjects]
│   ├── 📁 NEET/
│   │   └── [Same subjects]
│   ├── 📁 Chapter Tests/
│   │   └── [Same subjects]
│   └── 📁 Mock Tests/
│       └── [Same subjects]
├── 📁 Study Materials/
│   ├── 📁 Physics/
│   ├── 📁 Chemistry/
│   ├── 📁 Mathematics/
│   └── 📁 Biology/
├── 📁 Student Data/
├── 📁 Analytics & Reports/
├── 📁 System Backups/
└── 📁 Question Banks/
    └── [Same subjects]

Instructions:
1. Create this folder structure in your Google Drive
2. Upload the backup files to appropriate folders
3. Your data will be perfectly organized!
    `;

    const blob = new Blob([folderStructure], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PHOTON_Folder_Structure_Guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('📁 Folder structure guide downloaded!\n\nThis file contains the exact folder structure to create in your Google Drive.');
  };

  return (
    <div className="space-y-6">
      {/* OAuth Issue Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800 mb-2">OAuth Verification Required</h3>
              <p className="text-sm text-orange-700 mb-3">
                The Google OAuth app needs verification to work with external users. Here's the immediate solution:
              </p>
              <div className="space-y-2 text-sm text-orange-700">
                <p><strong>Quick Fix:</strong> Add yourself as a test user in Google Cloud Console</p>
                <p><strong>Long-term:</strong> Submit app for verification (takes 1-7 days)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immediate Solution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Immediate Solution - Manual Upload
            <Badge className="bg-green-100 text-green-800">Works Now</Badge>
          </CardTitle>
          <CardDescription>
            Create organized backups and upload them manually to Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={createStructuredBackup}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Create Backups
            </Button>
            
            <Button 
              onClick={createFolderStructure}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Folder className="h-4 w-4" />
              Get Structure Guide
            </Button>
            
            <Button 
              onClick={openGoogleDrive}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
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

      {/* Step-by-Step Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium">Create Backups</h4>
                <p className="text-sm text-gray-600">Click "Create Backups" to download 3 organized backup files</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium">Get Folder Structure</h4>
                <p className="text-sm text-gray-600">Download the folder structure guide to know exactly what folders to create</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium">Open Google Drive</h4>
                <p className="text-sm text-gray-600">Go to your Google Drive and create the folder structure</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-medium">Upload Files</h4>
                <p className="text-sm text-gray-600">Upload the backup files to the appropriate folders in your Drive</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fix OAuth Issue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Fix OAuth Issue (For Automatic Upload)
          </CardTitle>
          <CardDescription>
            To enable automatic uploads, fix the OAuth verification issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Option 1: Add Test User (Quick)</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
                <li>Select project "photon-ex431"</li>
                <li>Go to APIs & Services → OAuth consent screen</li>
                <li>Scroll to "Test users" and click "Add Users"</li>
                <li>Add: anitamishravns1973@gmail.com</li>
                <li>Save and try OAuth again</li>
              </ol>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Option 2: Publish App (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-1 text-green-700">
                <li>In OAuth consent screen, click "Publish App"</li>
                <li>Fill required information</li>
                <li>Submit for verification (1-7 days)</li>
                <li>Once approved, anyone can use the app</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✅ Working Features:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Manual backup creation</li>
                <li>• Organized file structure</li>
                <li>• Test data export</li>
                <li>• Local data management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏳ Pending OAuth Fix:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Automatic Google Drive upload</li>
                <li>• Real-time synchronization</li>
                <li>• Browser notifications</li>
                <li>• Folder auto-creation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}