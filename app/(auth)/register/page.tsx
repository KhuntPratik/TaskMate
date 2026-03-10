'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../auth.module.css';

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await register(username, email, password);
        setLoading(false);
        if (success) {
            router.push('/login');
        }
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
                        <label className={styles.label}>Username</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="JohnDoe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
