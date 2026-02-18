'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#111827] text-gray-300 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } flex flex-col border-r border-gray-800`}
            >
                {/* Brand Logo */}
                <div className="flex h-16 items-center justify-center border-b border-gray-800 bg-[#111827]">
                    <Link href="/admin/dashboard" className="text-lg font-semibold tracking-wide text-white transition-colors hover:text-indigo-400">
                        <span className="text-indigo-500 font-bold">IMR</span> Portal
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="mt-6 flex-1 overflow-y-auto px-4 space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive('/admin/dashboard')
                            ? 'bg-indigo-600/10 text-indigo-400'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <svg className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive('/admin/dashboard') ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Link>

                    <div className="pt-6 pb-3">
                        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Gestión</p>
                    </div>

                    <Link
                        href="/admin/client/new"
                        className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive('/admin/client/new')
                            ? 'bg-indigo-600/10 text-indigo-400'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <svg className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive('/admin/client/new') ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Cliente
                    </Link>

                    {/* Add more links here later */}
                </nav>

                {/* User Info / Footer */}
                <div className="border-t border-gray-800 p-4 bg-[#0f1522]">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Administrador</p>
                            <p className="text-xs text-gray-500">Autofactura Portal</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
