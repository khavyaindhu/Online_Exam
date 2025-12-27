import { useState } from 'react';

export default function Register({ onRegisterSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    setTimeout(() => {
      // Validation
      if (!formData.userId.trim() || !formData.password.trim() || 
          !formData.name.trim() || !formData.confirmPassword.trim()) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      const storedUsers = localStorage.getItem('examUsers');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const userExists = users.find(u => u.userId === formData.userId);
      if (userExists) {
        setError('User ID already exists. Please choose a different ID');
        setIsLoading(false);
        return;
      }

      const newUser = {
        userId: formData.userId,
        password: formData.password,
        name: formData.name,
        role: formData.role
      };

      users.push(newUser);
      localStorage.setItem('examUsers', JSON.stringify(users));

      setSuccess('Registration successful! Redirecting to login...');
      setIsLoading(false);
      
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  const getRoleEmoji = (role) => {
    switch(role) {
      case 'admin': return '👤';
      case 'teacher': return '👨‍🏫';
      case 'student': return '👨‍🎓';
      default: return '👤';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        top: '-150px',
        right: '-150px',
        animation: 'float 7s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        bottom: '-80px',
        left: '-80px',
        animation: 'float 9s ease-in-out infinite'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .input-field {
          transition: all 0.3s ease;
        }
        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .register-btn {
          transition: all 0.3s ease;
        }
        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .register-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .back-btn {
          transition: all 0.3s ease;
        }
        .back-btn:hover {
          transform: translateX(-3px);
          border-color: #667eea;
        }
      `}</style>

      <div style={{
        backgroundColor: 'rgba(26, 32, 44, 0.95)',
        padding: '45px 40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1,
        animation: 'scaleIn 0.5s ease-out',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '35px',
          animation: 'slideIn 0.7s ease-out'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            margin: '0 auto 18px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
          }}>
            ✨
          </div>
          <h2 style={{ 
            margin: '0',
            color: '#fff',
            fontSize: '26px',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Create Account
          </h2>
          <p style={{ 
            color: '#a0aec0',
            fontSize: '14px',
            marginTop: '6px'
          }}>
            Join us and start your journey
          </p>
        </div>
        
        <div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter your full name"
              className="input-field"
              style={{
                width: '100%',
                padding: '13px 16px',
                border: '2px solid #4a5568',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                backgroundColor: '#2d3748',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Create a unique ID (e.g., STU002)"
              className="input-field"
              style={{
                width: '100%',
                padding: '13px 16px',
                border: '2px solid #4a5568',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                backgroundColor: '#2d3748',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {getRoleEmoji(formData.role)} Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
              style={{
                width: '100%',
                padding: '13px 16px',
                border: '2px solid #4a5568',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                backgroundColor: '#2d3748',
                color: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="student">👨‍🎓 Student</option>
              <option value="teacher">👨‍🏫 Teacher</option>
              <option value="admin">👤 Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Create a strong password"
              className="input-field"
              style={{
                width: '100%',
                padding: '13px 16px',
                border: '2px solid #4a5568',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                backgroundColor: '#2d3748',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Re-enter your password"
              className="input-field"
              style={{
                width: '100%',
                padding: '13px 16px',
                border: '2px solid #4a5568',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                backgroundColor: '#2d3748',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(254, 178, 178, 0.15)',
              color: '#fc8181',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '18px',
              fontSize: '14px',
              border: '1px solid rgba(254, 178, 178, 0.3)',
              animation: 'slideIn 0.3s ease-out'
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
              marginBottom: '18px',
              fontSize: '14px',
              border: '1px solid rgba(154, 230, 180, 0.3)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              ✅ {success}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={isLoading || success}
            className="register-btn"
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading || success
                ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: isLoading || success ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              marginBottom: '12px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              opacity: isLoading || success ? 0.7 : 1
            }}
          >
            {isLoading ? '⏳ Creating Account...' : success ? '✓ Success!' : '🎉 Register'}
          </button>

          <button
            onClick={onBackToLogin}
            className="back-btn"
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: 'transparent',
              color: '#a0aec0',
              border: '2px solid #4a5568',
              borderRadius: '12px',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}