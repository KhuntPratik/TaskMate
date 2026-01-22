'use client';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';


export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const isAuthPage = pathname === '/login' || pathname === '/register';

    // Show loading state (optional)
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>
                <div style={{ color: 'white' }}>Loading...</div>
            </div>
        );
    }

    // Always render Layout with Sidebar
    // The Sidebar itself will handle showing Login/Register links if !isAuthenticated
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                {children}
            </main>
        </div>
    );
}
