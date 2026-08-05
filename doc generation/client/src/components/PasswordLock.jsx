import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert, ArrowRight } from 'lucide-react';

export default function PasswordLock({ apiBase, onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter the access password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${apiBase}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      if (response.ok) {
        sessionStorage.setItem('doc_access_granted', 'true');
        onSuccess();
      } else {
        const err = await response.json().catch(() => ({}));
        setErrorMsg(err.detail || 'Access Denied: Invalid Password');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 60%, #020617 100%)',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.1)',
        textAlign: 'center'
      }}>
        {/* Lock Icon Badge */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4af37 0%, #9a7b20 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
        }}>
          <Lock size={30} color="#0f172a" />
        </div>

        <h2 style={{
          color: '#f8fafc',
          fontSize: '1.4rem',
          fontWeight: 700,
          margin: '0 0 0.5rem 0',
          letterSpacing: '0.5px'
        }}>
          Documents Portal
        </h2>
        <p style={{
          color: '#94a3b8',
          fontSize: '0.85rem',
          margin: '0 0 2rem 0',
          lineHeight: '1.4'
        }}>
          Restricted System Access. Please enter the authorization password to proceed.
        </p>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              display: 'flex'
            }}>
              <KeyRound size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Password"
              autoFocus
              style={{
                width: '100%',
                padding: '0.8rem 2.8rem 0.8rem 2.5rem',
                background: '#020617',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d4af37'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
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
                color: '#64748b',
                cursor: 'pointer',
                padding: 0,
                display: 'flex'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'transform 0.15s, opacity 0.15s',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Verifying...' : (
              <>
                Unlock Documents <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
          <a
            href="/"
            style={{
              color: '#64748b',
              fontSize: '0.8rem',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#94a3b8'}
            onMouseOut={(e) => e.target.style.color = '#64748b'}
          >
            ← Back to Official Website
          </a>
        </div>
      </div>
    </div>
  );
}
