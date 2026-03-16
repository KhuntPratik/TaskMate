'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './register.module.css';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const success = await register(username, email, password);
    setLoading(false);
    if (success) {
      router.push('/login');
    } else {
      setError('Registration failed. Email or username may already be taken.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>Create account</h1>
          <p className={styles.cardSubtitle}>Start organizing your tasks with TaskMate</p>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Username */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">Username</label>
            <div className={styles.inputWrapper}>
              <User size={16} className={styles.inputIcon} />
              <input
                id="username"
                type="text"
                placeholder="johndoe"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="confirmPassword">Confirm password</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className={`${styles.input} ${confirmPassword && password !== confirmPassword ? styles.inputError : ''}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span className={styles.fieldError}>Passwords do not match</span>
            )}
          </div>

          {/* Password strength hint */}
          {password && (
            <div className={styles.strengthRow}>
              {['Weak', 'Fair', 'Good', 'Strong'].map((label, i) => {
                const strength = password.length >= 12 ? 3 : password.length >= 10 ? 2 : password.length >= 8 ? 1 : 0;
                return (
                  <div
                    key={i}
                    className={`${styles.strengthBar} ${i <= strength ? styles[`strength${strength}`] : ''}`}
                  />
                );
              })}
              <span className={styles.strengthLabel}>
                {password.length >= 12 ? 'Strong' : password.length >= 10 ? 'Good' : password.length >= 8 ? 'Fair' : 'Weak'}
              </span>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <div className={styles.spinner} />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Terms */}
        <p className={styles.terms}>
          By creating an account, you agree to our{' '}
          <Link href="#" className={styles.termsLink}>Terms of Service</Link>
          {' '}and{' '}
          <Link href="#" className={styles.termsLink}>Privacy Policy</Link>.
        </p>

        {/* Footer */}
        <p className={styles.footer}>
          Already have an account?
          <Link href="/login" className={styles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
