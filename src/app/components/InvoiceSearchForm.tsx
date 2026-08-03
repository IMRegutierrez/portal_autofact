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

    const inputClass = "w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow";
    const ringStyle = { ['--tw-ring-color' as any]: theme.button };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label htmlFor="invoiceOrCustomerId" className="block text-sm font-medium mb-1.5 text-gray-700">
                    {primaryLabel}
                </label>
                <input
                    type="text"
                    id="invoiceOrCustomerId"
                    {...register("invoiceOrCustomerId")}
                    style={ringStyle}
                    className={inputClass}
                    placeholder={`Ej: ${primaryLabel.includes('Ticket') ? 'T-12345' : 'INV-00123'}`}
                    disabled={isLoading}
                />
                {errors.invoiceOrCustomerId && <p className="text-red-500 text-sm mt-1">{errors.invoiceOrCustomerId.message}</p>}
            </div>

            {showTotal && (
                <div>
                    <label htmlFor="invoiceTotal" className="block text-sm font-medium mb-1.5 text-gray-700">
                        Total de la Factura
                    </label>
                    <input
                        type="text"
                        id="invoiceTotal"
                        {...register("invoiceTotal")}
                        style={ringStyle}
                        className={inputClass}
                        placeholder="Ej: 1250.75"
                        disabled={isLoading}
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: isLoading ? '#94a3b8' : theme.button, color: theme.buttonText }}
                className="w-full font-semibold py-3 px-4 rounded-lg shadow-sm transition-all duration-300 hover:opacity-90 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
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
