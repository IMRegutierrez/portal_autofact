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
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 text-white transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } flex flex-col`}
            >
                {/* Brand Logo */}
                <div className="flex h-16 items-center justify-center bg-slate-900 shadow-md">
                    <Link href="/admin/dashboard" className="text-xl font-bold tracking-wider uppercase text-white hover:text-gray-200">
                        <span className="text-indigo-500">IMR</span> Admin
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="mt-5 flex-1 overflow-y-auto px-2">
                    <div className="space-y-1">
                        <Link
                            href="/admin/dashboard"
                            className={`group flex items-center rounded-md px-2 py-2 text-base font-medium transition-colors ${isActive('/admin/dashboard')
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            <svg className="mr-4 h-6 w-6 flex-shrink-0 text-slate-400 group-hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>

                        <div className="pt-4 pb-2">
                            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Gestión</p>
                        </div>

                        <Link
                            href="/admin/client/new"
                            className={`group flex items-center rounded-md px-2 py-2 text-base font-medium transition-colors ${isActive('/admin/client/new')
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            <svg className="mr-4 h-6 w-6 flex-shrink-0 text-slate-400 group-hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Cliente
                        </Link>

                        {/* Add more links here later */}
                    </div>
                </nav>

                {/* User Info / Footer */}
                <div className="border-t border-slate-700 p-4">
                    <div className="flex items-center">
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">Administrador</p>
                            <p className="text-xs font-medium text-slate-400">Autofactura Portal</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
