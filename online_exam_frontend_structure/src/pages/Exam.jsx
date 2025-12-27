import { useState, useEffect, useRef } from 'react';

export default function Exam({ exam, currentUser, onExamComplete, onExit }) {
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const examStarted = useRef(false);

  // Anti-Cheating: Disable right-click, copy, paste
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    const handlePaste = (e) => e.preventDefault();
    const handleCut = (e) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
    };
  }, []);

  // Anti-Cheating: Detect tab switching and visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted.current) {
        setTabSwitches(prev => prev + 1);
        alert('⚠️ Warning: Tab switching detected! This will be reported.');
      }
    };

    const handleBlur = () => {
      if (examStarted.current) {
        setTabSwitches(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    examStarted.current = true;

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

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Auto-submit when time expires
  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      submitExam(true);
    }
  };

  // Submit exam
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
        // Manual grading needed
        earnedMarks = 0; // Will be graded manually
      }

      detailedAnswers.push({
        questionId: question.id,
        question: question.question,
        type: question.type,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        marks: question.marks,
        earnedMarks: earnedMarks
      });
    });

    const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(2) : 0;
    const passed = totalScore >= exam.passingMarks;

    // Save result
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
      timeTaken: timeTaken,
      tabSwitches: tabSwitches,
      submittedAt: new Date().toISOString(),
      autoSubmit: autoSubmit,
      answers: detailedAnswers
    };

    // Store result in localStorage
    const storedResults = localStorage.getItem('examResults');
    const allResults = storedResults ? JSON.parse(storedResults) : [];
    allResults.push(result);
    localStorage.setItem('examResults', JSON.stringify(allResults));

    // Call onExamComplete callback
    onExamComplete(result);
  };

  // Navigate questions
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

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeRemaining < 300; // Less than 5 minutes

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      padding: '0',
      userSelect: 'none'
    }}>
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

            {/* Tab Switches Warning */}
            {tabSwitches > 0 && (
              <div style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(229, 62, 62, 0.2)',
                border: '1px solid #fc8181',
                borderRadius: '8px',
                color: '#fc8181',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                ⚠️ Warnings: {tabSwitches}
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