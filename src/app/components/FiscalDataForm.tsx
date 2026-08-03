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
    onBack?: () => void;
}

export default function FiscalDataForm({ invoiceNumberForContext, initialData, onSubmit, isLoading, theme, onBack }: FiscalDataFormProps) {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FiscalDataInputs>({
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

    const inputClass = "w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow disabled:bg-gray-100";
    const ringStyle = { ['--tw-ring-color' as any]: theme.button };
    const labelClass = "block text-sm font-medium mb-1.5 text-gray-700";
    const errClass = "text-red-500 text-xs font-semibold mt-1";

    return (
        <div className="animate-step-in">
            <p className="mb-5 text-sm text-gray-500">
                Completa la información fiscal para el folio <span className="font-semibold text-gray-700">{invoiceNumberForContext}</span>.
            </p>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label htmlFor="razonSocial" className={labelClass}>Razón Social</label>
                        <input type="text" id="razonSocial" {...register('razonSocial')} style={ringStyle} className={inputClass} placeholder="Nombre completo o razón social" disabled={isLoading} />
                        {errors.razonSocial && <p className={errClass}>{errors.razonSocial.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="rfc" className={labelClass}>RFC</label>
                        <input
                            type="text" id="rfc" {...register('rfc')} style={ringStyle}
                            className={`${inputClass} uppercase`} placeholder="Ej: XAXX010101000" disabled={isLoading} maxLength={13}
                            onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register('rfc').onChange(e); }}
                        />
                        {errors.rfc && <p className={errClass}>{errors.rfc.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="emailCfdi" className={labelClass}>Email para envío de CFDI</label>
                        <input type="email" id="emailCfdi" {...register('emailCfdi')} style={ringStyle} className={inputClass} placeholder="correo@ejemplo.com" disabled={isLoading} />
                        {errors.emailCfdi && <p className={errClass}>{errors.emailCfdi.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="telefono" className={labelClass}>Teléfono <span className="text-gray-400 font-normal">(opcional)</span></label>
                        <input type="tel" id="telefono" {...register('telefono')} style={ringStyle} className={inputClass} placeholder="10 dígitos" disabled={isLoading} maxLength={10} />
                        {errors.telefono && <p className={errClass}>{errors.telefono.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="codigoPostalFiscal" className={labelClass}>Código Postal</label>
                        <input type="text" id="codigoPostalFiscal" {...register('codigoPostalFiscal')} style={ringStyle} className={inputClass} placeholder="Ej: 06600" disabled={isLoading} maxLength={5} />
                        {errors.codigoPostalFiscal && <p className={errClass}>{errors.codigoPostalFiscal.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="domicilioFiscal" className={labelClass}>Domicilio Fiscal Receptor</label>
                        <input type="text" id="domicilioFiscal" {...register('domicilioFiscal')} style={ringStyle} className={inputClass} placeholder="Calle, Número, Colonia" disabled={isLoading} />
                        {errors.domicilioFiscal && <p className={errClass}>{errors.domicilioFiscal.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="regimenFiscal" className={labelClass}>Régimen Fiscal</label>
                        <select id="regimenFiscal" {...register('regimenFiscal')} style={ringStyle} className={inputClass} disabled={isLoading}>
                            <option value="">Seleccione un régimen...</option>
                            <option value="601">601 - General de Ley Personas Morales</option>
                            <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                            <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados</option>
                            <option value="606">606 - Arrendamiento</option>
                            <option value="612">612 - Personas Físicas con Act. Empresariales y Profesionales</option>
                            <option value="616">616 - Sin obligaciones fiscales</option>
                            <option value="621">621 - Incorporación Fiscal</option>
                            <option value="626">626 - Régimen Simplificado de Confianza</option>
                        </select>
                        {errors.regimenFiscal && <p className={errClass}>{errors.regimenFiscal.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="usoCfdi" className={labelClass}>Uso de CFDI</label>
                        <select id="usoCfdi" {...register('usoCfdi')} style={ringStyle} className={inputClass} disabled={isLoading}>
                            <option value="">Seleccione un uso...</option>
                            <option value="S01">S01 - Sin efectos fiscales</option>
                            <option value="G01">G01 - Adquisición de mercancías</option>
                            <option value="G03">G03 - Gastos en general</option>
                            <option value="I01">I01 - Construcciones</option>
                            <option value="I08">I08 - Otra maquinaria y equipo</option>
                            <option value="P01">P01 - Por definir</option>
                        </select>
                        {errors.usoCfdi && <p className={errClass}>{errors.usoCfdi.message}</p>}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4">
                    {onBack ? (
                        <button type="button" onClick={onBack} disabled={isLoading} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Atrás
                        </button>
                    ) : <span />}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ backgroundColor: isLoading ? '#94a3b8' : theme.button, color: theme.buttonText }}
                        className="inline-flex items-center gap-2 font-semibold py-3 px-7 rounded-lg shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Procesando...' : 'Generar CFDI'}
                        {!isLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>}
                    </button>
                </div>
            </form>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm w-full animate-fade-in">
                        <h4 className="text-xl font-bold text-gray-800 mb-3">Confirmar datos</h4>
                        <p className="text-gray-600 mb-6">¿Estás seguro de que los datos fiscales ingresados son correctos?</p>
                        <div className="flex justify-center gap-3">
                            <button type="button" onClick={() => setShowConfirmModal(false)} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors">
                                Cancelar
                            </button>
                            <button type="button" onClick={handleFinalSubmit} style={{ backgroundColor: theme.button, color: theme.buttonText }} className="px-6 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90">
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
