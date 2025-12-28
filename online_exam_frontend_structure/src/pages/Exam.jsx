import { useState, useEffect, useRef } from 'react';
import { useAntiCheating, ProctoringOverlay } from './useAntiCheating';

export default function Exam({ exam, currentUser, onExamComplete, onExit }) {
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const startTime = useRef(Date.now());

  // ============================================================================
  // ANTI-CHEATING INTEGRATION
  // ============================================================================
  const antiCheating = useAntiCheating({
    maxWarnings: 5,
    autoSubmitOnMaxWarnings: true,
    onTabSwitch: (count) => {
      console.log(`Tab switch detected. Total: ${count}`);
    },
    onCopyAttempt: (count) => {
      console.log(`Copy attempt detected. Total: ${count}`);
    },
    onPasteAttempt: (count) => {
      console.log(`Paste attempt detected. Total: ${count}`);
    },
    onDevToolsDetected: (count) => {
      console.log(`DevTools detected. Total: ${count}`);
    },
    onFullscreenExit: (count) => {
      console.log(`Fullscreen exited. Total: ${count}`);
    },
    onAutoSubmit: (reason) => {
      alert(`⚠️ ${reason}`);
      handleAutoSubmit();
    },
    enabled: true
  });

  const { 
    violations, 
    totalViolations, 
    isFullscreen, 
    requestFullscreen,
    WarningModal 
  } = antiCheating;

  // ============================================================================
  // TIMER COUNTDOWN
  // ============================================================================
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // ANSWER HANDLING
  // ============================================================================
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // ============================================================================
  // EXAM SUBMISSION
  // ============================================================================
  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      submitExam(true);
    }
  };

  const submitExam = (autoSubmit = false) => {
    setIsSubmitting(true);
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime.current) / 1000);

    // Calculate score
    let totalScore = 0;
    let maxScore = 0;
    const detailedAnswers = [];

    exam.questions.forEach(question => {
      maxScore += question.marks;
      const userAnswer = answers[question.id] || '';
      let isCorrect = false;
      let earnedMarks = 0;

      if (question.type === 'mcq' || question.type === 'truefalse') {
        isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
        earnedMarks = isCorrect ? question.marks : 0;
        totalScore += earnedMarks;
      } else if (question.type === 'short') {
        earnedMarks = 0;
      }

      detailedAnswers.push({
        questionId: question.id,
        question: question.question,
        type: question.type,
        answer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        marks: question.marks,
        obtainedMarks: earnedMarks
      });
    });

    const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(2) : 0;
    const passed = totalScore >= exam.passingMarks;

    // Save result with ALL violation data
    const result = {
      id: `result_${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: currentUser.userId,
      studentName: currentUser.name,
      totalMarks: maxScore,
      obtainedMarks: totalScore,
      percentage: percentage,
      passed: passed,
      passingMarks: exam.passingMarks,
      timeTaken: timeTaken,
      tabSwitches: violations.tabSwitches,
      copyAttempts: violations.copyAttempts,
      pasteAttempts: violations.pasteAttempts,
      devToolsDetections: violations.devToolsDetections,
      fullscreenExits: violations.fullscreenExits,
      totalViolations: totalViolations,
      submittedAt: new Date().toISOString(),
      autoSubmit: autoSubmit,
      answers: detailedAnswers
    };

    const storedResults = localStorage.getItem('examResults') || '[]';
    const allResults = JSON.parse(storedResults);
    allResults.push(result);
    localStorage.setItem('examResults', JSON.stringify(allResults));

    onExamComplete(result);
  };

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // ============================================================================
  // START EXAM (FULLSCREEN PROMPT)
  // ============================================================================
  const startExamWithFullscreen = () => {
    requestFullscreen();
    setShowFullscreenPrompt(false);
  };

  const startExamWithoutFullscreen = () => {
    setShowFullscreenPrompt(false);
  };

  // ============================================================================
  // RENDER: FULLSCREEN PROMPT
  // ============================================================================
  if (showFullscreenPrompt) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#1a202c',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #4a5568',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '16px' }}>
            Anti-Cheating Measures Active
          </h1>
          <p style={{ color: '#a0aec0', fontSize: '16px', marginBottom: '24px', lineHeight: '1.6' }}>
            This exam has strict proctoring enabled. The following actions are monitored:
          </p>
          <div style={{
            textAlign: 'left',
            backgroundColor: 'rgba(45, 55, 72, 0.6)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <ul style={{ color: '#cbd5e0', fontSize: '14px', lineHeight: '2', margin: 0, paddingLeft: '20px' }}>
              <li>🔄 <strong>Tab switching</strong> will be tracked</li>
              <li>📋 <strong>Copy/paste</strong> operations are disabled</li>
              <li>🔧 <strong>Developer tools</strong> are blocked</li>
              <li>📱 <strong>Window focus loss</strong> will be logged</li>
              <li>⚠️ <strong>Maximum 5 warnings</strong> before auto-submission</li>
            </ul>
          </div>
          <p style={{ color: '#ed8936', fontSize: '14px', marginBottom: '24px', fontWeight: '600' }}>
            ⚠️ We recommend using fullscreen mode for the best experience
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={startExamWithoutFullscreen}
              style={{
                padding: '16px',
                backgroundColor: 'rgba(45, 55, 72, 0.6)',
                color: '#a0aec0',
                border: '1px solid #4a5568',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Start Without Fullscreen
            </button>
            <button
              onClick={startExamWithFullscreen}
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              🚀 Start with Fullscreen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: EXAM INTERFACE
  // ============================================================================
  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeRemaining < 300;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      padding: '0',
      userSelect: 'none'
    }}>
      {/* Warning Toast */}
      <WarningModal />

      {/* Proctoring Overlay */}
      <ProctoringOverlay 
        violations={violations}
        maxWarnings={5}
        onForceExit={handleAutoSubmit}
      />

      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(26, 32, 44, 0.95)',
        borderBottom: '1px solid #4a5568',
        padding: '16px 32px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              margin: '0',
              color: '#fff',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              📝 {exam.title}
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: '#a0aec0',
              fontSize: '13px'
            }}>
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Timer */}
            <div style={{
              padding: '12px 20px',
              backgroundColor: isLowTime ? 'rgba(229, 62, 62, 0.2)' : 'rgba(102, 126, 234, 0.2)',
              border: `2px solid ${isLowTime ? '#fc8181' : '#667eea'}`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>⏱️</span>
              <span style={{
                color: isLowTime ? '#fc8181' : '#667eea',
                fontSize: '18px',
                fontWeight: '700',
                fontFamily: 'monospace'
              }}>
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Total Violations */}
            {totalViolations > 0 && (
              <div style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(229, 62, 62, 0.2)',
                border: '1px solid #fc8181',
                borderRadius: '8px',
                color: '#fc8181',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                ⚠️ Warnings: {totalViolations}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              ✓ Submit Exam
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          maxWidth: '1400px',
          margin: '12px auto 0',
          height: '6px',
          backgroundColor: 'rgba(45, 55, 72, 0.6)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: '24px'
      }}>
        {/* Question Area */}
        <div>
          <div style={{
            backgroundColor: 'rgba(26, 32, 44, 0.6)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #4a5568',
            minHeight: '500px'
          }}>
            {/* Question Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <span style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                color: '#667eea',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Question {currentQuestionIndex + 1} • {currentQuestion.type.toUpperCase()} • {currentQuestion.marks} marks
              </span>
            </div>

            {/* Question Text */}
            <div style={{
              color: '#e2e8f0',
              fontSize: '18px',
              lineHeight: '1.8',
              marginBottom: '32px',
              fontWeight: '500'
            }}>
              {currentQuestion.question}
            </div>

            {/* Answer Options */}
            <div>
              {currentQuestion.type === 'mcq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentQuestion.options.map((option, idx) => (
                    <label
                      key={idx}
                      style={{
                        padding: '16px 20px',
                        backgroundColor: answers[currentQuestion.id] === option
                          ? 'rgba(102, 126, 234, 0.2)'
                          : 'rgba(45, 55, 72, 0.6)',
                        border: answers[currentQuestion.id] === option
                          ? '2px solid #667eea'
                          : '1px solid #4a5568',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer'
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'truefalse' && (
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      style={{
                        flex: 1,
                        padding: '20px',
                        backgroundColor: answers[currentQuestion.id] === option
                          ? 'rgba(102, 126, 234, 0.2)'
                          : 'rgba(45, 55, 72, 0.6)',
                        border: answers[currentQuestion.id] === option
                          ? '2px solid #667eea'
                          : '1px solid #4a5568',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease',
                        fontWeight: '600'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer'
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'short' && (
                <div>
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      padding: '16px',
                      backgroundColor: 'rgba(45, 55, 72, 0.6)',
                      border: '1px solid #4a5568',
                      borderRadius: '12px',
                      color: '#e2e8f0',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                  <p style={{
                    marginTop: '12px',
                    color: '#a0aec0',
                    fontSize: '13px'
                  }}>
                    💡 This question will be manually graded by your teacher
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px'
          }}>
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: '14px 28px',
                backgroundColor: currentQuestionIndex === 0 ? 'rgba(45, 55, 72, 0.4)' : 'rgba(102, 126, 234, 0.2)',
                color: currentQuestionIndex === 0 ? '#718096' : '#667eea',
                border: '1px solid #4a5568',
                borderRadius: '10px',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              ← Previous
            </button>

            <button
              onClick={goToNext}
              disabled={currentQuestionIndex === exam.questions.length - 1}
              style={{
                padding: '14px 28px',
                backgroundColor: currentQuestionIndex === exam.questions.length - 1 ? 'rgba(45, 55, 72, 0.4)' : 'rgba(102, 126, 234, 0.2)',
                color: currentQuestionIndex === exam.questions.length - 1 ? '#718096' : '#667eea',
                border: '1px solid #4a5568',
                borderRadius: '10px',
                cursor: currentQuestionIndex === exam.questions.length - 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question Palette */}
        <div>
          <div style={{
            backgroundColor: 'rgba(26, 32, 44, 0.6)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #4a5568',
            position: 'sticky',
            top: '140px'
          }}>
            <h3 style={{
              color: '#fff',
              fontSize: '16px',
              marginBottom: '16px'
            }}>
              📋 Question Palette
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {exam.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  style={{
                    padding: '12px',
                    backgroundColor: idx === currentQuestionIndex
                      ? 'rgba(102, 126, 234, 0.3)'
                      : answers[q.id]
                      ? 'rgba(72, 187, 120, 0.2)'
                      : 'rgba(45, 55, 72, 0.6)',
                    color: idx === currentQuestionIndex
                      ? '#667eea'
                      : answers[q.id]
                      ? '#48bb78'
                      : '#a0aec0',
                    border: idx === currentQuestionIndex
                      ? '2px solid #667eea'
                      : '1px solid #4a5568',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div style={{
              borderTop: '1px solid #4a5568',
              paddingTop: '16px',
              fontSize: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'rgba(72, 187, 120, 0.2)',
                  border: '1px solid #48bb78',
                  borderRadius: '4px'
                }} />
                <span style={{ color: '#a0aec0' }}>Answered ({answeredCount})</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'rgba(45, 55, 72, 0.6)',
                  border: '1px solid #4a5568',
                  borderRadius: '4px'
                }} />
                <span style={{ color: '#a0aec0' }}>Not Answered ({exam.questions.length - answeredCount})</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'rgba(102, 126, 234, 0.3)',
                  border: '2px solid #667eea',
                  borderRadius: '4px'
                }} />
                <span style={{ color: '#a0aec0' }}>Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#1a202c',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #4a5568',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '24px',
              marginBottom: '16px'
            }}>
              ⚠️ Submit Exam?
            </h2>

            <p style={{
              color: '#a0aec0',
              fontSize: '16px',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              You have answered <strong style={{ color: '#48bb78' }}>{answeredCount}</strong> out of <strong>{exam.questions.length}</strong> questions.
              {answeredCount < exam.questions.length && (
                <span style={{ display: 'block', marginTop: '12px', color: '#ed8936' }}>
                  ⚠️ You have {exam.questions.length - answeredCount} unanswered question(s).
                </span>
              )}
            </p>

            {totalViolations > 0 && (
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                border: '1px solid #fc8181',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ color: '#fc8181', fontSize: '14px', margin: 0 }}>
                  ⚠️ Total violations detected: <strong>{totalViolations}</strong>
                </p>
              </div>
            )}

            <p style={{
              color: '#cbd5e0',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              Once submitted, you cannot change your answers. Are you sure?
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  padding: '14px',
                  backgroundColor: 'rgba(45, 55, 72, 0.6)',
                  color: '#a0aec0',
                  border: '1px solid #4a5568',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => submitExam(false)}
                style={{
                  padding: '14px',
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                ✓ Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}