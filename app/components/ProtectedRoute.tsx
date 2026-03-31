'use client';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // Optionally show a loading spinner here while checking auth
    if (isLoading) {
        return null;
    }
    if (!isAuthenticated) {
        return null; // Or return <Loading />
    }

    return <>{children}</>;
}
