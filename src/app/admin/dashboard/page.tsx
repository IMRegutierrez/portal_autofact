import { getClients } from '@/lib/admin-actions';
import Link from 'next/link';

export default async function DashboardPage() {
    let clients: any[] = [];
    let error = null;

    try {
        clients = await getClients();
    } catch (e: any) {
        console.error("Dashboard Error:", e);
        error = e.message || "Error desconocido";
    }

    if (error) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-white p-8 shadow-sm border border-red-50 max-w-md w-full">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-lg font-bold text-gray-900">Error al cargar el panel</h1>
                    <p className="mb-6 text-sm text-gray-500">{error}</p>
                    <Link
                        href="/admin/login"
                        className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                        Volver a Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    const activeClients = clients.filter(c => c.isActive).length;

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Resumen general del sistema</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Total Clients Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Clientes</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{clients.length}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Active Clients Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{activeClients}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clients Table Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100/50">
                    <h4 className="text-lg font-bold text-gray-900">
                        Lista de Clientes
                    </h4>
                    <Link
                        href="/admin/client/new"
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Cliente
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    ID / Slug
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 whitespace-nowrap text-center text-sm text-gray-500">
                                        No hay clientes registrados aún.
                                    </td>
                                </tr>
                            )}
                            {clients.map((client: any) => (
                                <tr key={client.clientId} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                                            {client.clientId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${client.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                            {client.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/client/${client.clientId}`} className="text-gray-400 hover:text-indigo-600 transition-colors font-medium">
                                            Editar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
