'use client';

import { useForm } from 'react-hook-form';
import { saveClient, deleteClient } from '@/lib/admin-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClientForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            isActive: true,
            searchFieldsConfig: {
                showTotalAmount: false,
                customFieldLabel: 'Factura'
            }
        }
    });
    const [submitError, setSubmitError] = useState('');

    const onSubmit = async (data: any) => {
        setSubmitError('');
        const result = await saveClient(data);
        if (result.error) {
            setSubmitError(result.error);
        } else {
            router.push('/admin/dashboard');
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
            await deleteClient(initialData.clientId);
            router.push('/admin/dashboard');
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                {/* ID del Cliente (PK) - Solo editable si es nuevo */}
                <div className="sm:col-span-3">
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client ID (Slug)</label>
                    <div className="mt-1">
                        <input
                            {...register("clientId", { required: "El Client ID es requerido" })}
                            readOnly={!!initialData}
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${initialData ? 'bg-gray-100' : ''}`}
                        />
                        {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message as string}</p>}
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                    <div className="mt-1">
                        <input
                            {...register("clientName", { required: "El nombre es requerido" })}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Suitelet URL</label>
                    <div className="mt-1">
                        <input
                            {...register("suiteletUrl", { required: "La URL del Suitelet es requerida" })}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">NetSuite Comp ID</label>
                    <div className="mt-1">
                        <input
                            {...register("netsuiteCompId")}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                    <div className="mt-1">
                        <input
                            {...register("whatsappNumber")}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                    <div className="mt-1">
                        <input
                            {...register("logoUrl")}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                {/* Colores */}
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Background Color</label>
                    <input type="color" {...register("backgroundColor")} className="mt-1 block w-full h-8" />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Card Color</label>
                    <input type="color" {...register("cardBackgroundColor")} className="mt-1 block w-full h-8" />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Button Color</label>
                    <input type="color" {...register("buttonColor")} className="mt-1 block w-full h-8" />
                </div>

                {/* Checkbox Activo */}
                <div className="sm:col-span-6 flex items-center">
                    <input
                        id="isActive"
                        type="checkbox"
                        {...register("isActive")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Portal Activo
                    </label>
                </div>
            </div>

            {submitError && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{submitError}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between">
                <div>
                    {initialData && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Eliminar
                        </button>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </form>
    );
}
