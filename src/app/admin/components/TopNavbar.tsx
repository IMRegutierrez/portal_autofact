'use client';

import { logout } from '@/lib/admin-actions';

export default function TopNavbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between bg-white px-4 shadow-sm sm:px-6 lg:px-8">
            <div className="flex items-center">
                <button
                    type="button"
                    className="text-slate-500 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                    onClick={onToggleSidebar}
                >
                    <span className="sr-only">Open sidebar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                    <svg className="h-5 w-5 text-slate-400 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </header>
    );
}
