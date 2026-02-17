'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../auth.module.css';

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            // login();
            setLoading(false);
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.authCard} glass-panel animate-slide-up`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Start organizing your life with TaskMate</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Message</label>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className={`${styles.submitButton} glass-button`}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account?
                    <Link href="/login" className={styles.link}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
