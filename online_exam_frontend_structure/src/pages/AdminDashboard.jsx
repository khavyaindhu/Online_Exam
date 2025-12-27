import { useState, useEffect } from 'react';

export default function AdminDashboard({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0
  });
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = localStorage.getItem('examUsers');
    const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
    setUsers(allUsers);

    // Calculate stats
    setStats({
      totalUsers: allUsers.length,
      students: allUsers.filter(u => u.role === 'student').length,
      teachers: allUsers.filter(u => u.role === 'teacher').length,
      admins: allUsers.filter(u => u.role === 'admin').length
    });
  };

  const deleteUser = (userId) => {
    if (window.confirm(`Are you sure you want to delete user ${userId}?`)) {
      const updatedUsers = users.filter(u => u.userId !== userId);
      localStorage.setItem('examUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      loadUsers();
    }
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div style={{
      backgroundColor: 'rgba(26, 32, 44, 0.6)',
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid #4a5568',
      flex: '1',
      minWidth: '200px'
    }}>
      <div style={{
        fontSize: '36px',
        marginBottom: '12px'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: '700',
        color: color,
        marginBottom: '8px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#a0aec0'
      }}>
        {label}
      </div>
    </div>
  );

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
            👤 Admin Dashboard
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
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'users', label: '👥 Users', icon: '👥' },
          { id: 'exams', label: '📝 Exams', icon: '📝' }
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
              System Statistics
            </h2>
            <div style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '32px'
            }}>
              <StatCard 
                icon="👥" 
                label="Total Users" 
                value={stats.totalUsers}
                color="#667eea"
              />
              <StatCard 
                icon="👨‍🎓" 
                label="Students" 
                value={stats.students}
                color="#48bb78"
              />
              <StatCard 
                icon="👨‍🏫" 
                label="Teachers" 
                value={stats.teachers}
                color="#ed8936"
              />
              <StatCard 
                icon="👤" 
                label="Admins" 
                value={stats.admins}
                color="#9f7aea"
              />
            </div>

            <div style={{
              backgroundColor: 'rgba(26, 32, 44, 0.6)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #4a5568'
            }}>
              <h3 style={{
                color: '#fff',
                fontSize: '18px',
                marginBottom: '16px'
              }}>
                📋 Quick Actions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <button
                  onClick={() => setSelectedTab('users')}
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
                  👥 Manage Users
                </button>
                <button
                  onClick={() => setSelectedTab('exams')}
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  📝 View Exams
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'users' && (
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
                User Management
              </h2>
            </div>

            <div style={{
              backgroundColor: 'rgba(26, 32, 44, 0.6)',
              borderRadius: '16px',
              border: '1px solid #4a5568',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'rgba(45, 55, 72, 0.8)',
                    borderBottom: '1px solid #4a5568'
                  }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#e2e8f0', fontWeight: '600' }}>User ID</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#e2e8f0', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#e2e8f0', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#e2e8f0', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.userId} style={{
                      borderBottom: index < users.length - 1 ? '1px solid #4a5568' : 'none'
                    }}>
                      <td style={{ padding: '16px', color: '#cbd5e0' }}>{user.userId}</td>
                      <td style={{ padding: '16px', color: '#cbd5e0' }}>{user.name}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: 
                            user.role === 'admin' ? 'rgba(159, 122, 234, 0.2)' :
                            user.role === 'teacher' ? 'rgba(237, 137, 54, 0.2)' :
                            'rgba(72, 187, 120, 0.2)',
                          color:
                            user.role === 'admin' ? '#9f7aea' :
                            user.role === 'teacher' ? '#ed8936' :
                            '#48bb78'
                        }}>
                          {user.role === 'admin' ? '👤' : user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => deleteUser(user.userId)}
                          style={{
                            padding: '6px 16px',
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'exams' && (
          <div>
            <h2 style={{
              color: '#fff',
              fontSize: '20px',
              marginBottom: '24px'
            }}>
              Exam Management
            </h2>
            <div style={{
              backgroundColor: 'rgba(26, 32, 44, 0.6)',
              padding: '48px',
              borderRadius: '16px',
              border: '1px solid #4a5568',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
              <p style={{ color: '#a0aec0', fontSize: '16px' }}>
                Exam management features coming soon...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}