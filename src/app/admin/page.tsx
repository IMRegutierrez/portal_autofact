'use client';

import { useState, useEffect } from 'react';
import { getClients, saveClient } from './actions';
import Loader from '../../components/Loader'; // Reutilizamos tu loader

export default function AdminPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setIsLoading(true);
        const res = await getClients();
        if (res.success && res.data) {
            setClients(res.data);
        } else {
            alert("Error cargando clientes");
        }
        setIsLoading(false);
    };

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingClient({}); // Objeto vacío para nuevo cliente
        setShowModal(true);
    };

    const  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        
        const formData = new FormData(e.currentTarget);
        
        // Si estamos editando y no subieron logo nuevo, mantenemos el anterior
        if (editingClient?.logoUrl) {
            formData.append('currentLogoUrl', editingClient.logoUrl);
        }

        const res = await saveClient(formData);
        
        if (res.success) {
            alert("Cliente guardado exitosamente");
            setShowModal(false);
            loadClients(); // Recargar lista
        } else {
            alert("Error al guardar: " + res.error);
        }
        setIsSaving(false);
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 text-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Panel de Administración</h1>
                    <button 
                        onClick={handleCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        + Nuevo Cliente
                    </button>
                </div>

                {isLoading ? <Loader /> : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Cliente (Subdominio)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clients.map((client) => (
                                    <tr key={client.clientId}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{client.clientId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{client.clientName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {client.logoUrl && <img src={client.logoUrl} alt="logo" className="h-8" />}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleEdit(client)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* MODAL DE EDICIÓN/CREACIÓN */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                            <h2 className="text-xl font-bold mb-4">{editingClient?.clientId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ID Cliente (URL)</label>
                                        <input name="clientId" defaultValue={editingClient?.clientId} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="ej. cliente-a" readOnly={!!editingClient?.clientId} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre Empresa</label>
                                        <input name="clientName" defaultValue={editingClient?.clientName} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL Suitelet Búsqueda/Timbrado</label>
                                    <input name="suiteletUrl" defaultValue={editingClient?.suiteletUrl} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL Suitelet Reporte</label>
                                    <input name="reportSuiteletUrl" defaultValue={editingClient?.reportSuiteletUrl} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">NetSuite Comp ID</label>
                                    <input name="netsuiteCompId" defaultValue={editingClient?.netsuiteCompId} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-semibold mb-3">Personalización</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fondo App</label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" name="backgroundColor" defaultValue={editingClient?.backgroundColor || '#FFFFFF'} className="h-10 w-10" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fondo Tarjeta</label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" name="cardBackgroundColor" defaultValue={editingClient?.cardBackgroundColor || '#78BE20'} className="h-10 w-10" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Color Botón</label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" name="buttonColor" defaultValue={editingClient?.buttonColor || '#0284C7'} className="h-10 w-10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                                    {editingClient?.logoUrl && <img src={editingClient.logoUrl} className="h-12 mb-2 object-contain" />}
                                    <input type="file" name="logoFile" accept="image/*" className="mt-1 block w-full" />
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800">Cancelar</button>
                                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white font-bold">
                                        {isSaving ? 'Guardando...' : 'Guardar Cliente'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}