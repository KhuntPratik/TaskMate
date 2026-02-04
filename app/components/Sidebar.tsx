'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';
import { PanelLeftClose } from 'lucide-react';

interface SidebarProps {
    onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div className={styles.logo} style={{ marginBottom: 0 }}>TaskMate</div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <PanelLeftClose size={24} />
                </button>
            </div>
            <nav className={styles.nav}>
                {isAuthenticated ? (
                    <>
                        <div
                            className={`${styles.navItem} ${pathname === '/Home' || pathname === '/' ? styles.navItemActive : ''}`}
                            onClick={() => router.push('/Home')}
                        >
                            Dashboard
                        </div>

                        <div
                            className={`${styles.navItem} ${pathname === '/Project' ? styles.navItemActive : ''}`}
                            onClick={() => router.push('/Project')}
                        >
                            Project
                        </div>

                        <div
                            className={`${styles.navItem} ${pathname === '/MyTask' ? styles.navItemActive : ''}`}
                            onClick={() => router.push('/MyTask')}
                        >
                            My Tasks
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname === '/Calendar' ? styles.navItemActive : ''}`}
                            onClick={() => router.push('/Calendar')}
                        >
                            Calendar
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname.startsWith('/Group') ? styles.navItemActive : ''}`}
                            onClick={() => router.push('/Group')}
                        >
                            Groups
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname === '/Settings' ? styles.navItemActive : ''}`}
                            onClick={() => router.push('/Settings')}
                        >
                            Settings
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            className={`${styles.navItem} ${pathname === '/login' ? styles.navItemActive : ''}`}
                            onClick={() => router.push('/login')}
                        >
                            Login
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname === '/register' ? styles.navItemActive : ''}`}
                            onClick={() => router.push('/register')}
                        >
                            Register
                        </div>
                    </>
                )}
            </nav>
        </aside>
    );
}
