'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import AdminSession from './AdminSession';
import { usePathname } from 'next/navigation';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            <AdminSession timeoutMs={600000} /> {/* Session Timeout Logic */}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main>
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
