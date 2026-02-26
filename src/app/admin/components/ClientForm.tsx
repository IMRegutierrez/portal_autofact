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
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[28px] border border-[#f1f2f5] font-sans">

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
                                className={`appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message as string}</p>}
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                        <div className="mt-1">
                            <input
                                {...register("clientName", { required: "El nombre es requerido" })}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Email de Soporte</label>
                        <div className="mt-1">
                            <input
                                {...register("supportEmail")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                        <div className="mt-1">
                            <input
                                {...register("whatsappNumber")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6 flex items-center">
                        <input
                            id="isActive"
                            type="checkbox"
                            {...register("isActive")}
                            className="h-5 w-5 text-[#635Bff] focus:ring-[#635Bff] border-[#e5e7eb] rounded"
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
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Sender ID (Email Autor)</label>
                        <div className="mt-1">
                            <input
                                {...register("senderId")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Suitelet URL (Principal)</label>
                        <div className="mt-1">
                            <input
                                {...register("suiteletUrl", { required: "La URL del Suitelet es requerida" })}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Report Suitelet URL</label>
                        <div className="mt-1">
                            <input
                                {...register("reportSuiteletUrl")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Search ID</label>
                        <div className="mt-1">
                            <input
                                {...register("searchId")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                        <label className="block text-sm font-medium text-gray-700">Logo (URL o Archivo)</label>
                        <div className="mt-1 flex flex-col space-y-2">
                            <input
                                {...register("logoUrl")}
                                placeholder="https://..."
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                            <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-2">O subir:</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploadingLogo}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setIsUploadingLogo(true);
                                        try {
                                            const { uploadLogo } = await import('@/lib/admin-actions');
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            const res = await uploadLogo(formData);
                                            if (res.error) {
                                                alert(res.error);
                                            } else if (res.url) {
                                                setValue("logoUrl", res.url, { shouldDirty: true });
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            alert("Ocurrió un error al subir el logo.");
                                        } finally {
                                            setIsUploadingLogo(false);
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-1.5 file:px-3
                                      file:rounded-md file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-indigo-50 file:text-indigo-700
                                      hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50"
                                />
                                {isUploadingLogo && <span className="text-xs text-indigo-600 animate-pulse">Subiendo...</span>}
                            </div>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Logo CSS Height (ej: h-44)</label>
                        <div className="mt-1">
                            <input
                                {...register("logoHeight")}
                                placeholder="h-12, h-44..."
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="h-[50px] w-[50px] rounded-[14px] border border-[#e5e7eb] p-1 cursor-pointer bg-white"
                            />
                            <input
                                type="text"
                                {...register("backgroundColor")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="h-[50px] w-[50px] rounded-[14px] border border-[#e5e7eb] p-1 cursor-pointer bg-white"
                            />
                            <input
                                type="text"
                                {...register("cardBackgroundColor")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="h-[50px] w-[50px] rounded-[14px] border border-[#e5e7eb] p-1 cursor-pointer bg-white"
                            />
                            <input
                                type="text"
                                {...register("buttonColor")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="h-[50px] w-[50px] rounded-[14px] border border-[#e5e7eb] p-1 cursor-pointer bg-white"
                            />
                            <input
                                type="text"
                                {...register("primaryTextColor")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="h-[50px] w-[50px] rounded-[14px] border border-[#e5e7eb] p-1 cursor-pointer bg-white"
                            />
                            <input
                                type="text"
                                {...register("secondaryTextColor")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="h-[50px] w-[50px] rounded-[14px] border border-[#e5e7eb] p-1 cursor-pointer bg-white"
                            />
                            <input
                                type="text"
                                {...register("buttonTextColor")}
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
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
                                className="appearance-none block w-full px-4 py-[14px] border border-[#e5e7eb] rounded-full placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#635Bff] focus:border-[#635Bff] text-[15px] text-[#1a1f36] bg-white transition-colors"
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-6 flex items-center">
                        <input
                            id="showTotalAmount"
                            type="checkbox"
                            {...register("searchFieldsConfig.showTotalAmount")}
                            className="h-5 w-5 text-[#635Bff] focus:ring-[#635Bff] border-[#e5e7eb] rounded"
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
                            className="inline-flex justify-center py-[14px] px-6 border border-transparent rounded-full shadow-sm text-[15px] font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Eliminar Cliente
                        </button>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-white py-[14px] px-6 border border-[#e5e7eb] rounded-full shadow-sm text-[15px] font-medium text-[#1a1f36] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#635Bff] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isUploadingLogo}
                        className="inline-flex justify-center py-[14px] px-6 border border-transparent rounded-full shadow-sm text-[15px] font-medium text-white bg-[#635Bff] hover:bg-[#524ae6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#635Bff] disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                    </button>
                </div>
            </div>
        </form>
    );
}
