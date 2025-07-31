import { useState } from 'react';

export default function InvoiceSearchForm({ onSearch, isLoading }) {
    const [invoiceOrCustomerId, setInvoiceOrCustomerId] = useState('');
    const [invoiceTotal, setInvoiceTotal] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!invoiceOrCustomerId || !invoiceTotal) {
            // Podrías llamar a una función para mostrar un modal de error aquí si lo prefieres,
            // o dejar que la página principal lo maneje si onSearch devuelve un error.
            alert("Por favor, completa todos los campos de búsqueda."); // Simple alerta por ahora
            return;
        }
        onSearch({ invoiceOrCustomerId, invoiceTotal });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div>
                <label htmlFor="invoiceOrCustomerId" className="block text-sm font-medium text-slate-800 mb-1">Número de Factura o ID de Cliente</label>
                <input 
                    type="text" 
                    id="invoiceOrCustomerId" 
                    value={invoiceOrCustomerId}
                    onChange={(e) => setInvoiceOrCustomerId(e.target.value)}
                    required
                    className="input-style w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Ej: INV-00123 o CUST-00456"
                    disabled={isLoading}
                />
            </div>
            <div>
                <label htmlFor="invoiceTotal" className="block text-sm font-medium text-slate-800 mb-1">Total de la Factura</label>
                <input 
                    type="text" // Podría ser "number" con step="0.01" pero text da más flexibilidad para el parseo posterior
                    id="invoiceTotal" 
                    value={invoiceTotal}
                    onChange={(e) => setInvoiceTotal(e.target.value)}
                    required
                    className="input-style w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Ej: 1250.75 (sin comas, usar punto decimal)"
                    disabled={isLoading}
                />
            </div>
            <button 
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 ${isLoading ? 'bg-slate-500 cursor-not-allowed' : 'bg-[#133568] hover:bg-[#0f2a54]'}`}
            >
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {!isLoading && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>}
                    {isLoading && <path d="M12 2v2m0 16v2m8.07-2.07l-1.41-1.41M5.34 18.66l-1.41-1.41m14.14 0l-1.41 1.41M3.93 5.34l1.41 1.41m0 9.9M18.66 5.34l1.41-1.41"></path>}
                </svg>
                <span>{isLoading ? 'Buscando...' : 'Buscar Factura'}</span>
            </button>
        </form>
    );
}
