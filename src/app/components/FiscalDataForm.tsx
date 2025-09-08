import { useState, useEffect } from 'react';

// Interfaces para los tipos de datos
interface FiscalData {
    razonSocial: string;
    rfc: string;
    emailCfdi: string;
    telefono?: string; 
    domicilioFiscal: string;
    codigoPostalFiscal: string;
    regimenFiscal: string;
    usoCfdi: string;
    confirmedFromPortal?: boolean;
}
interface Theme {
    textPrimary: string;
    textSecondary: string;
    button: string;
    buttonText: string;
}
// --- NUEVA INTERFAZ PARA LOS CATÁLOGOS ---
interface CatalogOption {
    clave: string;
    descripcion: string;
}
interface FiscalDataFormProps {
    invoiceNumberForContext: string;
    initialData: Partial<FiscalData>;
    onSubmit: (data: FiscalData) => void;
    isLoading: boolean;
    theme: Theme;
    // --- NUEVAS PROPS PARA LOS CATÁLOGOS ---
    regimenesFiscales: CatalogOption[];
    usosCfdi: CatalogOption[];
}

export default function FiscalDataForm({ invoiceNumberForContext, initialData, onSubmit, isLoading, theme, regimenesFiscales, usosCfdi }: FiscalDataFormProps) {
    const [formData, setFormData] = useState<FiscalData>({
        razonSocial: initialData.razonSocial || '',
        rfc: initialData.rfc || '',
        emailCfdi: initialData.emailCfdi || '',
        telefono: initialData.telefono || '',
        domicilioFiscal: initialData.domicilioFiscal || '',
        codigoPostalFiscal: initialData.codigoPostalFiscal || '',
        regimenFiscal: initialData.regimenFiscal || '',
        usoCfdi: initialData.usoCfdi || '',
    });
    // --- NUEVO ESTADO PARA EL ERROR DEL RFC ---
    const [rfcError, setRfcError] = useState<string | null>(null);
    // --- NUEVO ESTADO PARA EL MODAL DE CONFIRMACIÓN ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        setFormData(prev => ({ 
            ...prev, 
            razonSocial: initialData.razonSocial || '',
            rfc: initialData.rfc || '',
            emailCfdi: initialData.emailCfdi || '',
            telefono: initialData.telefono || '',
            domicilioFiscal: initialData.domicilioFiscal || '',
            codigoPostalFiscal: initialData.codigoPostalFiscal || '',
            regimenFiscal: initialData.regimenFiscal || '',
            usoCfdi: initialData.usoCfdi || '',
        }));
    }, [initialData]);

    // --- FUNCIÓN DE VALIDACIÓN DE RFC ---
    const validateRfc = (rfc: string): boolean => {
        if (!rfc) return false;
        // Expresión regular para validar RFC de personas físicas (13 caracteres) y morales (12 caracteres)
        const rfcRegex = /^[A-Z&Ñ]{4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}$|^[A-Z&Ñ]{3}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}$/;
        return rfcRegex.test(rfc);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const upperValue = name === 'rfc' ? value.toUpperCase() : value;
        
        setFormData(prev => ({ ...prev, [name]: upperValue }));

        // --- VALIDACIÓN EN TIEMPO REAL ---
        if (name === 'rfc') {
            if (upperValue.length > 0 && !validateRfc(upperValue)) {
                setRfcError('El formato del RFC no es válido.');
            } else {
                setRfcError(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // --- VALIDACIÓN FINAL ANTES DE ENVIAR ---
        if (!validateRfc(formData.rfc)) {
            setRfcError('El formato del RFC no es válido. Por favor, corrígelo para continuar.');
            return;
        }
        // --- MUESTRA EL MODAL EN LUGAR DE ENVIAR DIRECTAMENTE ---
        setShowConfirmModal(true);
    };

    // --- NUEVA FUNCIÓN PARA EL ENVÍO FINAL ---
    const handleFinalSubmit = () => {
        setShowConfirmModal(false);
        // --- CAMBIO AQUÍ: Se añade la bandera de confirmación al enviar los datos ---
        onSubmit({ ...formData, confirmedFromPortal: true });
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
                Factura: {invoiceNumberForContext}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="razonSocial" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Razón Social</label>
                    <input type="text" id="razonSocial" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg" placeholder="Nombre completo" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="rfc" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>RFC</label>
                    <input type="text" id="rfc" name="rfc" value={formData.rfc} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg uppercase" placeholder="Ej: XAXX010101000" disabled={isLoading} maxLength={13} />
                    {rfcError && <p className="text-red-800 text-xs font-semibold mt-1">{rfcError}</p>}
                </div>
                <div>
                    <label htmlFor="emailCfdi" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Email para envío de CFDI</label>
                    <input type="email" id="emailCfdi" name="emailCfdi" value={formData.emailCfdi} onChange={handleChange} style={inputStyle} className="w-full px-4 py-3 rounded-lg" placeholder="correo@ejemplo.com (opcional)" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="telefono" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Número Telefónico</label>
                    <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} style={inputStyle} className="w-full px-4 py-3 rounded-lg" placeholder="10 dígitos (opcional)" disabled={isLoading} maxLength={10} />
                </div>
                <div>
                    <label htmlFor="domicilioFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Domicilio Fiscal Receptor</label>
                    <input type="text" id="domicilioFiscal" name="domicilioFiscal" value={formData.domicilioFiscal} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg" placeholder="Calle, Número, Colonia" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="codigoPostalFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Código Postal (Receptor)</label>
                    <input type="text" id="codigoPostalFiscal" name="codigoPostalFiscal" value={formData.codigoPostalFiscal} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg" placeholder="Ej: 06600" disabled={isLoading} maxLength={5} />
                </div>
                
                {/* --- CAMBIOS PARA CATÁLOGOS DINÁMICOS Y FIX DE WINDOWS --- */}
                <div>
                    <label htmlFor="regimenFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Régimen Fiscal Receptor</label>
                    <select id="regimenFiscal" name="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg text-black" disabled={isLoading}>
                        <option value="" disabled>Seleccione un régimen...</option>
                        {regimenesFiscales.map(regimen => (
                            <option key={regimen.clave} value={regimen.clave}>{regimen.descripcion}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="usoCfdi" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Uso de CFDI</label>
                    <select id="usoCfdi" name="usoCfdi" value={formData.usoCfdi} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg text-black" disabled={isLoading}>
                        <option value="" disabled>Seleccione un uso...</option>
                        {usosCfdi.map(uso => (
                            <option key={uso.clave} value={uso.clave}>{uso.descripcion}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" disabled={isLoading || !!rfcError} style={{ backgroundColor: isLoading ? '#64748B' : theme.button, color: theme.buttonText }} className={`w-full font-semibold py-3 px-4 rounded-lg shadow-md transition-opacity hover:opacity-90 ${isLoading || rfcError ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

