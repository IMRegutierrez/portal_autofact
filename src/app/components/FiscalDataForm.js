import { useState, useEffect } from 'react';

export default function FiscalDataForm({ invoiceNumberForContext, initialData, onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        razonSocial: '',
        rfc: '',
        emailCfdi: '',
        domicilioFiscal: '',
        codigoPostalFiscal: '',
        regimenFiscal: '',
        usoCfdi: '',
    });

    useEffect(() => {
        // Prellenar el formulario cuando initialData cambie (ej. al seleccionar nueva factura o cargar datos guardados)
        setFormData({
            razonSocial: initialData.razonSocial || '',
            rfc: initialData.rfc || '',
            emailCfdi: initialData.emailCfdi || '',
            domicilioFiscal: initialData.domicilioFiscal || '',
            codigoPostalFiscal: initialData.codigoPostalFiscal || '',
            regimenFiscal: initialData.regimenFiscal || '',
            usoCfdi: initialData.usoCfdi || '',
        });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'rfc' ? value.toUpperCase() : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validaciones básicas
        if (!formData.regimenFiscal || !formData.usoCfdi || !formData.razonSocial || !formData.rfc || !formData.domicilioFiscal || !formData.codigoPostalFiscal) {
            alert("Por favor, completa todos los campos fiscales requeridos."); // Mejorar con modal
            return;
        }
        onSubmit(formData);
    };
    
    const inputStyle = "input-style w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors";


    return (
        <div className="mt-8 p-6 bg-slate-700/70 rounded-lg shadow-inner animate-fadeIn">
             <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <h3 className="text-xl font-semibold text-sky-300 mb-1 border-b border-slate-600 pb-3">
                Datos Fiscales para CFDI
            </h3>
            <p className="text-sm text-slate-400 mt-3 mb-1">Factura: <span className="font-semibold text-sky-400">{invoiceNumberForContext}</span></p>
            <p className="text-sm text-slate-400 mb-5">Ingresa tus datos fiscales. Puedes editar la información si es necesario.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="razonSocial" className="block text-sm font-medium text-slate-300 mb-1">Razón Social</label>
                    <input type="text" id="razonSocial" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required className={inputStyle} placeholder="Nombre completo o denominación social" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="rfc" className="block text-sm font-medium text-slate-300 mb-1">RFC</label>
                    <input type="text" id="rfc" name="rfc" value={formData.rfc} onChange={handleChange} required pattern="[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]" title="Introduce un RFC válido" className={`${inputStyle} uppercase`} placeholder="Ej: XAXX010101000" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="emailCfdi" className="block text-sm font-medium text-slate-300 mb-1">Email para envío de CFDI</label>
                    <input type="email" id="emailCfdi" name="emailCfdi" value={formData.emailCfdi} onChange={handleChange} className={inputStyle} placeholder="correo@ejemplo.com (opcional)" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="domicilioFiscal" className="block text-sm font-medium text-slate-300 mb-1">Domicilio Fiscal Receptor (Calle, Número, Colonia)</label>
                    <input type="text" id="domicilioFiscal" name="domicilioFiscal" value={formData.domicilioFiscal} onChange={handleChange} required className={inputStyle} placeholder="Ej: Av. Reforma 222, Col. Juárez" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="codigoPostalFiscal" className="block text-sm font-medium text-slate-300 mb-1">Código Postal (Receptor)</label>
                    <input type="text" id="codigoPostalFiscal" name="codigoPostalFiscal" value={formData.codigoPostalFiscal} onChange={handleChange} required pattern="[0-9]{5}" title="Introduce un código postal de 5 dígitos" className={inputStyle} placeholder="Ej: 06600" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="regimenFiscal" className="block text-sm font-medium text-slate-300 mb-1">Régimen Fiscal Receptor</label>
                    <select id="regimenFiscal" name="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange} required className={inputStyle} disabled={isLoading}>
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
                    <label htmlFor="usoCfdi" className="block text-sm font-medium text-slate-300 mb-1">Uso de CFDI</label>
                    <select id="usoCfdi" name="usoCfdi" value={formData.usoCfdi} onChange={handleChange} required className={inputStyle} disabled={isLoading}>
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
                    id="saveAndGenerateCfdiButton"
                    disabled={isLoading}
                    className={`w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 ${isLoading ? 'bg-slate-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                >
                    <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                         {!isLoading && <path d="M3.5 2.75A.75.75 0 0 0 2.75 3.5v13A.75.75 0 0 0 3.5 17.25h13a.75.75 0 0 0 .75-.75V7.164A.75.75 0 0 0 16.5 6.5V3.5A.75.75 0 0 0 15.75 2.75h-12.25ZM10 6a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 10 6Z" />}
                         {isLoading && <path d="M12 2v2m0 16v2m8.07-2.07l-1.41-1.41M5.34 18.66l-1.41-1.41m14.14 0l-1.41 1.41M3.93 5.34l1.41 1.41m0 9.9M18.66 5.34l1.41-1.41"></path>}
                    </svg>
                    <span>{isLoading ? 'Procesando...' : 'Generar CFDI'}</span>
                </button>
            </form>
        </div>
    );
}
