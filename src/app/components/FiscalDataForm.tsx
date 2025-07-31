import { useState, useEffect } from 'react';

// Interfaces para los tipos de datos
interface FiscalData {
    razonSocial: string;
    rfc: string;
    emailCfdi: string;
    domicilioFiscal: string;
    codigoPostalFiscal: string;
    regimenFiscal: string;
    usoCfdi: string;
}
interface Theme {
    textPrimary: string;
    textSecondary: string;
    button: string;
    buttonText: string;
}
interface FiscalDataFormProps {
    invoiceNumberForContext: string;
    initialData: Partial<FiscalData>;
    onSubmit: (data: FiscalData) => void;
    isLoading: boolean;
    theme: Theme;
}

export default function FiscalDataForm({ invoiceNumberForContext, initialData, onSubmit, isLoading, theme }: FiscalDataFormProps) {
    const [formData, setFormData] = useState<FiscalData>({
        razonSocial: '',
        rfc: '',
        emailCfdi: '',
        domicilioFiscal: '',
        codigoPostalFiscal: '',
        regimenFiscal: '',
        usoCfdi: '',
    });

    useEffect(() => {
        setFormData(prev => ({ ...prev, ...initialData }));
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'rfc' ? value.toUpperCase() : value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
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
                    <input type="text" id="rfc" name="rfc" value={formData.rfc} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg uppercase" placeholder="Ej: XAXX010101000" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="emailCfdi" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Email para envío de CFDI</label>
                    <input type="email" id="emailCfdi" name="emailCfdi" value={formData.emailCfdi} onChange={handleChange} style={inputStyle} className="w-full px-4 py-3 rounded-lg" placeholder="correo@ejemplo.com (opcional)" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="domicilioFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Domicilio Fiscal Receptor</label>
                    <input type="text" id="domicilioFiscal" name="domicilioFiscal" value={formData.domicilioFiscal} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg" placeholder="Calle, Número, Colonia" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="codigoPostalFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Código Postal (Receptor)</label>
                    <input type="text" id="codigoPostalFiscal" name="codigoPostalFiscal" value={formData.codigoPostalFiscal} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg" placeholder="Ej: 06600" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="regimenFiscal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Régimen Fiscal Receptor</label>
                    <select id="regimenFiscal" name="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg" disabled={isLoading}>
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
                </div>
                <div>
                    <label htmlFor="usoCfdi" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>Uso de CFDI</label>
                    <select id="usoCfdi" name="usoCfdi" value={formData.usoCfdi} onChange={handleChange} required style={inputStyle} className="w-full px-4 py-3 rounded-lg" disabled={isLoading}>
                        <option value="">Seleccione un uso...</option>
                        <option value="S01">Sin efectos fiscales</option>
                        <option value="G01">Adquisición de mercancías</option>
                        <option value="G03">Gastos en general</option>
                        <option value="I01">Construcciones</option>
                        <option value="I08">Otra maquinaria y equipo</option>
                        <option value="P01">Por definir</option>
                    </select>
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
        </div>
    );
}
