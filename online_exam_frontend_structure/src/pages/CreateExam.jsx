import { useState } from 'react';

export default function CreateExam({ currentUser, onBack, onExamCreated }) {
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    startDate: '',
    endDate: ''
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExamDataChange = (field, value) => {
    setExamData({ ...examData, [field]: value });
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion({ ...currentQuestion, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestion = () => {
    setError('');

    // Validation
    if (!currentQuestion.question.trim()) {
      setError('Please enter the question');
      return;
    }

    if (currentQuestion.type === 'mcq') {
      const filledOptions = currentQuestion.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        setError('Please provide at least 2 options');
        return;
      }
      if (!currentQuestion.correctAnswer.trim()) {
        setError('Please select the correct answer');
        return;
      }
    }

    if (currentQuestion.type === 'truefalse' && !currentQuestion.correctAnswer) {
      setError('Please select True or False');
      return;
    }

    // Add question
    const newQuestion = {
      id: Date.now(),
      ...currentQuestion,
      options: currentQuestion.type === 'mcq' ? currentQuestion.options.filter(opt => opt.trim()) : []
    };

    setQuestions([...questions, newQuestion]);

    // Reset form
    setCurrentQuestion({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1
    });

    setSuccess(`Question ${questions.length + 1} added!`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const saveExam = () => {
    setError('');

    // Validation
    if (!examData.title.trim()) {
      setError('Please enter exam title');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    // Create exam object
    const exam = {
      id: Date.now(),
      ...examData,
      questions,
      createdBy: currentUser.userId,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    // Save to localStorage
    const storedExams = localStorage.getItem('exams');
    const exams = storedExams ? JSON.parse(storedExams) : [];
    exams.push(exam);
    localStorage.setItem('exams', JSON.stringify(exams));

    setSuccess('Exam created successfully! Redirecting...');
    setTimeout(() => {
      if (onExamCreated) onExamCreated();
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      padding: '32px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(26, 32, 44, 0.6)',
              color: '#e2e8f0',
              border: '1px solid #4a5568',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              marginRight: '16px'
            }}
          >
            ← Back
          </button>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0' }}>
            ➕ Create New Exam
          </h1>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(254, 178, 178, 0.15)',
            color: '#fc8181',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid rgba(254, 178, 178, 0.3)'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(154, 230, 180, 0.15)',
            color: '#68d391',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid rgba(154, 230, 180, 0.3)'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Exam Details */}
        <div style={{
          backgroundColor: 'rgba(26, 32, 44, 0.6)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #4a5568',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
            📋 Exam Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Exam Title *
              </label>
              <input
                type="text"
                value={examData.title}
                onChange={(e) => handleExamDataChange('title', e.target.value)}
                placeholder="e.g., Mid Term Exam - React Basics"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2d3748',
                  border: '2px solid #4a5568',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={examData.description}
                onChange={(e) => handleExamDataChange('description', e.target.value)}
                placeholder="Brief description of the exam..."
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2d3748',
                  border: '2px solid #4a5568',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                value={examData.duration}
                onChange={(e) => handleExamDataChange('duration', e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2d3748',
                  border: '2px solid #4a5568',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Total Marks
              </label>
              <input
                type="number"
                value={examData.totalMarks}
                onChange={(e) => handleExamDataChange('totalMarks', e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2d3748',
                  border: '2px solid #4a5568',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Passing Marks
              </label>
              <input
                type="number"
                value={examData.passingMarks}
                onChange={(e) => handleExamDataChange('passingMarks', e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2d3748',
                  border: '2px solid #4a5568',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Add Question */}
        <div style={{
          backgroundColor: 'rgba(26, 32, 44, 0.6)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #4a5568',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
            ❓ Add Question ({questions.length} added)
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Question Type
            </label>
            <select
              value={currentQuestion.type}
              onChange={(e) => handleQuestionChange('type', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2d3748',
                border: '2px solid #4a5568',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="truefalse">True/False</option>
              <option value="short">Short Answer</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Question *
            </label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) => handleQuestionChange('question', e.target.value)}
              placeholder="Enter your question here..."
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2d3748',
                border: '2px solid #4a5568',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                minHeight: '80px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {currentQuestion.type === 'mcq' && (
            <>
              <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
                Options
              </label>
              {currentQuestion.options.map((opt, idx) => (
                <div key={idx} style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#2d3748',
                      border: '2px solid #4a5568',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  Correct Answer *
                </label>
                <select
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2d3748',
                    border: '2px solid #4a5568',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Select Correct Answer --</option>
                  {currentQuestion.options.filter(opt => opt.trim()).map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {currentQuestion.type === 'truefalse' && (
            <div>
              <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Correct Answer *
              </label>
              <select
                value={currentQuestion.correctAnswer}
                onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2d3748',
                  border: '2px solid #4a5568',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select Answer --</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </div>
          )}

          {currentQuestion.type === 'short' && (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(237, 137, 54, 0.1)',
              border: '1px solid rgba(237, 137, 54, 0.3)',
              borderRadius: '8px',
              color: '#ed8936',
              fontSize: '13px'
            }}>
              💡 Short answer questions require manual grading by teachers
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Marks
            </label>
            <input
              type="number"
              value={currentQuestion.marks}
              onChange={(e) => handleQuestionChange('marks', e.target.value)}
              min="1"
              style={{
                width: '150px',
                padding: '12px',
                backgroundColor: '#2d3748',
                border: '2px solid #4a5568',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={addQuestion}
            style={{
              marginTop: '20px',
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
            ➕ Add Question
          </button>
        </div>

        {/* Question List */}
        {questions.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(26, 32, 44, 0.6)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #4a5568',
            marginBottom: '24px'
          }}>
            <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '24px' }}>
              📝 Questions Preview ({questions.length})
            </h2>

            {questions.map((q, idx) => (
              <div key={q.id} style={{
                backgroundColor: 'rgba(45, 55, 72, 0.6)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #4a5568'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#667eea', fontWeight: '600' }}>
                    Q{idx + 1}. {q.type.toUpperCase()} - {q.marks} marks
                  </span>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: 'rgba(229, 62, 62, 0.2)',
                      color: '#fc8181',
                      border: '1px solid #fc8181',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
                <p style={{ color: '#e2e8f0', marginBottom: '12px' }}>{q.question}</p>
                {q.type === 'mcq' && (
                  <div style={{ color: '#cbd5e0', fontSize: '14px' }}>
                    {q.options.map((opt, i) => (
                      <div key={i} style={{
                        padding: '8px',
                        marginBottom: '4px',
                        backgroundColor: opt === q.correctAnswer ? 'rgba(72, 187, 120, 0.1)' : 'transparent',
                        borderRadius: '6px'
                      }}>
                        {opt} {opt === q.correctAnswer && '✓'}
                      </div>
                    ))}
                  </div>
                )}
                {q.type === 'truefalse' && (
                  <div style={{ color: '#48bb78', fontSize: '14px' }}>
                    ✓ Correct: {q.correctAnswer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={saveExam}
            style={{
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)'
            }}
          >
            💾 Save Exam
          </button>
        </div>
      </div>
    </div>
  );
}