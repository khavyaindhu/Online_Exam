import { useState, useEffect } from 'react';
import CreateExam from './CreateExam';

export default function TeacherDashboard({ currentUser, onLogout }) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    const storedExams = localStorage.getItem('exams');
    const allExams = storedExams ? JSON.parse(storedExams) : [];
    const myExams = allExams.filter(exam => exam.createdBy === currentUser.userId);
    setExams(myExams);
  };

  const deleteExam = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      const storedExams = localStorage.getItem('exams');
      const allExams = storedExams ? JSON.parse(storedExams) : [];
      const updatedExams = allExams.filter(exam => exam.id !== examId);
      localStorage.setItem('exams', JSON.stringify(updatedExams));
      loadExams();
    }
  };

  const viewExamDetails = (exam) => {
    setSelectedExam(exam);
  };

  const closeExamDetails = () => {
    setSelectedExam(null);
  };

  // View Exam Details Modal
  if (selectedExam) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        padding: '32px'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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

          {/* Exam Header */}
          <div style={{
            backgroundColor: 'rgba(26, 32, 44, 0.6)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #4a5568',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '16px'
            }}>
              <h1 style={{ color: '#fff', fontSize: '28px', margin: '0' }}>
                {selectedExam.title}
              </h1>
              <span style={{
                padding: '6px 16px',
                backgroundColor: selectedExam.status === 'active' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(237, 137, 54, 0.2)',
                color: selectedExam.status === 'active' ? '#48bb78' : '#ed8936',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {selectedExam.status.toUpperCase()}
              </span>
            </div>

            <p style={{ color: '#a0aec0', fontSize: '16px', marginBottom: '24px' }}>
              {selectedExam.description || 'No description'}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {[
                { label: 'Duration', value: `${selectedExam.duration} mins`, icon: '⏱️' },
                { label: 'Questions', value: selectedExam.questions.length, icon: '❓' },
                { label: 'Total Marks', value: selectedExam.totalMarks, icon: '📊' },
                { label: 'Passing', value: selectedExam.passingMarks, icon: '✅' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  backgroundColor: 'rgba(45, 55, 72, 0.6)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                    {item.value}
                  </div>
                  <div style={{ color: '#a0aec0', fontSize: '12px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div style={{
            backgroundColor: 'rgba(26, 32, 44, 0.6)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #4a5568'
          }}>
            <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
              📝 Questions ({selectedExam.questions.length})
            </h2>

            {selectedExam.questions.map((q, idx) => (
              <div key={q.id} style={{
                backgroundColor: 'rgba(45, 55, 72, 0.6)',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #4a5568'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    color: '#667eea',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    Q{idx + 1} • {q.type.toUpperCase()} • {q.marks} marks
                  </span>
                </div>

                <p style={{ 
                  color: '#e2e8f0',
                  fontSize: '16px',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {q.question}
                </p>

                {q.type === 'mcq' && (
                  <div>
                    <div style={{ 
                      color: '#a0aec0',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}>
                      Options:
                    </div>
                    {q.options.map((opt, i) => (
                      <div key={i} style={{
                        padding: '12px 16px',
                        marginBottom: '8px',
                        backgroundColor: opt === q.correctAnswer 
                          ? 'rgba(72, 187, 120, 0.15)' 
                          : 'rgba(26, 32, 44, 0.6)',
                        border: opt === q.correctAnswer
                          ? '2px solid rgba(72, 187, 120, 0.5)'
                          : '1px solid #4a5568',
                        borderRadius: '8px',
                        color: opt === q.correctAnswer ? '#48bb78' : '#cbd5e0',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{opt}</span>
                        {opt === q.correctAnswer && (
                          <span style={{ fontWeight: '600' }}>✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'truefalse' && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(72, 187, 120, 0.15)',
                    border: '2px solid rgba(72, 187, 120, 0.5)',
                    borderRadius: '8px',
                    color: '#48bb78',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    ✓ Correct Answer: {q.correctAnswer}
                  </div>
                )}

                {q.type === 'short' && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(237, 137, 54, 0.1)',
                    border: '1px solid rgba(237, 137, 54, 0.3)',
                    borderRadius: '8px',
                    color: '#ed8936',
                    fontSize: '13px'
                  }}>
                    💡 This question requires manual grading
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showCreateExam) {
    return (
      <CreateExam
        currentUser={currentUser}
        onBack={() => setShowCreateExam(false)}
        onExamCreated={() => {
          setShowCreateExam(false);
          setSelectedTab('exams');
          loadExams();
        }}
      />
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
            👨‍🏫 Teacher Dashboard
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            color: '#a0aec0',
            fontSize: '14px'
          }}>
            Welcome back, {currentUser.name}
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
          { id: 'overview', label: '📊 Overview' },
          { id: 'exams', label: '📝 My Exams' },
          { id: 'results', label: '📈 Results' }
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
        {selectedTab === 'overview' && (
          <div>
            <h2 style={{
              color: '#fff',
              fontSize: '20px',
              marginBottom: '24px'
            }}>
              Quick Statistics
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {[
                { icon: '📝', label: 'Total Exams', value: exams.length, color: '#667eea' },
                { icon: '✅', label: 'Active Exams', value: exams.filter(e => e.status === 'active').length, color: '#48bb78' },
                { icon: '❓', label: 'Total Questions', value: exams.reduce((sum, e) => sum + e.questions.length, 0), color: '#ed8936' },
                { icon: '📊', label: 'Avg Score', value: '0%', color: '#9f7aea' }
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

            <div style={{
              backgroundColor: 'rgba(26, 32, 44, 0.6)',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #4a5568'
            }}>
              <h3 style={{
                color: '#fff',
                fontSize: '18px',
                marginBottom: '20px'
              }}>
                🚀 Quick Actions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <button
                  onClick={() => setShowCreateExam(true)}
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ➕ Create New Exam
                </button>
                <button
                  onClick={() => setSelectedTab('exams')}
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📝 View My Exams
                </button>
                <button
                  onClick={() => setSelectedTab('results')}
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📈 Check Results
                </button>
              </div>
            </div>
          </div>
        )}

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
                My Exams ({exams.length})
              </h2>
              <button
                onClick={() => setShowCreateExam(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                ➕ Create New Exam
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
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                <p style={{ color: '#a0aec0', fontSize: '16px', marginBottom: '16px' }}>
                  No exams created yet
                </p>
                <button
                  onClick={() => setShowCreateExam(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  ➕ Create Your First Exam
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {exams.map(exam => (
                  <div key={exam.id} style={{
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
                      <div style={{ fontSize: '40px' }}>📝</div>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: exam.status === 'active' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(237, 137, 54, 0.2)',
                        color: exam.status === 'active' ? '#48bb78' : '#ed8936',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {exam.status.toUpperCase()}
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
                      lineHeight: '1.5'
                    }}>
                      {exam.description || 'No description'}
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      color: '#cbd5e0'
                    }}>
                      <div>⏱️ {exam.duration} mins</div>
                      <div>❓ {exam.questions.length} questions</div>
                      <div>📊 {exam.totalMarks} marks</div>
                      <div>✅ Pass: {exam.passingMarks}</div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        style={{
                          padding: '10px',
                          backgroundColor: 'rgba(229, 62, 62, 0.2)',
                          color: '#fc8181',
                          border: '1px solid #fc8181',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() => viewExamDetails(exam)}
                        style={{
                          padding: '10px',
                          backgroundColor: 'rgba(102, 126, 234, 0.2)',
                          color: '#667eea',
                          border: '1px solid #667eea',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        👁️ View
                      </button>
                    </div>
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
              Student Results
            </h2>
            <div style={{
              backgroundColor: 'rgba(26, 32, 44, 0.6)',
              padding: '48px',
              borderRadius: '16px',
              border: '1px solid #4a5568',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📈</div>
              <p style={{ color: '#a0aec0', fontSize: '16px' }}>
                Results will appear here once students complete exams
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}