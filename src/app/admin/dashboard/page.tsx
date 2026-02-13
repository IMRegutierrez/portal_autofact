
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
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el panel</h1>
                <p className="text-gray-700 mb-6 bg-white p-4 rounded shadow border border-red-200">
                    {error}
                </p>
                <div className="space-x-4">
                    <Link href="/admin/login" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
                        Volver a Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                    <Link
                        href="/admin/client/new"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        + Nuevo Cliente
                    </Link>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {clients.length === 0 && (
                            <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">No hay clientes registrados.</li>
                        )}
                        {clients.map((client: any) => (
                            <li key={client.clientId}>
                                <Link href={`/admin/client/${client.clientId}`} className="block hover:bg-gray-50 transition">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{client.clientName}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {client.isActive ? 'Activo' : 'Inactivo'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    ID: {client.clientId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
