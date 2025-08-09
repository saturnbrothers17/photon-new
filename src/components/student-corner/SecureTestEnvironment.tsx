"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Flag, TriangleAlert, Save, Shield, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import "@/styles/secure-test.css";

interface SecureTestEnvironmentProps {
  testData: any;
  questions: any[];
  onTestSubmit: (answers: any, flags: any, timeTaken: number) => void;
  onExitSecureMode: () => void;
}

export default function SecureTestEnvironment({ 
  testData, 
  questions, 
  onTestSubmit, 
  onExitSecureMode 
}: SecureTestEnvironmentProps) {
  // Test state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  // Security state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState<string[]>([]);
  const [isSecureModeActive, setIsSecureModeActive] = useState(false);
  const [rightClickAttempts, setRightClickAttempts] = useState(0);
  const [keyboardAttempts, setKeyboardAttempts] = useState(0);
  
  // 3-Strike Warning System
  const [violationWarnings, setViolationWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const securityLogRef = useRef<string[]>([]);

  // Security logging function
  const logSecurityEvent = useCallback((event: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${event}`;
    securityLogRef.current.push(logEntry);
    setSuspiciousActivity(prev => [...prev, logEntry]);
    console.warn('🔒 Security Event:', logEntry);
  }, []);

  // 3-Strike Warning System
  const handleSecurityViolation = useCallback((violationType: string, message: string) => {
    const newWarningCount = violationWarnings + 1;
    setViolationWarnings(newWarningCount);
    
    logSecurityEvent(`${violationType} - Warning ${newWarningCount}/3`);
    
    if (newWarningCount >= 3) {
      // Third violation - Auto submit test
      setIsAutoSubmitting(true);
      setWarningMessage('Maximum violations reached. Test will be submitted automatically.');
      setShowWarningModal(true);
      
      // Auto submit after 3 seconds
      setTimeout(() => {
        logSecurityEvent('AUTO-SUBMIT: Test submitted due to excessive violations');
        handleSubmitTest();
      }, 3000);
      
    } else {
      // Show warning for first two violations
      const remainingWarnings = 3 - newWarningCount;
      setWarningMessage(`${message} Warning ${newWarningCount}/3. ${remainingWarnings} warning(s) remaining before auto-submission.`);
      setShowWarningModal(true);
      
      // Auto hide warning after 5 seconds
      setTimeout(() => {
        setShowWarningModal(false);
      }, 5000);
    }
  }, [violationWarnings, logSecurityEvent]);

  // Hide fullscreen controls to prevent cheating
  useEffect(() => {
    const hideFullscreenControls = () => {
      const style = document.createElement('style');
      style.textContent = `
        /* Hide fullscreen exit button */
        ::-webkit-full-screen-controls {
          display: none !important;
        }
        
        /* Hide fullscreen exit button in different browsers */
        :-webkit-full-screen ::-webkit-full-screen-controls {
          display: none !important;
        }
        
        :-moz-full-screen ::-moz-full-screen-controls {
          display: none !important;
        }
        
        :-ms-fullscreen ::-ms-fullscreen-controls {
          display: none !important;
        }
        
        /* Hide cursor when at top of screen */
        .secure-test-container:fullscreen {
          cursor: none;
        }
        
        .secure-test-container:fullscreen:hover {
          cursor: none;
        }
      `;
      document.head.appendChild(style);
      return style;
    };

    const styleElement = hideFullscreenControls();
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  // Initialize secure mode
  useEffect(() => {
    if (testData && questions.length > 0) {
      const durationMinutes = testData.duration_minutes || 180;
      setTimeRemaining(durationMinutes * 60);
      
      // Detect mobile device
      const checkMobile = () => {
        const userAgent = navigator.userAgent || navigator.vendor;
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        setIsMobile(isMobileDevice);
      };
      
      checkMobile();
      
      // Start secure mode immediately (fullscreen will be attempted on first user interaction)
      setIsSecureModeActive(true);
      logSecurityEvent('Secure test mode initialized');
      
      // Try to enter fullscreen after a short delay to allow for user interaction
      setTimeout(() => {
        enterSecureMode();
      }, 500);
    }
  }, [testData, questions, logSecurityEvent]);

  // Enter secure mode with fullscreen and security measures
  const enterSecureMode = useCallback(async () => {
    try {
      setIsSecureModeActive(true);
      logSecurityEvent('Secure test mode activated');
      
      // Try to request fullscreen (may fail due to permissions)
      if (containerRef.current) {
        try {
          // Check if fullscreen is supported
          if (containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
            setIsFullscreen(true);
            logSecurityEvent('Fullscreen mode enabled');
          } else if ((containerRef.current as any).webkitRequestFullscreen) {
            // Safari support
            await (containerRef.current as any).webkitRequestFullscreen();
            setIsFullscreen(true);
            logSecurityEvent('Fullscreen mode enabled (webkit)');
          } else if ((containerRef.current as any).msRequestFullscreen) {
            // IE/Edge support
            await (containerRef.current as any).msRequestFullscreen();
            setIsFullscreen(true);
            logSecurityEvent('Fullscreen mode enabled (ms)');
          } else {
            logSecurityEvent('Fullscreen not supported - continuing with secure mode');
          }
        } catch (fullscreenError) {
          console.warn('Fullscreen request failed:', fullscreenError);
          logSecurityEvent('Fullscreen request failed - continuing with secure mode');
          // Continue with secure mode even without fullscreen
        }
      }
    } catch (error) {
      console.error('Failed to enter secure mode:', error);
      logSecurityEvent('Failed to enter secure mode');
      // Still activate secure mode for monitoring
      setIsSecureModeActive(true);
    }
  }, [logSecurityEvent]);

  // Handle click to enter fullscreen if not already active
  const handleContainerClick = useCallback(() => {
    if (isSecureModeActive && !isFullscreen && containerRef.current) {
      enterSecureMode();
    }
  }, [isSecureModeActive, isFullscreen, enterSecureMode]);

  // Exit secure mode
  const exitSecureMode = useCallback(() => {
    try {
      // Exit fullscreen with cross-browser support
      const exitFullscreen = document.exitFullscreen || 
                            (document as any).webkitExitFullscreen || 
                            (document as any).msExitFullscreen;
      
      if (exitFullscreen && (document.fullscreenElement || 
                            (document as any).webkitFullscreenElement || 
                            (document as any).msFullscreenElement)) {
        exitFullscreen.call(document).catch((error: any) => {
          console.warn('Failed to exit fullscreen:', error);
        });
      }
    } catch (error) {
      console.warn('Error exiting fullscreen:', error);
    }
    
    setIsFullscreen(false);
    setIsSecureModeActive(false);
    logSecurityEvent('Secure test mode deactivated');
    onExitSecureMode();
  }, [onExitSecureMode, logSecurityEvent]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen && isSecureModeActive && !isSubmitted && isFullscreen) {
        // Only trigger violation if we were previously in fullscreen
        handleSecurityViolation('FULLSCREEN_EXIT', 'You exited fullscreen mode during the test!');
        
        // Try to re-enter fullscreen
        setTimeout(() => {
          if (containerRef.current && !isSubmitted && !isAutoSubmitting) {
            const element = containerRef.current;
            const requestFullscreen = element.requestFullscreen || 
                                    (element as any).webkitRequestFullscreen || 
                                    (element as any).msRequestFullscreen;
            
            if (requestFullscreen) {
              requestFullscreen.call(element).catch(() => {
                logSecurityEvent('Failed to re-enter fullscreen - continuing with monitoring');
              });
            }
          }
        }, 1000);
      }
    };

    // Add multiple event listeners for cross-browser support
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isSecureModeActive, isSubmitted, isFullscreen, isAutoSubmitting, handleSecurityViolation, logSecurityEvent]);

  // Visibility change detection (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isSecureModeActive && !isSubmitted && !isAutoSubmitting) {
        setTabSwitchCount(prev => prev + 1);
        handleSecurityViolation(
          'TAB_SWITCH', 
          isMobile 
            ? 'You switched apps or went to home screen during the test!' 
            : 'You switched tabs during the test!'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSecureModeActive, isSubmitted, isAutoSubmitting, isMobile, handleSecurityViolation]);

  // Keyboard security (prevent common cheating shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSecureModeActive) return;

      const forbiddenKeys = [
        'F12', // Developer tools
        'F11', // Fullscreen toggle
        'PrintScreen',
        'Insert'
      ];

      const forbiddenCombinations = [
        { ctrl: true, key: 'u' }, // View source
        { ctrl: true, key: 'U' },
        { ctrl: true, key: 's' }, // Save page
        { ctrl: true, key: 'S' },
        { ctrl: true, key: 'a' }, // Select all
        { ctrl: true, key: 'A' },
        { ctrl: true, key: 'c' }, // Copy
        { ctrl: true, key: 'C' },
        { ctrl: true, key: 'v' }, // Paste
        { ctrl: true, key: 'V' },
        { ctrl: true, key: 'x' }, // Cut
        { ctrl: true, key: 'X' },
        { ctrl: true, key: 'p' }, // Print
        { ctrl: true, key: 'P' },
        { ctrl: true, key: 'f' }, // Find
        { ctrl: true, key: 'F' },
        { ctrl: true, key: 'h' }, // History
        { ctrl: true, key: 'H' },
        { ctrl: true, key: 'j' }, // Downloads
        { ctrl: true, key: 'J' },
        { ctrl: true, key: 'n' }, // New window
        { ctrl: true, key: 'N' },
        { ctrl: true, key: 't' }, // New tab
        { ctrl: true, key: 'T' },
        { ctrl: true, key: 'w' }, // Close tab
        { ctrl: true, key: 'W' },
        { ctrl: true, shift: true, key: 'i' }, // Developer tools
        { ctrl: true, shift: true, key: 'I' },
        { ctrl: true, shift: true, key: 'j' }, // Console
        { ctrl: true, shift: true, key: 'J' },
        { ctrl: true, shift: true, key: 'c' }, // Inspector
        { ctrl: true, shift: true, key: 'C' },
        { alt: true, key: 'Tab' }, // Alt+Tab
        { alt: true, key: 'F4' }, // Alt+F4
      ];

      // Check forbidden keys
      if (forbiddenKeys.includes(e.key)) {
        e.preventDefault();
        setKeyboardAttempts(prev => prev + 1);
        logSecurityEvent(`Forbidden key pressed: ${e.key}`);
        return;
      }

      // Check forbidden combinations
      const isForbidden = forbiddenCombinations.some(combo => {
        return (combo.ctrl ? e.ctrlKey : true) &&
               (combo.shift ? e.shiftKey : !e.shiftKey) &&
               (combo.alt ? e.altKey : !e.altKey) &&
               e.key.toLowerCase() === combo.key.toLowerCase();
      });

      if (isForbidden) {
        e.preventDefault();
        setKeyboardAttempts(prev => prev + 1);
        logSecurityEvent(`Forbidden key combination: ${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSecureModeActive, logSecurityEvent]);

  // Right-click prevention
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isSecureModeActive) {
        e.preventDefault();
        setRightClickAttempts(prev => prev + 1);
        logSecurityEvent('Right-click attempt blocked');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [isSecureModeActive, logSecurityEvent]);

  // Text selection prevention
  useEffect(() => {
    const handleSelectStart = (e: Event) => {
      if (isSecureModeActive) {
        e.preventDefault();
      }
    };

    document.addEventListener('selectstart', handleSelectStart);
    return () => document.removeEventListener('selectstart', handleSelectStart);
  }, [isSecureModeActive]);

  // Mobile-specific security measures
  useEffect(() => {
    if (!isMobile || !isSecureModeActive) return;

    // Prevent mobile gestures and navigation
    const preventMobileGestures = (e: TouchEvent) => {
      // Prevent pull-to-refresh
      if (e.touches.length > 1) {
        e.preventDefault();
      }
      
      // Prevent swipe gestures that might trigger navigation
      const touch = e.touches[0];
      const startY = touch.clientY;
      const startX = touch.clientX;
      
      // Prevent swipe from edges (back/forward navigation)
      if (startX < 20 || startX > window.innerWidth - 20) {
        e.preventDefault();
      }
      
      // Prevent pull down from top (notifications)
      e.preventDefault();
    };

    const preventZoom = (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches && touchEvent.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventLongPress = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', preventMobileGestures, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });
    document.addEventListener('contextmenu', preventLongPress, { passive: false });

    // Prevent mobile browser UI from showing/hiding
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    // Lock viewport on mobile
    const viewport = document.querySelector('meta[name=viewport]');
    const originalViewport = viewport?.getAttribute('content');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    return () => {
      document.removeEventListener('touchstart', preventMobileGestures);
      document.removeEventListener('touchmove', preventZoom);
      document.removeEventListener('contextmenu', preventLongPress);
      
      // Restore original viewport
      if (viewport && originalViewport) {
        viewport.setAttribute('content', originalViewport);
      }
    };
  }, [isMobile, isSecureModeActive]);

  // Mobile home button detection (Page Visibility API enhancement)
  useEffect(() => {
    if (!isMobile || !isSecureModeActive) return;

    let isAppVisible = true;
    
    const handleAppStateChange = () => {
      const wasVisible = isAppVisible;
      isAppVisible = !document.hidden;
      
      // Detect when app becomes hidden (home button pressed)
      if (wasVisible && !isAppVisible && !isSubmitted && !isAutoSubmitting) {
        handleSecurityViolation(
          'HOME_BUTTON', 
          'You pressed the home button or switched apps during the test!'
        );
      }
    };

    // Enhanced visibility detection for mobile
    document.addEventListener('visibilitychange', handleAppStateChange);
    
    // Additional mobile-specific events
    window.addEventListener('blur', handleAppStateChange);
    window.addEventListener('pagehide', handleAppStateChange);

    return () => {
      document.removeEventListener('visibilitychange', handleAppStateChange);
      window.removeEventListener('blur', handleAppStateChange);
      window.removeEventListener('pagehide', handleAppStateChange);
    };
  }, [isMobile, isSecureModeActive, isSubmitted, isAutoSubmitting, handleSecurityViolation]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted && isSecureModeActive) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isSubmitted, isSecureModeActive]);

  // Test submission handler
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitted) return;

    try {
      setIsSubmitted(true);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      // Include security log in submission
      const securityReport = {
        tabSwitchCount,
        rightClickAttempts,
        keyboardAttempts,
        violationWarnings,
        suspiciousActivity: securityLogRef.current,
        testIntegrity: tabSwitchCount === 0 && rightClickAttempts === 0 ? 'HIGH' : 'COMPROMISED'
      };

      logSecurityEvent(`Test submitted - Security Report: ${JSON.stringify(securityReport)}`);
      
      // Create comprehensive test result
      const testResult = {
        id: Date.now().toString(),
        testId: testData?.id,
        studentId: 'current-student',
        answers,
        submittedAt: new Date().toISOString(),
        timeTaken,
        totalQuestions: questions.length,
        attemptedQuestions: Object.keys(answers).length,
        flaggedQuestions: Array.from(flaggedQuestions),
        testName: testData?.title,
        testType: testData?.class_level,
        score: 0,
        maxMarks: questions.length * 4, // Assuming 4 marks per question
        securityReport
      };

      // Save to Supabase only
      try {
        const response = await fetch('/api/supabase/test-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'save-result', 
            testResult 
          })
        });

        const result = await response.json();
        if (result.success) {
          console.log('✅ Test result saved to database');
        } else {
          console.error('❌ Failed to save test result:', result.error);
          if (result.error === 'TABLE_NOT_FOUND') {
            console.error('❌ Please create the test_results table in Supabase');
            console.error('❌ Check SETUP_TEST_RESULTS_TABLE.md for instructions');
          }
        }
      } catch (saveError) {
        console.error('❌ Error saving test result:', saveError);
      }
      
      await onTestSubmit(answers, Array.from(flaggedQuestions), timeTaken);
      
      // Exit secure mode after submission
      setTimeout(() => {
        exitSecureMode();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting test:', error);
      setIsSubmitted(false);
    }
  }, [isSubmitted, startTime, answers, flaggedQuestions, tabSwitchCount, rightClickAttempts, keyboardAttempts, violationWarnings, testData, questions, onTestSubmit, exitSecureMode, logSecurityEvent]);

  // Helper functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (questionId: number) => {
    if (answers[questionId]) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    return 'not-visited';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'flagged': return 'bg-orange-500 text-white';
      case 'current': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  // Calculate progress
  const currentQ = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  // Security warning component
  const SecurityWarning = () => (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <div className="text-sm">
          <div className="font-bold">
            {isFullscreen ? 'Secure Mode' : 'Monitoring Mode'}
          </div>
          <div>Warnings: {violationWarnings}/3</div>
          <div className="text-xs">
            {isFullscreen ? 'Fullscreen Active' : 'Fullscreen Unavailable'}
          </div>
        </div>
      </div>
    </div>
  );

  // Warning Modal Component
  const WarningModal = () => {
    if (!showWarningModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
        <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 ${isAutoSubmitting ? 'border-4 border-red-500' : 'border-4 border-yellow-500'}`}>
          <div className="text-center">
            <div className={`mx-auto mb-4 ${isAutoSubmitting ? 'text-red-600' : 'text-yellow-600'}`}>
              {isAutoSubmitting ? (
                <TriangleAlert className="h-16 w-16 mx-auto animate-pulse" />
              ) : (
                <TriangleAlert className="h-12 w-12 mx-auto" />
              )}
            </div>
            
            <h3 className={`text-xl font-bold mb-3 ${isAutoSubmitting ? 'text-red-800' : 'text-yellow-800'}`}>
              {isAutoSubmitting ? 'TEST AUTO-SUBMISSION' : 'SECURITY WARNING'}
            </h3>
            
            <p className={`text-sm mb-4 ${isAutoSubmitting ? 'text-red-700' : 'text-yellow-700'}`}>
              {warningMessage}
            </p>

            {isAutoSubmitting ? (
              <div className="space-y-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <p className="text-red-800 font-semibold text-sm">
                    Your test is being submitted automatically due to excessive security violations.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  <span className="text-sm">Submitting test...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${violationWarnings === 2 ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  <p className={`font-semibold text-sm ${violationWarnings === 2 ? 'text-red-800' : 'text-yellow-800'}`}>
                    {violationWarnings === 2 
                      ? 'FINAL WARNING: One more violation will auto-submit your test!'
                      : 'Please stay focused on the test. Avoid switching tabs or apps.'
                    }
                  </p>
                </div>
                
                <Button
                  onClick={() => setShowWarningModal(false)}
                  className={`w-full ${violationWarnings === 2 ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}
                >
                  I Understand - Continue Test
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 bg-black flex items-center justify-center z-50"
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-headline text-2xl font-bold text-gray-800 mb-2">Test Submitted Successfully!</h2>
            <p className="text-gray-600 mb-4">Your answers have been saved securely.</p>
            <div className="text-sm text-gray-500 mb-6">
              <p>Security Report:</p>
              <p>Tab Switches: {tabSwitchCount}</p>
              <p>Integrity: {tabSwitchCount === 0 && rightClickAttempts === 0 ? 'HIGH' : 'COMPROMISED'}</p>
            </div>
            <p className="text-sm text-gray-500">Exiting secure mode...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      className="secure-test-container fixed inset-0 bg-black z-50 overflow-hidden select-none no-select"
    >
      {/* Security Warning */}
      <SecurityWarning />

      {/* Fullscreen Prompt */}
      {isSecureModeActive && !isFullscreen && (
        <div className="fixed top-16 right-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-xs">
          <div className="text-sm">
            <div className="font-bold mb-1">Click anywhere to enable fullscreen</div>
            <div className="text-xs">For maximum security, fullscreen mode is recommended</div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      <WarningModal />

      {/* Secure Test Interface */}
      <div className={`h-full bg-gray-50 overflow-y-auto ${isMobile ? 'pb-safe' : ''}`}>
        {/* Header */}
        <div className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-3' : ''}`}>
              <div className={`flex items-center gap-2 sm:gap-4 ${isMobile ? 'w-full justify-center' : ''}`}>
                <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                <div className={isMobile ? 'text-center' : ''}>
                  <h1 className="font-headline text-lg sm:text-xl font-bold truncate max-w-[200px] sm:max-w-none">
                    {testData?.title}
                  </h1>
                  <div className={`flex items-center gap-2 sm:gap-4 mt-1 ${isMobile ? 'justify-center flex-wrap' : ''}`}>
                    <Badge variant="outline" className="bg-white text-blue-600 text-xs">
                      Q{currentQuestion + 1}/{questions.length}
                    </Badge>
                    <Badge className="bg-blue-800 text-white text-xs">{testData?.subject}</Badge>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 sm:gap-4 ${isMobile ? 'w-full justify-between' : ''}`}>
                <Button
                  onClick={handleSubmitTest}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm sm:text-base px-3 sm:px-4"
                  disabled={isAutoSubmitting}
                >
                  {isAutoSubmitting ? 'Submitting...' : 'Submit Test'}
                </Button>
                <div className={`text-center ${isMobile ? 'flex-1' : 'text-right'}`}>
                  <div className="text-lg sm:text-2xl font-bold text-yellow-300">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs sm:text-sm">Time Remaining</div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4">
              <Progress value={isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress))} className="h-2" />
              <div className="flex justify-between text-xs sm:text-sm mt-1">
                <span>Progress: {Math.round(progress)}%</span>
                <span className={isMobile ? 'text-xs' : ''}>
                  Answered: {answeredCount} | Flagged: {flaggedCount}
                </span>
              </div>
              
              {/* Mobile Warning Counter */}
              {isMobile && (
                <div className="mt-2 text-center">
                  <span className="text-xs bg-blue-800 px-2 py-1 rounded">
                    Warnings: {violationWarnings}/3
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
          <div className={`grid grid-cols-1 gap-3 sm:gap-6 ${isMobile ? '' : 'lg:grid-cols-4'}`}>
            {/* Question Panel */}
            <div className={isMobile ? '' : 'lg:col-span-3'}>
              <Card className="border-2 border-blue-200">
                <CardContent className="p-3 sm:p-6">
                  <div className={`flex items-center justify-between mb-4 ${isMobile ? 'flex-col gap-3' : ''}`}>
                    <div className={`flex items-center gap-2 ${isMobile ? 'flex-wrap justify-center' : ''}`}>
                      <span className="font-bold text-base sm:text-lg">Q{currentQuestion + 1}</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {testData?.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">+{currentQ?.marks || 4} marks</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagQuestion(currentQuestion)}
                      className={`text-xs sm:text-sm ${flaggedQuestions.has(currentQuestion) ? 'bg-orange-100 border-orange-300' : ''}`}
                    >
                      <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {flaggedQuestions.has(currentQuestion) ? 'Unflag' : 'Flag'}
                    </Button>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                      {currentQ?.question_text}
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {(currentQ?.options || []).map((option: any, index: number) => (
                      <label
                        key={index}
                        className={`flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          isMobile ? 'text-sm' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={option}
                          checked={answers[currentQuestion] === option}
                          onChange={() => handleAnswerSelect(currentQuestion, option)}
                          className="mr-2 sm:mr-3"
                        />
                        <span className="flex-1">
                          {String.fromCharCode(65 + index)}) {option}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className={`flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${
                    isMobile ? 'flex-col gap-3' : ''
                  }`}>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className={`text-xs sm:text-sm ${isMobile ? 'w-full' : ''}`}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Previous
                    </Button>

                    <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
                      <Button 
                        variant="outline" 
                        className={`text-xs sm:text-sm ${isMobile ? 'flex-1' : ''}`}
                      >
                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {isMobile ? 'Save' : 'Save & Next'}
                      </Button>
                      <Button
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                        disabled={currentQuestion === questions.length - 1}
                        className={`text-xs sm:text-sm ${isMobile ? 'flex-1' : ''}`}
                      >
                        Next
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Navigation Panel */}
            <div className={isMobile ? 'order-first' : 'lg:col-span-1'}>
              <Card className={`border-2 border-blue-200 ${isMobile ? '' : 'sticky top-24'}`}>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    {isMobile ? 'Security' : 'Secure Mode'}
                  </h3>

                  {/* Security Status */}
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg text-xs sm:text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <span className="font-semibold">Monitoring Active</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Warnings:</span>
                        <span className="font-bold text-blue-600">{violationWarnings}/3</span>
                      </div>
                      {!isMobile && (
                        <>
                          <div>Tab Switches: {tabSwitchCount}</div>
                          <div>Right Clicks: {rightClickAttempts}</div>
                          <div>Key Violations: {keyboardAttempts}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span>Flagged</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <span>Not Visited</span>
                    </div>
                  </div>

                  {/* Questions Grid */}
                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-semibold text-xs sm:text-sm mb-2">All Questions</h4>
                    <div className={`grid gap-1 ${isMobile ? 'grid-cols-8' : 'grid-cols-5'}`}>
                      {questions.map((question, questionIndex) => {
                        const status = questionIndex === currentQuestion ? 'current' : getQuestionStatus(questionIndex);

                        return (
                          <button
                            key={questionIndex}
                            onClick={() => setCurrentQuestion(questionIndex)}
                            className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-xs font-semibold rounded ${getStatusColor(status)} hover:opacity-80 transition-opacity`}
                          >
                            {questionIndex + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                    <div className="text-xs sm:text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Answered:</span>
                        <span className="font-semibold">{answeredCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flagged:</span>
                        <span className="font-semibold">{flaggedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span className="font-semibold">{questions.length - answeredCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}