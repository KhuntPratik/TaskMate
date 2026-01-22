'use client';
import { useState } from 'react';
import styles from './settings.module.css';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function SettingsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState({
        name: 'Pratik Khunt',
        email: 'pratik@example.com',
        role: 'Product Designer'
    });

    const [preferences, setPreferences] = useState({
        notifications: true,
        compactView: false,
        publicProfile: true
    });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const togglePreference = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <ProtectedRoute>
        <div className={styles.container}>
            {/* Sidebar REMOVED - handeled by Layout */}

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Settings</h1>
                </header>

                {/* Profile Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>Profile</div>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatarPlaceholder}>PK</div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                name="name"
                                type="text"
                                className={styles.input}
                                value={profile.name}
                                onChange={handleProfileChange}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            name="email"
                            type="email"
                            className={styles.input}
                            value={profile.email}
                            onChange={handleProfileChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Role</label>
                        <input
                            name="role"
                            type="text"
                            className={styles.input}
                            value={profile.role}
                            onChange={handleProfileChange}
                        />
                    </div>
                </section>

                {/* Preferences Section */}
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>Preferences</div>

                    <div className={styles.toggleRow}>
                        <span className={styles.toggleLabel}>Email Notifications</span>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={preferences.notifications}
                                onChange={() => togglePreference('notifications')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    <div className={styles.toggleRow}>
                        <span className={styles.toggleLabel}>Compact View</span>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={preferences.compactView}
                                onChange={() => togglePreference('compactView')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    <div className={styles.toggleRow}>
                        <span className={styles.toggleLabel}>Make Profile Public</span>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={preferences.publicProfile}
                                onChange={() => togglePreference('publicProfile')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </section>

                <button className={styles.saveBtn}>Save Changes</button>
            </main>
        </div>
        </ProtectedRoute>
    );
}
