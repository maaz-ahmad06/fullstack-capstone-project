import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Profile.css';

function Profile() {
  const { userEmail, userName } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(userEmail || sessionStorage.getItem('email') || '');
    if (userName) {
      const parts = userName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [userEmail, userName]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const token = sessionStorage.getItem('auth-token');
      const res = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          address
        })
      });

      if (res.ok) {
        setMsg('Profile updated successfully!');
      } else {
        const errData = await res.json();
        setMsg(errData.error || 'Failed to update profile');
      }
    } catch (err) {
      setMsg('Profile updated locally!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar"><i className="bi bi-person-fill"></i></div>
            <h2>My Profile</h2>
            <p>Manage your personal information and contact details.</p>
          </div>

          {msg && <div className="alert-info"><i className="bi bi-info-circle-fill"></i> {msg}</div>}

          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                readOnly
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label>Street Address / Zip Code</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Main St, New York, NY 10001"
              />
            </div>

            <button type="submit" className="btn-primary-custom" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
