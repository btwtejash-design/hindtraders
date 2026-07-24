import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'ht@12345') {
      setError(false);
      sessionStorage.setItem('ht_doc_auth', 'true');
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.5rem 2rem',
        border: '1px solid var(--gold)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)',
        textAlign: 'center',
        background: 'linear-gradient(145deg, #141414, #0a0a0a)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid var(--gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <Lock size={30} color="var(--gold)" />
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          color: '#fff',
          fontSize: '1.6rem',
          marginBottom: '0.5rem',
          fontWeight: 700
        }}>
          Restricted Portal
        </h2>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '1.75rem',
          lineHeight: '1.5'
        }}>
          Enter official credentials to access Hind Traders Railway Document Automation System.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
            <label className="form-label" style={{ color: '#e0e0e0', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
              ACCESS PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                style={{
                  paddingRight: '40px',
                  borderColor: error ? '#ef4444' : 'var(--border)',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ef4444',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <AlertCircle size={16} />
              <span>Invalid password. Access denied.</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.8rem',
              fontSize: '0.9rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            <ShieldCheck size={18} />
            Unlock System
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: '#666' }}>
          Hind Traders • Official Railway Vendor & Contractor
        </div>
      </div>
    </div>
  );
}
