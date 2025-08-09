"use client";

import { useState, useEffect, useCallback } from 'react';

interface SecurityEvent {
  timestamp: string;
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface SecurityReport {
  tabSwitchCount: number;
  rightClickAttempts: number;
  keyboardViolations: number;
  fullscreenExits: number;
  suspiciousActivities: SecurityEvent[];
  testIntegrity: 'HIGH' | 'MEDIUM' | 'LOW' | 'COMPROMISED';
  startTime: number;
  endTime?: number;
}

export const useSecureTest = () => {
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [securityReport, setSecurityReport] = useState<SecurityReport>({
    tabSwitchCount: 0,
    rightClickAttempts: 0,
    keyboardViolations: 0,
    fullscreenExits: 0,
    suspiciousActivities: [],
    testIntegrity: 'HIGH',
    startTime: 0
  });

  // Log security event
  const logSecurityEvent = useCallback((event: string, severity: SecurityEvent['severity'] = 'MEDIUM') => {
    const securityEvent: SecurityEvent = {
      timestamp: new Date().toISOString(),
      event,
      severity
    };

    setSecurityReport(prev => ({
      ...prev,
      suspiciousActivities: [...prev.suspiciousActivities, securityEvent]
    }));

    // Update integrity based on severity
    if (severity === 'CRITICAL') {
      setSecurityReport(prev => ({ ...prev, testIntegrity: 'COMPROMISED' }));
    } else if (severity === 'HIGH' && securityReport.testIntegrity === 'HIGH') {
      setSecurityReport(prev => ({ ...prev, testIntegrity: 'LOW' }));
    }

    console.warn(`🔒 Security Event [${severity}]:`, event);
  }, [securityReport.testIntegrity]);

  // Enter secure mode
  const enterSecureMode = useCallback(async () => {
    try {
      // Request fullscreen
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      }

      setIsSecureMode(true);
      setSecurityReport(prev => ({
        ...prev,
        startTime: Date.now(),
        testIntegrity: 'HIGH'
      }));

      logSecurityEvent('Secure test mode activated', 'LOW');
      return true;
    } catch (error) {
      logSecurityEvent('Failed to enter secure mode', 'HIGH');
      return false;
    }
  }, [logSecurityEvent]);

  // Exit secure mode
  const exitSecureMode = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    setIsSecureMode(false);
    setSecurityReport(prev => ({
      ...prev,
      endTime: Date.now()
    }));

    logSecurityEvent('Secure test mode deactivated', 'LOW');
  }, [logSecurityEvent]);

  // Increment violation counters
  const incrementTabSwitch = useCallback(() => {
    setSecurityReport(prev => ({ ...prev, tabSwitchCount: prev.tabSwitchCount + 1 }));
    logSecurityEvent('Tab switch detected', 'CRITICAL');
  }, [logSecurityEvent]);

  const incrementRightClick = useCallback(() => {
    setSecurityReport(prev => ({ ...prev, rightClickAttempts: prev.rightClickAttempts + 1 }));
    logSecurityEvent('Right-click attempt blocked', 'MEDIUM');
  }, [logSecurityEvent]);

  const incrementKeyboardViolation = useCallback(() => {
    setSecurityReport(prev => ({ ...prev, keyboardViolations: prev.keyboardViolations + 1 }));
    logSecurityEvent('Forbidden keyboard shortcut blocked', 'HIGH');
  }, [logSecurityEvent]);

  const incrementFullscreenExit = useCallback(() => {
    setSecurityReport(prev => ({ ...prev, fullscreenExits: prev.fullscreenExits + 1 }));
    logSecurityEvent('Fullscreen mode exited', 'CRITICAL');
  }, [logSecurityEvent]);

  // Calculate final security score
  const getSecurityScore = useCallback(() => {
    const { tabSwitchCount, rightClickAttempts, keyboardViolations, fullscreenExits } = securityReport;
    const totalViolations = tabSwitchCount + rightClickAttempts + keyboardViolations + fullscreenExits;
    
    if (totalViolations === 0) return 100;
    if (totalViolations <= 3) return 85;
    if (totalViolations <= 7) return 70;
    if (totalViolations <= 15) return 50;
    return 25;
  }, [securityReport]);

  // Generate final report
  const generateFinalReport = useCallback(() => {
    const score = getSecurityScore();
    const duration = securityReport.endTime ? 
      securityReport.endTime - securityReport.startTime : 
      Date.now() - securityReport.startTime;

    return {
      ...securityReport,
      securityScore: score,
      testDuration: duration,
      finalIntegrity: score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : score >= 50 ? 'LOW' : 'COMPROMISED'
    };
  }, [securityReport, getSecurityScore]);

  return {
    isSecureMode,
    securityReport,
    enterSecureMode,
    exitSecureMode,
    incrementTabSwitch,
    incrementRightClick,
    incrementKeyboardViolation,
    incrementFullscreenExit,
    logSecurityEvent,
    getSecurityScore,
    generateFinalReport
  };
};