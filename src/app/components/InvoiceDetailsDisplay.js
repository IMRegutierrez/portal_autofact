import { useState } from "react";

export default function InvoiceDetailsDisplay({ invoiceData, onConfirmDetails }) {
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        setConfirmed(true);
        onConfirmDetails();
    };

    if (!invoiceData) return null;

    return (
        <div className="mt-8 p-6 bg-slate-700/50 rounded-lg shadow-inner animate-fadeIn"> {/* Simple fade-in */}
            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <h2 className="text-2xl font-semibold text-sky-300 mb-4">Detalles de la Factura</h2>
            <div className="space-y-3 text-slate-200">
                <p><strong>Número de Factura:</strong> <span id="detailInvoiceNumber">{invoiceData.invoiceNumber}</span></p>
                <p><strong>Cliente:</strong> <span id="detailCustomerName">{invoiceData.customerName}</span></p>
                <p><strong>Fecha de Emisión:</strong> <span id="detailIssueDate">{invoiceData.issueDate}</span></p>
                <p><strong>Fecha de Vencimiento:</strong> <span id="detailDueDate">{invoiceData.dueDate}</span></p>
                <p className="text-xl"><strong>Monto Total:</strong> <span id="detailTotalAmount" className="font-bold text-sky-400">${invoiceData.totalAmount}</span></p>
            </div>
            {invoiceData.lineItems && invoiceData.lineItems.length > 0 && (
                <div className="mt-6 border-t border-slate-600 pt-4">
                    <h3 className="text-lg font-medium text-slate-300 mb-2">Conceptos:</h3>
                    <ul id="detailLineItems" className="list-disc list-inside space-y-1 text-sm text-slate-300 pl-2">
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
                    id="confirmInvoiceDetailsButton"
                    onClick={handleConfirm}
                    className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                    <span>Confirmar Detalles de Factura</span> 
                </button>
            )}
        </div>
    );
}
