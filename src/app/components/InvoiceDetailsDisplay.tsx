import { useState } from "react";

// Interfaces para los tipos de datos
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}
interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: string;
  lineItems: LineItem[];
}
interface Theme {
    textPrimary: string;
    textSecondary: string;
    button: string;
    buttonText: string;
}
interface InvoiceDetailsDisplayProps {
    invoiceData: InvoiceData;
    onConfirmDetails: () => void;
    theme: Theme;
    hideConfirmButton?: boolean; // El wizard controla la navegación
}

export default function InvoiceDetailsDisplay({ invoiceData, onConfirmDetails, theme, hideConfirmButton }: InvoiceDetailsDisplayProps) {
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        setConfirmed(true);
        onConfirmDetails();
    };

    if (!invoiceData) return null;

    const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
        <div className="flex justify-between items-center gap-4 py-1.5">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm text-right ${strong ? 'font-bold text-base' : 'font-medium text-gray-800'}`} style={strong ? { color: theme.button } : undefined}>
                {value}
            </span>
        </div>
    );

    return (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: `${theme.button}1a` }}>
                    <svg className="w-3.5 h-3.5" style={{ color: theme.button }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
                <h2 className="text-lg font-semibold text-gray-800">Folio encontrado</h2>
            </div>

            <div className="divide-y divide-gray-200">
                <Row label="Número de folio" value={invoiceData.invoiceNumber} />
                <Row label="Cliente" value={invoiceData.customerName} />
                <Row label="Fecha de emisión" value={invoiceData.issueDate} />
                <Row label="Fecha de vencimiento" value={invoiceData.dueDate} />
                <Row label="Monto total" value={invoiceData.totalAmount} strong />
            </div>

            {invoiceData.lineItems && invoiceData.lineItems.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Conceptos</h3>
                    <ul className="space-y-1.5">
                        {invoiceData.lineItems.map((item, index) => (
                            <li key={index} className="text-xs text-gray-600 flex justify-between gap-3">
                                <span className="truncate">{item.description}</span>
                                <span className="whitespace-nowrap text-gray-400">Cant: {item.quantity} · {item.total}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!hideConfirmButton && !confirmed && (
                <button
                    onClick={handleConfirm}
                    style={{ backgroundColor: theme.button, color: theme.buttonText }}
                    className="mt-6 w-full font-semibold py-3 px-4 rounded-lg shadow-sm transition-opacity hover:opacity-90"
                >
                    Confirmar detalles del folio
                </button>
            )}
        </div>
    );
}
