import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InvoiceSearchSchema, InvoiceSearchInputs } from '../../lib/schemas';

// Se define una interfaz para el objeto de tema
interface Theme {
    textSecondary: string;
    button: string;
    buttonText: string;
    textPrimary: string;
}

// Nueva interfaz para la configuración de búsqueda
interface SearchConfig {
    showTotalAmount?: boolean;
    primaryFieldLabel?: string; // Ej: "Número de Factura" o "Folio de Ticket"
}

// Se define la interfaz para las props del componente
interface InvoiceSearchFormProps {
    onSearch: (data: InvoiceSearchInputs) => void;
    isLoading: boolean;
    theme: Theme;
    searchConfig?: SearchConfig; // Recibimos la configuración aquí
}

export default function InvoiceSearchForm({ onSearch, isLoading, theme, searchConfig }: InvoiceSearchFormProps) {
    const primaryLabel = searchConfig?.primaryFieldLabel || "Número de Factura o ID de Cliente";
    const showTotal = searchConfig?.showTotalAmount ?? false;

    const { register, handleSubmit, formState: { errors } } = useForm<InvoiceSearchInputs>({
        resolver: zodResolver(InvoiceSearchSchema),
    });

    const onSubmit = (data: InvoiceSearchInputs) => {
        onSearch(data);
    };

    const inputStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        color: theme.textPrimary
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
            <div>
                <label htmlFor="invoiceOrCustomerId" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                    {primaryLabel}
                </label>
                <input
                    type="text"
                    id="invoiceOrCustomerId"
                    {...register("invoiceOrCustomerId")}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder={`Ej: ${primaryLabel.includes('Ticket') ? 'T-12345' : 'INV-00123'}`}
                    disabled={isLoading}
                />
                {errors.invoiceOrCustomerId && <p className="text-red-500 text-sm mt-1">{errors.invoiceOrCustomerId.message}</p>}
            </div>

            {/* Renderizado Condicional: Solo mostramos este campo si la configuración lo dice */}
            {/* Nota: Por ahora el esquema InvoiceSearchSchema solo valida invoiceOrCustomerId. 
                Si se requiere validar el total, habría que actualizar el esquema. */}
            {showTotal && (
                <div>
                    <label htmlFor="invoiceTotal" className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                        Total de la Factura
                    </label>
                    <input
                        type="text"
                        id="invoiceTotal"
                        {...register("invoiceTotal")}
                        style={inputStyle}
                        className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                        placeholder="Ej: 1250.75"
                        disabled={isLoading}
                    />
                </div>
            )}

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

