'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';
import { PanelLeftClose, LogOut } from 'lucide-react';
import { useEffect } from 'react';

interface SidebarProps {
    onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, logout, user } = useAuth();
    const isAdmin = user?.roleid === 1;
    const isUser = user?.roleid === 2;

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <aside className={styles.sidebar}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div className={styles.logo} style={{ marginBottom: 0 }}>TaskMate</div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onClose) onClose();
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted-foreground)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <PanelLeftClose size={24} />
                </button>
            </div>

            {isAuthenticated && (
                <div className={styles.logoutSection}>
                    <div
                        className={`${styles.navItem} ${styles.logoutButton}`}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </div>
                </div>
            )}

            <nav className={styles.nav} style={{ flex: 1 }}>
                {isAuthenticated ? (
                    <>
                        {/* Common items for both Admin and User */}
                        <div
                            className={`${styles.navItem} ${pathname === '/Home' || pathname === '/' ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/Home')}
                        >
                            Dashboard
                        </div>

                        <div
                            className={`${styles.navItem} ${pathname.startsWith('/Project') ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/Project')}
                        >
                            Project
                        </div>

                        <div
                            className={`${styles.navItem} ${pathname === '/MyTask' ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/MyTask')}
                        >
                            My Tasks
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname === '/TaskList' ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/TaskList')}
                        >
                            Task List
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname === '/Calendar' ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/Calendar')}
                        >
                            Calendar
                        </div>

                        {/* Admin-only items */}
                        {isAdmin && (
                            <>
                                <div
                                    className={`${styles.navItem} ${pathname === '/Users' ? styles.navItemActive : ''}`}
                                    onClick={() => handleNavigation('/Users')}
                                >
                                    Users
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div
                            className={`${styles.navItem} ${pathname === '/login' ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/login')}
                        >
                            Login
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname === '/register' ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/register')}
                        >
                            Register
                        </div>
                    </>
                )}
            </nav>

        </aside>
    );
}
