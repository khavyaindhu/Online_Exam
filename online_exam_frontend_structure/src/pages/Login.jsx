import { useState } from 'react';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    setIsLoading(true);

    // Validation
    if (!userId.trim() || !password.trim()) {
      setError('Please enter both User ID and Password');
      setIsLoading(false);
      return;
    }

    // Simulate loading
    setTimeout(() => {
      const storedUsers = localStorage.getItem('examUsers');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const user = users.find(
        u => u.userId === userId && u.password === password
      );

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
          userId: user.userId,
          role: user.role,
          name: user.name
        }));
        onLoginSuccess(user);
      } else {
        setError('Invalid User ID or Password');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
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
      overflow: 'hidden'
    }}>
      {/* Animated background circles */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        top: '-100px',
        left: '-100px',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        bottom: '-50px',
        right: '-50px',
        animation: 'float 8s ease-in-out infinite'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .input-field {
          transition: all 0.3s ease;
        }
        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .login-btn {
          transition: all 0.3s ease;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .demo-card {
          transition: all 0.3s ease;
        }
        .demo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      `}</style>

      <div style={{
        backgroundColor: 'rgba(26, 32, 44, 0.95)',
        padding: '50px 40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.6s ease-out',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo/Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          animation: 'slideIn 0.8s ease-out'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
          }}>
            📝
          </div>
          <h2 style={{ 
            margin: '0',
            color: '#fff',
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Exam Portal
          </h2>
          <p style={{ 
            color: '#a0aec0',
            fontSize: '14px',
            marginTop: '8px'
          }}>
            Welcome back! Please login to continue
          </p>
        </div>
        
        <div>
          <div style={{ marginBottom: '20px' }}>
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
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your ID"
              className="input-field"
              style={{
                width: '100%',
                padding: '14px 16px',
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

          <div style={{ marginBottom: '24px' }}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              className="input-field"
              style={{
                width: '100%',
                padding: '14px 16px',
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
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid rgba(254, 178, 178, 0.3)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="login-btn"
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading 
                ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? '🔄 Logging in...' : '🚀 Login'}
          </button>
        </div>

        <div style={{ 
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #4a5568'
        }}>
          <span style={{ color: '#a0aec0', fontSize: '14px' }}>
            Don't have an account?{' '}
          </span>
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#764ba2'}
            onMouseLeave={(e) => e.target.style.color = '#667eea'}
          >
            Register here →
          </button>
        </div>

        {/* <div className="demo-card" style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: 'rgba(45, 55, 72, 0.6)',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#cbd5e0',
          border: '1px solid #4a5568'
        }}>
          <div style={{ 
            fontWeight: '600',
            marginBottom: '12px',
            color: '#e2e8f0',
            fontSize: '14px'
          }}>
            🎯 Demo Credentials
          </div>
          <div style={{ lineHeight: '1.8' }}>
            <div>👤 <strong>Admin:</strong> ADM001 / admin123</div>
            <div>👨‍🏫 <strong>Teacher:</strong> TCH001 / teacher123</div>
            <div>👨‍🎓 <strong>Student:</strong> STU001 / student123</div>
          </div>
        </div> */}
      </div>
    </div>
  );
}