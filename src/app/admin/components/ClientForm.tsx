'use client';

import { useForm } from 'react-hook-form';
import { saveClient, deleteClient } from '@/lib/admin-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClientForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            isActive: true,
            searchFieldsConfig: {
                primaryFieldLabel: 'Ticket a facturar',
                showTotalAmount: false
            }
        }
    });

    const backgroundColor = watch("backgroundColor");
    const cardBackgroundColor = watch("cardBackgroundColor");
    const buttonColor = watch("buttonColor");
    const primaryTextColor = watch("primaryTextColor");
    const secondaryTextColor = watch("secondaryTextColor");
    const buttonTextColor = watch("buttonTextColor");
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">

            {/* Sección 1: Información General */}
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">Información General</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client ID (Slug)</label>
                        <div className="mt-1">
                            <input
                                {...register("clientId", { required: "El Client ID es requerido" })}
                                readOnly={!!initialData}
                                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900 ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message as string}</p>}
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                        <div className="mt-1">
                            <input
                                {...register("clientName", { required: "El nombre es requerido" })}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Email de Soporte</label>
                        <div className="mt-1">
                            <input
                                {...register("supportEmail")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                        <div className="mt-1">
                            <input
                                {...register("whatsappNumber")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>

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

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Válido Desde</label>
                        <div className="mt-1">
                            <input
                                type="date"
                                {...register("validFrom")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Opcional. El portal no será accesible antes de esta fecha.</p>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Válido Hasta</label>
                        <div className="mt-1">
                            <input
                                type="date"
                                {...register("validTo")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Opcional. El portal se inactivará después de esta fecha.</p>
                    </div>
                </div>
            </div>

            {/* Sección 2: Configuración NetSuite */}
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">Configuración NetSuite</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">NetSuite Comp ID</label>
                        <div className="mt-1">
                            <input
                                {...register("netsuiteCompId")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Sender ID (Email Autor)</label>
                        <div className="mt-1">
                            <input
                                {...register("senderId")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Suitelet URL (Principal)</label>
                        <div className="mt-1">
                            <input
                                {...register("suiteletUrl", { required: "La URL del Suitelet es requerida" })}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Report Suitelet URL</label>
                        <div className="mt-1">
                            <input
                                {...register("reportSuiteletUrl")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Search ID</label>
                        <div className="mt-1">
                            <input
                                {...register("searchId")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección 3: Apariencia */}
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">Apariencia y Branding</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                        <div className="mt-1">
                            <input
                                {...register("logoUrl")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Logo CSS Height (ej: h-44)</label>
                        <div className="mt-1">
                            <input
                                {...register("logoHeight")}
                                placeholder="h-12, h-44..."
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Colores */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Fondo General</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <input
                                type="color"
                                value={backgroundColor || "#ffffff"}
                                onChange={(e) => setValue("backgroundColor", e.target.value, { shouldDirty: true })}
                                className="h-9 w-12 rounded border border-gray-300 p-1"
                            />
                            <input
                                type="text"
                                {...register("backgroundColor")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Fondo Tarjetas</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <input
                                type="color"
                                value={cardBackgroundColor || "#ffffff"}
                                onChange={(e) => setValue("cardBackgroundColor", e.target.value, { shouldDirty: true })}
                                className="h-9 w-12 rounded border border-gray-300 p-1"
                            />
                            <input
                                type="text"
                                {...register("cardBackgroundColor")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Color Botones</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <input
                                type="color"
                                value={buttonColor || "#ffffff"}
                                onChange={(e) => setValue("buttonColor", e.target.value, { shouldDirty: true })}
                                className="h-9 w-12 rounded border border-gray-300 p-1"
                            />
                            <input
                                type="text"
                                {...register("buttonColor")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Texto Primario</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <input
                                type="color"
                                value={primaryTextColor || "#ffffff"}
                                onChange={(e) => setValue("primaryTextColor", e.target.value, { shouldDirty: true })}
                                className="h-9 w-12 rounded border border-gray-300 p-1"
                            />
                            <input
                                type="text"
                                {...register("primaryTextColor")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Texto Secundario</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <input
                                type="color"
                                value={secondaryTextColor || "#ffffff"}
                                onChange={(e) => setValue("secondaryTextColor", e.target.value, { shouldDirty: true })}
                                className="h-9 w-12 rounded border border-gray-300 p-1"
                            />
                            <input
                                type="text"
                                {...register("secondaryTextColor")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Texto Botones</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <input
                                type="color"
                                value={buttonTextColor || "#ffffff"}
                                onChange={(e) => setValue("buttonTextColor", e.target.value, { shouldDirty: true })}
                                className="h-9 w-12 rounded border border-gray-300 p-1"
                            />
                            <input
                                type="text"
                                {...register("buttonTextColor")}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección 4: Configuración de Búsqueda */}
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">Configuración de Búsqueda</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Etiqueta Campo Principal</label>
                        <div className="mt-1">
                            <input
                                {...register("searchFieldsConfig.primaryFieldLabel")}
                                placeholder="Ej: Ticket a facturar"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-6 flex items-center">
                        <input
                            id="showTotalAmount"
                            type="checkbox"
                            {...register("searchFieldsConfig.showTotalAmount")}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showTotalAmount" className="ml-2 block text-sm text-gray-900">
                            Mostrar campo "Monto Total"
                        </label>
                    </div>
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

            <div className="flex justify-between pt-4 border-t border-gray-100">
                <div>
                    {initialData && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Eliminar Cliente
                        </button>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                    </button>
                </div>
            </div>
        </form>
    );
}
