import { useState } from 'react';

export default function DataManager() {
  const [showManager, setShowManager] = useState(false);
  const [message, setMessage] = useState('');

  // Export all data to JSON file
  const exportData = () => {
    try {
      const examUsers = localStorage.getItem('examUsers');
      const currentUser = localStorage.getItem('currentUser');
      
      const backupData = {
        examUsers: examUsers ? JSON.parse(examUsers) : [],
        currentUser: currentUser ? JSON.parse(currentUser) : null,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam_backup_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage('✅ Backup downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Export failed: ' + error.message);
    }
  };

  // Import data from JSON file
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        
        if (backupData.examUsers) {
          localStorage.setItem('examUsers', JSON.stringify(backupData.examUsers));
        }
        if (backupData.currentUser) {
          localStorage.setItem('currentUser', JSON.stringify(backupData.currentUser));
        }

        setMessage('✅ Data restored successfully! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        setMessage('❌ Import failed: Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default demo users
  const resetToDefault = () => {
    if (window.confirm('⚠️ This will delete all custom users and reset to demo users. Continue?')) {
      const defaultUsers = [
        { userId: "ADM001", password: "admin123", name: "Admin User", role: "admin" },
        { userId: "TCH001", password: "teacher123", name: "John Teacher", role: "teacher" },
        { userId: "STU001", password: "student123", name: "Jane Student", role: "student" }
      ];
      
      localStorage.setItem('examUsers', JSON.stringify(defaultUsers));
      localStorage.removeItem('currentUser');
      
      setMessage('✅ Reset successful! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('⚠️ This will delete ALL data including users. Continue?')) {
      localStorage.clear();
      setMessage('✅ All data cleared! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div>
      {/* Floating button */}
      <button
        onClick={() => setShowManager(!showManager)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        💾
      </button>

      {/* Manager Panel */}
      {showManager && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '320px',
          backgroundColor: 'rgba(26, 32, 44, 0.98)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          padding: '24px',
          zIndex: 999,
          animation: 'slideUp 0.3s ease-out',
          border: '1px solid #4a5568'
        }}>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid #4a5568'
          }}>
            <h3 style={{ 
              margin: 0,
              color: '#fff',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Data Manager
            </h3>
            <button
              onClick={() => setShowManager(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#a0aec0',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0',
                width: '24px',
                height: '24px'
              }}
            >
              ×
            </button>
          </div>

          {message && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '13px',
              backgroundColor: message.startsWith('✅') 
                ? 'rgba(154, 230, 180, 0.15)' 
                : 'rgba(254, 178, 178, 0.15)',
              color: message.startsWith('✅') ? '#68d391' : '#fc8181',
              border: `1px solid ${message.startsWith('✅') 
                ? 'rgba(154, 230, 180, 0.3)' 
                : 'rgba(254, 178, 178, 0.3)'}`
            }}>
              {message}
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={exportData}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            📥 Export Backup
          </button>

          {/* Import Button */}
          <label style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            marginBottom: '10px',
            backgroundColor: '#2d3748',
            color: '#e2e8f0',
            border: '2px solid #4a5568',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#4a5568';
            e.target.style.transform = 'translateY(0)';
          }}>
            📤 Import Backup
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
          </label>

          {/* Divider */}
          <div style={{
            height: '1px',
            backgroundColor: '#4a5568',
            margin: '15px 0'
          }} />

          {/* Reset Button */}
          <button
            onClick={resetToDefault}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: '#2d3748',
              color: '#e2e8f0',
              border: '2px solid #4a5568',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#ed8936';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#4a5568';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🔄 Reset to Demo
          </button>

          {/* Clear All Button */}
          <button
            onClick={clearAllData}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2d3748',
              color: '#fc8181',
              border: '2px solid #4a5568',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#fc8181';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#4a5568';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🗑️ Clear All Data
          </button>

          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: 'rgba(45, 55, 72, 0.6)',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#a0aec0',
            lineHeight: '1.5'
          }}>
            💡 <strong>Tip:</strong> Export your backup before switching browsers or clearing cache!
          </div>
        </div>
      )}
    </div>
  );
}