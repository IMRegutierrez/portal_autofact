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
}

export default function InvoiceDetailsDisplay({ invoiceData, onConfirmDetails, theme }: InvoiceDetailsDisplayProps) {
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        setConfirmed(true);
        onConfirmDetails();
    };

    if (!invoiceData) return null;

    return (
        <div className="mt-8 p-6 bg-white/50 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.textPrimary }}>
                Detalles del folio
            </h2>
            <div className="space-y-3" style={{ color: theme.textSecondary }}>
                <p><strong>Número de folio:</strong> <span>{invoiceData.invoiceNumber}</span></p>
                <p><strong>Cliente:</strong> <span>{invoiceData.customerName}</span></p>
                <p><strong>Fecha de emisión:</strong> <span>{invoiceData.issueDate}</span></p>
                <p><strong>Fecha de vencimiento:</strong> <span>{invoiceData.dueDate}</span></p>
                <p className="text-xl"><strong>Monto total:</strong> <span className="font-bold text-sky-800">${invoiceData.totalAmount}</span></p>
            </div>
            {invoiceData.lineItems && invoiceData.lineItems.length > 0 && (
                <div className="mt-6 border-t border-gray-400 pt-4">
                    <h3 className="text-lg font-medium mb-2" style={{ color: theme.textPrimary }}>
                        Conceptos:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm pl-2" style={{ color: theme.textSecondary }}>
                        {invoiceData.lineItems.map((item, index) => (
                            <li key={index}>
                                {item.description} (Cant: {item.quantity}, P.U.: {item.unitPrice}, Total: {item.total})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {!confirmed && (
                 <button 
                    onClick={handleConfirm}
                    style={{ backgroundColor: theme.button, color: theme.buttonText }}
                    className="mt-8 w-full font-semibold py-3 px-4 rounded-lg shadow-md transition-opacity hover:opacity-90"
                >
                    Confirmar Detalles de Factura
                </button>
            )}
        </div>
    );
}
