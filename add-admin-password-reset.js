const fs = require('fs');
const dashboardPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/frontend/src/pages/admin/AdminDashboard.js';
let code = fs.readFileSync(dashboardPath, 'utf8');

// Add change password state and modal
const newModalState = `  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) return toast.error('Please fill in both fields');
    if (passForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');

    setPassLoading(true);
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password updated successfully! Please use your new password next time.');
      setShowPasswordModal(false);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password. Check current password.');
    } finally {
      setPassLoading(false);
    }
  };
`;

code = code.replace(
  '  const [loading, setLoading] = useState(true);',
  '  const [loading, setLoading] = useState(true);\n' + newModalState
);

// Add Change Password button in header
code = code.replace(
  `<h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.75rem', fontFamily: "'Playfair Display', serif" }}>
          Overview Dashboard
        </h1>`,
  `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#F1D592' }}>
            Overview Dashboard
          </h1>
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              background: 'rgba(212,175,55,0.15)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#F1D592',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🔑 Reset / Change Password
          </button>
        </div>`
);

// Add Password Modal JSX before end of component
const modalJSX = `
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }} onClick={() => setShowPasswordModal(false)}>
          <div style={{ background: '#251912', border: '1px solid rgba(168,122,81,0.4)', borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F1D592', marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
              🔑 Reset Admin Password
            </h2>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>Current Password *</label>
                <input
                  type="password"
                  placeholder="Enter current password (e.g. Admin@123)"
                  value={passForm.currentPassword}
                  onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>New Password *</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={passForm.newPassword}
                  onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: 'rgba(251,246,238,0.7)', fontSize: 13, marginBottom: 6 }}>Confirm New Password *</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={passForm.confirmPassword}
                  onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(251,246,238,0.07)', border: '1px solid rgba(251,246,238,0.15)', color: '#FBF6EE', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  disabled={passLoading}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #A87A51, #754B2E)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {passLoading ? 'Updating...' : 'Save New Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{ padding: '12px 20px', background: 'rgba(251,246,238,0.08)', border: '1px solid rgba(251,246,238,0.15)', borderRadius: 10, color: '#FBF6EE', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
`;

code = code.replace('    </div>\n  );\n}', modalJSX);
fs.writeFileSync(dashboardPath, code, 'utf8');
console.log('Added Change Password feature to AdminDashboard.js');
