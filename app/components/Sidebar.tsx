'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>TaskMate</div>
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
