import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiscalDataSchema, FiscalDataInputs } from '../../lib/schemas';

interface Theme {
    textPrimary: string;
    textSecondary: string;
    button: string;
    buttonText: string;
}

interface FiscalDataFormProps {
    invoiceNumberForContext: string;
    initialData: Partial<FiscalDataInputs>;
    onSubmit: (data: FiscalDataInputs) => void;
    isLoading: boolean;
    theme: Theme;
}

export default function FiscalDataForm({ invoiceNumberForContext, initialData, onSubmit, isLoading, theme }: FiscalDataFormProps) {
    const { register, handleSubmit, formState: { errors, isValid }, trigger, setValue } = useForm<FiscalDataInputs>({
        resolver: zodResolver(FiscalDataSchema),
        defaultValues: {
            ...initialData,
            telefono: initialData.telefono || '',
        },
        mode: 'onChange'
    });

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState<FiscalDataInputs | null>(null);

    useEffect(() => {
        if (initialData) {
            Object.keys(initialData).forEach((key) => {
                setValue(key as any, (initialData as any)[key]);
            });
        }
    }, [initialData, setValue]);

    const onFormSubmit = (data: FiscalDataInputs) => {
        setPendingData(data);
        setShowConfirmModal(true);
    };

    const handleFinalSubmit = () => {
        if (pendingData) {
            onSubmit({ ...pendingData, confirmedFromPortal: true });
            setShowConfirmModal(false);
        }
    };

    const inputStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        color: theme.textPrimary
    };

    return (
        <div className="mt-8 p-6 bg-white/50 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
                Datos Fiscales para CFDI
            </h3>
            <p className="mb-6" style={{ color: theme.textSecondary }}>
                Folio: {invoiceNumberForContext}
            </p>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="razonSocial" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Razón Social</label>
                    <input
                        type="text"
                        id="razonSocial"
                        {...register('razonSocial')}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg"
                        placeholder="Nombre completo"
                        disabled={isLoading}
                    />
                    {errors.razonSocial && <p className="text-red-500 text-xs font-semibold mt-1">{errors.razonSocial.message}</p>}
                </div>
                <div>
                    <label htmlFor="rfc" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>RFC</label>
                    <input
                        type="text"
                        id="rfc"
                        {...register('rfc')}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg uppercase"
                        placeholder="Ej: XAXX010101000"
                        disabled={isLoading}
                        maxLength={13}
                        onChange={(e) => {
                            e.target.value = e.target.value.toUpperCase();
                            register('rfc').onChange(e); // Mantener el evento de react-hook-form
                        }}
                    />
                    {errors.rfc && <p className="text-red-500 text-xs font-semibold mt-1">{errors.rfc.message}</p>}
                </div>
                <div>
                    <label htmlFor="emailCfdi" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Email para envío de CFDI</label>
                    <input
                        type="email"
                        id="emailCfdi"
                        {...register('emailCfdi')}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg"
                        placeholder="correo@ejemplo.com"
                        disabled={isLoading}
                    />
                    {errors.emailCfdi && <p className="text-red-500 text-xs font-semibold mt-1">{errors.emailCfdi.message}</p>}
                </div>
                <div>
                    <label htmlFor="telefono" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Número Telefónico</label>
                    <input
                        type="tel"
                        id="telefono"
                        {...register('telefono')}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg"
                        placeholder="10 dígitos (opcional)"
                        disabled={isLoading}
                        maxLength={10}
                    />
                    {errors.telefono && <p className="text-red-500 text-xs font-semibold mt-1">{errors.telefono.message}</p>}
                </div>
                <div>
                    <label htmlFor="domicilioFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Domicilio Fiscal Receptor</label>
                    <input
                        type="text"
                        id="domicilioFiscal"
                        {...register('domicilioFiscal')}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg"
                        placeholder="Calle, Número, Colonia"
                        disabled={isLoading}
                    />
                    {errors.domicilioFiscal && <p className="text-red-500 text-xs font-semibold mt-1">{errors.domicilioFiscal.message}</p>}
                </div>
                <div>
                    <label htmlFor="codigoPostalFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Código Postal (Receptor)</label>
                    <input
                        type="text"
                        id="codigoPostalFiscal"
                        {...register('codigoPostalFiscal')}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg"
                        placeholder="Ej: 06600"
                        disabled={isLoading}
                    />
                    {errors.codigoPostalFiscal && <p className="text-red-500 text-xs font-semibold mt-1">{errors.codigoPostalFiscal.message}</p>}
                </div>
                <div>
                    <label htmlFor="regimenFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Régimen Fiscal Receptor</label>
                    <select
                        id="regimenFiscal"
                        {...register('regimenFiscal')}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg"
                        disabled={isLoading}
                    >
                        <option value="">Seleccione un régimen...</option>
                        <option value="601">General de Ley Personas Morales</option>
                        <option value="603">Personas Morales con Fines no Lucrativos</option>
                        <option value="605">Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                        <option value="606">Arrendamiento</option>
                        <option value="612">Personas Físicas con Actividades Empresariales y Profesionales</option>
                        <option value="616">Sin obligaciones fiscales</option>
                        <option value="621">Incorporación Fiscal</option>
                        <option value="626">Régimen Simplificado de Confianza</option>
                    </select>
                    {errors.regimenFiscal && <p className="text-red-500 text-xs font-semibold mt-1">{errors.regimenFiscal.message}</p>}
                </div>
                <div>
                    <label htmlFor="usoCfdi" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Uso de CFDI</label>
                    <select
                        id="usoCfdi"
                        {...register('usoCfdi')}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg"
                        disabled={isLoading}
                    >
                        <option value="">Seleccione un uso...</option>
                        <option value="S01">Sin efectos fiscales</option>
                        <option value="G01">Adquisición de mercancías</option>
                        <option value="G03">Gastos en general</option>
                        <option value="I01">Construcciones</option>
                        <option value="I08">Otra maquinaria y equipo</option>
                        <option value="P01">Por definir</option>
                    </select>
                    {errors.usoCfdi && <p className="text-red-500 text-xs font-semibold mt-1">{errors.usoCfdi.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{ backgroundColor: isLoading ? '#64748B' : theme.button, color: theme.buttonText }}
                    className="w-full font-semibold py-3 px-4 rounded-lg shadow-md transition-opacity hover:opacity-90"
                >
                    {isLoading ? 'Procesando...' : 'Generar CFDI'}
                </button>
            </form>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-sm w-full mx-4">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">Confirmar Datos</h4>
                        <p className="text-gray-600 mb-6">¿Estás seguro de que los datos fiscales ingresados son correctos?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

