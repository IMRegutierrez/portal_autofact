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
                <div className="rounded-lg bg-white p-8 shadow-lg border border-red-100 max-w-md w-full">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-gray-900">Error al cargar el panel</h1>
                    <p className="mb-6 text-gray-500">{error}</p>
                    <Link
                        href="/admin/login"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                    Dashboard
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link href="/admin/dashboard" className="font-medium hover:text-indigo-600">Admin</Link>
                        </li>
                        <li className="font-medium text-indigo-600">/ Dashboard</li>
                    </ol>
                </nav>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Total Clients Card */}
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-900/5 hover:ring-indigo-500/20 transition-all">
                    <div className="flex items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Total Clientes</h3>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{clients.length}</p>
                        </div>
                    </div>
                </div>

                {/* Active Clients Card */}
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-900/5 hover:ring-green-500/20 transition-all">
                    <div className="flex items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500">Clientes Activos</h3>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{activeClients}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clients Table Card */}
            <div className="rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-sm sm:px-7.5 xl:pb-1">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-semibold text-gray-900">
                        Lista de Clientes
                    </h4>
                    <Link
                        href="/admin/client/new"
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Cliente
                    </Link>
                </div>

                <div className="flex flex-col">
                    <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                ID / Slug
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-normal text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {clients.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                    No hay clientes registrados.
                                                </td>
                                            </tr>
                                        )}
                                        {clients.map((client: any) => (
                                            <tr key={client.clientId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-indigo-600">
                                                        {client.clientId}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{client.clientName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {client.isActive ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/admin/client/${client.clientId}`} className="text-indigo-600 hover:text-indigo-900 transition-colors">
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
                </div>
            </div>
        </div>
    );
}
