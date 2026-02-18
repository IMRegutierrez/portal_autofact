'use client';
import { logout } from '@/lib/admin-actions';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminSession({ timeoutMs = 600000 }: { timeoutMs?: number }) {
    const pathname = usePathname();
    const [timeLeft, setTimeLeft] = useState(timeoutMs);

    // Don't run session logic on login page
    if (pathname === '/admin/login') {
        return null;
    }

    useEffect(() => {
        // If we are on the login page (even if technically auth cookie exists during redirect), do nothing.
        if (pathname === '/admin/login') return;

        let timeoutId: NodeJS.Timeout;

        const performLogout = async () => {
            console.log('Session timed out. Logging out...');
            await logout();
        };

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(performLogout, timeoutMs);
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Initialize
        resetTimer();

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [pathname, timeoutMs]);

    // Don't render button on login page
    if (pathname === '/admin/login') return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <button
                onClick={() => logout()}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Cerrar Sesión
            </button>
        </div>
    );
}
