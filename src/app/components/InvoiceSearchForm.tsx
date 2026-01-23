import { useState } from 'react';

// Se define una interfaz para el objeto de tema
interface Theme {
    textSecondary: string;
    button: string;
    buttonText: string;
    textPrimary: string; // Añadido para los estilos del input
}

// Se define la interfaz para las props del componente, ahora solo con invoiceOrCustomerId
interface InvoiceSearchFormProps {
    onSearch: (searchParams: { invoiceOrCustomerId: string; }) => void;
    isLoading: boolean;
    theme: Theme;
}

export default function InvoiceSearchForm({ onSearch, isLoading, theme }: InvoiceSearchFormProps) {
    const [invoiceOrCustomerId, setInvoiceOrCustomerId] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!invoiceOrCustomerId) {
            alert("Por favor, ingresa el Número de Factura o ID de Cliente.");
            return;
        }
        onSearch({ invoiceOrCustomerId });
    };

    const inputStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        color: theme.textPrimary
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div>
                <label htmlFor="invoiceOrCustomerId" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                    Folio a facturar:
                </label>
                <input 
                    type="text" 
                    id="invoiceOrCustomerId" 
                    value={invoiceOrCustomerId}
                    onChange={(e) => setInvoiceOrCustomerId(e.target.value)}
                    required
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Ej: INV-00123"
                    disabled={isLoading}
                />
            </div>
            {/* El campo "Total de la Factura" ha sido eliminado */}
            <button 
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: isLoading ? '#64748B' : theme.button, color: theme.buttonText }}
                className="w-full font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {!isLoading && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>}
                    {isLoading && <path d="M12 2v2m0 16v2m8.07-2.07l-1.41-1.41M5.34 18.66l-1.41-1.41m14.14 0l-1.41 1.41M3.93 5.34l1.41 1.41m0 9.9M18.66 5.34l1.41-1.41"></path>}
                </svg>
                <span>{isLoading ? 'Buscando...' : 'Buscar folio'}</span>
            </button>
        </form>
    );
}
