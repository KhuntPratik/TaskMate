'use client';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>TaskMate</div>
            <nav className={styles.nav}>
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
                    className={`${styles.navItem} ${pathname === '/Calender' ? styles.navItemActive : ''}`}
                    onClick={() => router.push('/Calender')}
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
            </nav>
        </aside>
    );
}
