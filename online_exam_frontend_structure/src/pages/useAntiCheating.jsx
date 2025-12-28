import { useEffect, useRef, useState } from 'react';

// ============================================================================
// ANTI-CHEATING HOOK
// ============================================================================
export const useAntiCheating = (options = {}) => {
  const {
    onTabSwitch = () => {},
    onCopyAttempt = () => {},
    onPasteAttempt = () => {},
    onDevToolsDetected = () => {},
    onFullscreenExit = () => {},
    maxWarnings = 5,
    autoSubmitOnMaxWarnings = false,
    onAutoSubmit = () => {},
    enabled = true
  } = options;

  const [violations, setViolations] = useState({
    tabSwitches: 0,
    copyAttempts: 0,
    pasteAttempts: 0,
    devToolsDetections: 0,
    fullscreenExits: 0
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const examStarted = useRef(false);

  // Track total violations
  const totalViolations = Object.values(violations).reduce((sum, val) => sum + val, 0);

  // ============================================================================
  // 1. TAB SWITCH & VISIBILITY DETECTION
  // ============================================================================
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && examStarted.current) {
        setViolations(prev => {
          const newCount = prev.tabSwitches + 1;
          showWarning(`⚠️ Tab Switch Detected! (Warning ${newCount})`);
          onTabSwitch(newCount);
          
          if (autoSubmitOnMaxWarnings && (prev.tabSwitches + 1) >= maxWarnings) {
            onAutoSubmit('Maximum warnings reached - Auto submitting exam');
          }
          
          return { ...prev, tabSwitches: newCount };
        });
      }
    };

    const handleBlur = () => {
      if (examStarted.current && !document.hidden) {
        setViolations(prev => {
          const newCount = prev.tabSwitches + 1;
          showWarning(`⚠️ Window Focus Lost! (Warning ${newCount})`);
          onTabSwitch(newCount);
          
          if (autoSubmitOnMaxWarnings && (prev.tabSwitches + 1) >= maxWarnings) {
            onAutoSubmit('Maximum warnings reached - Auto submitting exam');
          }
          
          return { ...prev, tabSwitches: newCount };
        });
      }
    };

    examStarted.current = true;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      examStarted.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, maxWarnings, autoSubmitOnMaxWarnings, onTabSwitch, onAutoSubmit]);

  // ============================================================================
  // 2. COPY/PASTE/CUT PREVENTION
  // ============================================================================
  useEffect(() => {
    if (!enabled) return;

    const handleCopy = (e) => {
      e.preventDefault();
      setViolations(prev => {
        const newCount = prev.copyAttempts + 1;
        showWarning(`🚫 Copy Detected! This action is not allowed. (Warning ${newCount})`);
        onCopyAttempt(newCount);
        return { ...prev, copyAttempts: newCount };
      });
    };

    const handlePaste = (e) => {
      e.preventDefault();
      setViolations(prev => {
        const newCount = prev.pasteAttempts + 1;
        showWarning(`🚫 Paste Detected! This action is not allowed. (Warning ${newCount})`);
        onPasteAttempt(newCount);
        return { ...prev, pasteAttempts: newCount };
      });
    };

    const handleCut = (e) => {
      e.preventDefault();
      setViolations(prev => {
        const newCount = prev.copyAttempts + 1;
        showWarning(`🚫 Cut Detected! This action is not allowed. (Warning ${newCount})`);
        onCopyAttempt(newCount);
        return { ...prev, copyAttempts: newCount };
      });
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      showWarning('🚫 Right-click is disabled during the exam!');
    };

    // Keyboard shortcuts prevention
    const handleKeyDown = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+S
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'x', 'a', 'p', 's'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          showWarning(`🚫 Keyboard shortcut (Ctrl+${e.key.toUpperCase()}) is disabled!`);
        }
      }

      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (Dev tools)
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
        setViolations(prev => {
          const newCount = prev.devToolsDetections + 1;
          showWarning(`🚫 Developer tools shortcut detected! (Warning ${newCount})`);
          onDevToolsDetected(newCount);
          return { ...prev, devToolsDetections: newCount };
        });
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onCopyAttempt, onPasteAttempt, onDevToolsDetected]);

  // ============================================================================
  // 3. FULLSCREEN ENFORCEMENT (Optional)
  // ============================================================================
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && examStarted.current) {
        setViolations(prev => {
          const newCount = prev.fullscreenExits + 1;
          showWarning(`⚠️ Fullscreen exited! Please return to fullscreen. (Warning ${newCount})`);
          onFullscreenExit(newCount);
          return { ...prev, fullscreenExits: newCount };
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [enabled, onFullscreenExit]);

  // ============================================================================
  // 4. DEVTOOLS DETECTION (Advanced)
  // ============================================================================
  useEffect(() => {
    if (!enabled) return;

    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true;
        setViolations(prev => {
          const newCount = prev.devToolsDetections + 1;
          showWarning(`🚫 Developer Tools Detected! (Warning ${newCount})`);
          onDevToolsDetected(newCount);
          return { ...prev, devToolsDetections: newCount };
        });
      } else if (!widthThreshold && !heightThreshold && devtoolsOpen) {
        devtoolsOpen = false;
      }
    };

    const interval = setInterval(checkDevTools, 1000);

    return () => clearInterval(interval);
  }, [enabled, onDevToolsDetected]);

  // ============================================================================
  // WARNING MODAL HELPER
  // ============================================================================
  const showWarning = (message) => {
    setWarningMessage(message);
    setShowWarningModal(true);
    setTimeout(() => setShowWarningModal(false), 3000);
  };

  // ============================================================================
  // FULLSCREEN HELPERS
  // ============================================================================
  const requestFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  return {
    violations,
    totalViolations,
    isFullscreen,
    showWarningModal,
    warningMessage,
    requestFullscreen,
    exitFullscreen,
    WarningModal: () => showWarningModal ? (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: '#e53e3e',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(229, 62, 62, 0.5)',
        fontSize: '15px',
        fontWeight: '600',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {warningMessage}
      </div>
    ) : null
  };
};

// ============================================================================
// PROCTORING OVERLAY COMPONENT
// ============================================================================
export const ProctoringOverlay = ({ violations, maxWarnings, onForceExit }) => {
  const totalViolations = Object.values(violations).reduce((sum, val) => sum + val, 0);
  const warningLevel = totalViolations >= maxWarnings ? 'critical' : 
                       totalViolations >= maxWarnings * 0.7 ? 'high' : 
                       totalViolations > 0 ? 'medium' : 'safe';

  const colors = {
    safe: '#48bb78',
    medium: '#ed8936',
    high: '#f6ad55',
    critical: '#fc8181'
  };

  const messages = {
    safe: '✓ No violations detected',
    medium: '⚠️ Some violations detected',
    high: '⚠️ Multiple violations detected',
    critical: '🚨 Critical: Maximum warnings reached!'
  };

  if (totalViolations === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(26, 32, 44, 0.95)',
      border: `2px solid ${colors[warningLevel]}`,
      borderRadius: '12px',
      padding: '16px 20px',
      zIndex: 9998,
      minWidth: '280px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        color: colors[warningLevel],
        fontSize: '14px',
        fontWeight: '700',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {messages[warningLevel]}
      </div>

      <div style={{ fontSize: '12px', color: '#cbd5e0', marginBottom: '8px' }}>
        <div style={{ marginBottom: '4px' }}>
          🔄 Tab Switches: <strong style={{ color: colors[warningLevel] }}>{violations.tabSwitches}</strong>
        </div>
        <div style={{ marginBottom: '4px' }}>
          📋 Copy Attempts: <strong style={{ color: colors[warningLevel] }}>{violations.copyAttempts}</strong>
        </div>
        <div style={{ marginBottom: '4px' }}>
          📌 Paste Attempts: <strong style={{ color: colors[warningLevel] }}>{violations.pasteAttempts}</strong>
        </div>
        <div>
          🔧 DevTools: <strong style={{ color: colors[warningLevel] }}>{violations.devToolsDetections}</strong>
        </div>
      </div>

      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #4a5568',
        fontSize: '13px',
        color: '#a0aec0',
        textAlign: 'center'
      }}>
        Total: <strong style={{ color: colors[warningLevel] }}>{totalViolations}</strong> / {maxWarnings} warnings
      </div>

      {warningLevel === 'critical' && (
        <button
          onClick={onForceExit}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#fc8181',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          🚨 Submit & Exit
        </button>
      )}
    </div>
  );
};