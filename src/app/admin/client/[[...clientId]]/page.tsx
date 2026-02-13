
import { getClient } from '@/lib/admin-actions';
import ClientForm from '../../components/ClientForm';

export default async function ClientPage({ params }: { params: Promise<{ clientId?: string[] }> }) {
    const { clientId } = await params;

    // clientId es un array en rutas opcionales catch-all
    const id = clientId?.[0];
    let initialData = null;

    if (id) {
        initialData = await getClient(id);
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {id ? `Editar Cliente: ${initialData?.clientName || id}` : 'Nuevo Cliente'}
                </h1>
                <ClientForm initialData={initialData} />
            </div>
        </div>
    );
}
