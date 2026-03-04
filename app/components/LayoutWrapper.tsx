'use client';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';


import { useState } from 'react';
import { PanelLeftOpen } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
            {isSidebarOpen && (
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            )}

            {!isSidebarOpen && (
                <div style={{ padding: '1rem', position: 'absolute', zIndex: 50 }}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <PanelLeftOpen size={24} color="var(--muted-foreground)" />
                    </button>
                </div>
            )}

            <main
                style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
            >
                {children}
            </main>
        </div>
    );
}
