import { useState, useEffect } from 'react';
import Exam from './Exam';

export default function StudentDashboard({ currentUser, onLogout }) {
  const [selectedTab, setSelectedTab] = useState('exams');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isInExam, setIsInExam] = useState(false);
  const [examResult, setExamResult] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    const storedExams = localStorage.getItem('exams');
    const allExams = storedExams ? JSON.parse(storedExams) : [];
    const activeExams = allExams.filter(exam => exam.status === 'active');
    setExams(activeExams);
  };

  const loadResults = () => {
    const storedResults = localStorage.getItem('examResults');
    const allResults = storedResults ? JSON.parse(storedResults) : [];
    const myResults = allResults.filter(result => result.studentId === currentUser.userId);
    return myResults;
  };

  const viewExamDetails = (exam) => {
    setSelectedExam(exam);
    setIsInExam(false);
  };

  const closeExamDetails = () => {
    setSelectedExam(null);
    setIsInExam(false);
  };

  const startExam = (exam) => {
    setSelectedExam(exam);
    setIsInExam(true);
  };

  const handleExamComplete = (result) => {
    setIsInExam(false);
    setExamResult(result);
    setSelectedExam(null);
    loadExams();
  };

  const closeResultModal = () => {
    setExamResult(null);
    setSelectedTab('results');
  };

  // If taking exam, render Exam component
  if (isInExam && selectedExam) {
    return (
      <Exam
        exam={selectedExam}
        currentUser={currentUser}
        onExamComplete={handleExamComplete}
        onExit={() => setIsInExam(false)}
      />
    );
  }

  // Exam Details Modal (Preview before starting)
  if (selectedExam && !isInExam) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        padding: '32px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button
            onClick={closeExamDetails}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(26, 32, 44, 0.6)',
              color: '#e2e8f0',
              border: '1px solid #4a5568',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              marginBottom: '24px'
            }}
          >
            ← Back to Exams
          </button>

          <div style={{
            backgroundColor: 'rgba(26, 32, 44, 0.6)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #4a5568',
            marginBottom: '24px'
          }}>
            <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '12px' }}>
              {selectedExam.title}
            </h1>
            <p style={{ color: '#a0aec0', fontSize: '16px', marginBottom: '24px' }}>
              {selectedExam.description}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(45, 55, 72, 0.6)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏱️</div>
                <div style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  {selectedExam.duration}
                </div>
                <div style={{ color: '#a0aec0', fontSize: '12px' }}>Minutes</div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(45, 55, 72, 0.6)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>❓</div>
                <div style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  {selectedExam.questions.length}
                </div>
                <div style={{ color: '#a0aec0', fontSize: '12px' }}>Questions</div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(45, 55, 72, 0.6)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                <div style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  {selectedExam.totalMarks}
                </div>
                <div style={{ color: '#a0aec0', fontSize: '12px' }}>Total Marks</div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(45, 55, 72, 0.6)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                <div style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  {selectedExam.passingMarks}
                </div>
                <div style={{ color: '#a0aec0', fontSize: '12px' }}>Passing Marks</div>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#667eea', fontSize: '16px', marginBottom: '12px' }}>
                📋 Instructions
              </h3>
              <ul style={{ color: '#cbd5e0', fontSize: '14px', lineHeight: '1.8', margin: '0', paddingLeft: '20px' }}>
                <li>Read all questions carefully before answering</li>
                <li>You have {selectedExam.duration} minutes to complete this exam</li>
                <li>Once started, you cannot pause the exam</li>
                <li>Anti-cheating measures are active (no switching tabs, copying, etc.)</li>
                <li>Your exam will auto-submit when time expires</li>
                <li>Passing marks: {selectedExam.passingMarks} out of {selectedExam.totalMarks}</li>
              </ul>
            </div>

            <button
              onClick={() => startExam(selectedExam)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              🚀 Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      padding: '0'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(26, 32, 44, 0.95)',
        borderBottom: '1px solid #4a5568',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            margin: '0',
            color: '#fff',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            👨‍🎓 Student Portal
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            color: '#a0aec0',
            fontSize: '14px'
          }}>
            Welcome, {currentUser.name}
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'rgba(26, 32, 44, 0.6)',
        borderBottom: '1px solid #4a5568',
        padding: '0 32px',
        display: 'flex',
        gap: '8px'
      }}>
        {[
          { id: 'exams', label: '📝 Available Exams' },
          { id: 'results', label: '📊 My Results' },
          { id: 'history', label: '📜 History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            style={{
              padding: '16px 24px',
              backgroundColor: selectedTab === tab.id ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
              color: selectedTab === tab.id ? '#667eea' : '#a0aec0',
              border: 'none',
              borderBottom: selectedTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        {selectedTab === 'exams' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                color: '#fff',
                fontSize: '20px',
                margin: '0'
              }}>
                Available Exams ({exams.length})
              </h2>
              <button
                onClick={loadExams}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  color: '#667eea',
                  border: '1px solid #667eea',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                🔄 Refresh
              </button>
            </div>

            {exams.length === 0 ? (
              <div style={{
                backgroundColor: 'rgba(26, 32, 44, 0.6)',
                padding: '48px',
                borderRadius: '16px',
                border: '1px solid #4a5568',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                <p style={{ color: '#a0aec0', fontSize: '16px', marginBottom: '8px' }}>
                  No exams available
                </p>
                <p style={{ color: '#718096', fontSize: '14px' }}>
                  Check back later for new exams
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {exams.map(exam => (
                  <div key={exam.id} style={{
                    backgroundColor: 'rgba(26, 32, 44, 0.6)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #4a5568',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '40px' }}>📝</div>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: 'rgba(72, 187, 120, 0.2)',
                        color: '#48bb78',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        ACTIVE
                      </span>
                    </div>

                    <h3 style={{
                      color: '#fff',
                      fontSize: '18px',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      {exam.title}
                    </h3>

                    <p style={{
                      color: '#a0aec0',
                      fontSize: '14px',
                      marginBottom: '16px',
                      lineHeight: '1.5',
                      minHeight: '40px'
                    }}>
                      {exam.description || 'No description provided'}
                    </p>

                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      color: '#cbd5e0'
                    }}>
                      <div>⏱️ {exam.duration} mins</div>
                      <div>❓ {exam.questions.length} questions</div>
                      <div>📊 {exam.totalMarks} marks</div>
                    </div>

                    <button
                      onClick={() => viewExamDetails(exam)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Start Exam
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'results' && (
          <div>
            <h2 style={{
              color: '#fff',
              fontSize: '20px',
              marginBottom: '24px'
            }}>
              My Results
            </h2>

            {(() => {
              const myResults = loadResults();
              const completedCount = myResults.length;
              const avgScore = completedCount > 0 
                ? (myResults.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / completedCount).toFixed(2)
                : 0;
              const bestScore = completedCount > 0
                ? Math.max(...myResults.map(r => parseFloat(r.percentage))).toFixed(2)
                : 0;

              return (
                <>
                  {/* Performance Overview */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                  }}>
                    {[
                      { icon: '✅', label: 'Exams Completed', value: completedCount, color: '#48bb78' },
                      { icon: '⏳', label: 'Pending Exams', value: exams.length, color: '#ed8936' },
                      { icon: '📊', label: 'Average Score', value: `${avgScore}%`, color: '#667eea' },
                      { icon: '🏆', label: 'Best Score', value: `${bestScore}%`, color: '#f6ad55' }
                    ].map((stat, idx) => (
                      <div key={idx} style={{
                        backgroundColor: 'rgba(26, 32, 44, 0.6)',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid #4a5568'
                      }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: stat.color, marginBottom: '8px' }}>
                          {stat.value}
                        </div>
                        <div style={{ fontSize: '14px', color: '#a0aec0' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {completedCount === 0 ? (
                    <div style={{
                      backgroundColor: 'rgba(26, 32, 44, 0.6)',
                      padding: '48px',
                      borderRadius: '16px',
                      border: '1px solid #4a5568',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                      <p style={{ color: '#a0aec0', fontSize: '16px', marginBottom: '8px' }}>
                        No results yet
                      </p>
                      <p style={{ color: '#718096', fontSize: '14px' }}>
                        Complete an exam to see your results here
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                      gap: '20px'
                    }}>
                      {myResults.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map(result => (
                        <div key={result.id} style={{
                          backgroundColor: 'rgba(26, 32, 44, 0.6)',
                          padding: '24px',
                          borderRadius: '16px',
                          border: '1px solid #4a5568'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '16px'
                          }}>
                            <div style={{ fontSize: '40px' }}>
                              {result.passed ? '✅' : '❌'}
                            </div>
                            <span style={{
                              padding: '4px 12px',
                              backgroundColor: result.passed ? 'rgba(72, 187, 120, 0.2)' : 'rgba(229, 62, 62, 0.2)',
                              color: result.passed ? '#48bb78' : '#fc8181',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>

                          <h3 style={{
                            color: '#fff',
                            fontSize: '18px',
                            marginBottom: '12px',
                            fontWeight: '600'
                          }}>
                            {result.examTitle}
                          </h3>

                          <div style={{
                            fontSize: '36px',
                            fontWeight: '700',
                            color: result.passed ? '#48bb78' : '#fc8181',
                            marginBottom: '8px'
                          }}>
                            {result.percentage}%
                          </div>

                          <div style={{
                            color: '#a0aec0',
                            fontSize: '14px',
                            marginBottom: '16px'
                          }}>
                            Score: {result.obtainedMarks} / {result.totalMarks}
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            fontSize: '13px',
                            color: '#cbd5e0',
                            paddingTop: '16px',
                            borderTop: '1px solid #4a5568'
                          }}>
                            <div>
                              ⏱️ {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')}
                            </div>
                            <div style={{ color: result.tabSwitches > 0 ? '#fc8181' : '#48bb78' }}>
                              ⚠️ Warnings: {result.tabSwitches}
                            </div>
                            <div style={{ gridColumn: '1 / -1', fontSize: '12px' }}>
                              📅 {new Date(result.submittedAt).toLocaleString()}
                            </div>
                            {result.autoSubmit && (
                              <div style={{ gridColumn: '1 / -1', color: '#ed8936' }}>
                                ⏱️ Auto-submitted
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {selectedTab === 'history' && (
          <div>
            <h2 style={{
              color: '#fff',
              fontSize: '20px',
              marginBottom: '24px'
            }}>
              Exam History
            </h2>

            <div style={{
              backgroundColor: 'rgba(26, 32, 44, 0.6)',
              padding: '48px',
              borderRadius: '16px',
              border: '1px solid #4a5568',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📜</div>
              <p style={{ color: '#a0aec0', fontSize: '16px', marginBottom: '8px' }}>
                No exam history
              </p>
              <p style={{ color: '#718096', fontSize: '14px' }}>
                Your completed exams will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {examResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
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
            {/* Success/Fail Icon */}
            <div style={{
              fontSize: '80px',
              marginBottom: '20px'
            }}>
              {examResult.passed ? '🎉' : '😔'}
            </div>

            {/* Result Status */}
            <h1 style={{
              color: examResult.passed ? '#48bb78' : '#fc8181',
              fontSize: '36px',
              marginBottom: '16px',
              fontWeight: '700'
            }}>
              {examResult.passed ? 'Congratulations!' : 'Not Passed'}
            </h1>

            <p style={{
              color: '#a0aec0',
              fontSize: '18px',
              marginBottom: '32px'
            }}>
              {examResult.passed 
                ? 'You have successfully passed the exam!' 
                : 'Keep practicing, you can do better next time!'}
            </p>

            {/* Score Display */}
            <div style={{
              backgroundColor: 'rgba(45, 55, 72, 0.6)',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                fontSize: '56px',
                fontWeight: '700',
                color: examResult.passed ? '#48bb78' : '#fc8181',
                marginBottom: '8px'
              }}>
                {examResult.percentage}%
              </div>
              <div style={{
                color: '#cbd5e0',
                fontSize: '18px',
                marginBottom: '16px'
              }}>
                {examResult.obtainedMarks} / {examResult.totalMarks} marks
              </div>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginTop: '20px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(26, 32, 44, 0.6)',
                  borderRadius: '10px'
                }}>
                  <div style={{ color: '#a0aec0', fontSize: '13px', marginBottom: '4px' }}>
                    Time Taken
                  </div>
                  <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                    {Math.floor(examResult.timeTaken / 60)}:{(examResult.timeTaken % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(26, 32, 44, 0.6)',
                  borderRadius: '10px'
                }}>
                  <div style={{ color: '#a0aec0', fontSize: '13px', marginBottom: '4px' }}>
                    Warnings
                  </div>
                  <div style={{ color: examResult.tabSwitches > 0 ? '#fc8181' : '#48bb78', fontSize: '18px', fontWeight: '600' }}>
                    {examResult.tabSwitches}
                  </div>
                </div>
              </div>

              {examResult.autoSubmit && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'rgba(237, 137, 54, 0.1)',
                  border: '1px solid rgba(237, 137, 54, 0.3)',
                  borderRadius: '10px',
                  color: '#ed8936',
                  fontSize: '14px'
                }}>
                  ⏱️ Auto-submitted (Time expired)
                </div>
              )}
            </div>

            <button
              onClick={closeResultModal}
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              View My Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}