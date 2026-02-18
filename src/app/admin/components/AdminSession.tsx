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

    // Don't render button on login page or any page (logic only)
    return null;
}
