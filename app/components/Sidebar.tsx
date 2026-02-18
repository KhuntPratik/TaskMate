'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';
import { PanelLeftClose, LogOut } from 'lucide-react';

interface SidebarProps {
    onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, logout } = useAuth();

    const handleNavigation = (path: string) => {
        router.push(path);
        if (onClose) onClose();
    };

    const handleLogout = () => {
        logout();
        router.push('/');
        if (onClose) onClose();
    };

    return (
        <aside className={styles.sidebar}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div className={styles.logo} style={{ marginBottom: 0 }}>TaskMate</div>
                <button
                    onClick={onClose}
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

            <nav className={styles.nav} style={{ flex: 1 }}>
                {isAuthenticated ? (
                    <>
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
                            className={`${styles.navItem} ${pathname === '/Calendar' ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/Calendar')}
                        >
                            Calendar
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname.startsWith('/Group') ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/Group')}
                        >
                            Groups
                        </div>
                        <div
                            className={`${styles.navItem} ${pathname === '/Settings' ? styles.navItemActive : ''}`}
                            onClick={() => handleNavigation('/Settings')}
                        >
                            Settings
                        </div>
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

            {isAuthenticated && (
                <div >
                    <div
                        className={styles.navItem}
                        onClick={handleLogout}
                        style={{ color: 'var(--danger)' }}
                    >
                        <LogOut />
                        <span>Logout</span>
                    </div>
                </div>
            )}
        </aside>
    );
}
