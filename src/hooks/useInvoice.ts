import { useState } from 'react';
import { InvoiceSearchInputs } from '../lib/schemas';

interface InvoiceData {
    internalId: string;
    invoiceNumber: string;
    customerId: string;
    recordType: string;
    subsidiaryId?: string;
    customerName: string;
    issueDate: string;
    dueDate: string;
    totalAmount: string;
    lineItems: any[];
    isStamped?: boolean;
    xmlUrl?: string;
    pdfUrl?: string;
    razonSocial?: string;
    rfc?: string;
    emailCfdi?: string;
    domicilioFiscal?: string;
    codigoPostalFiscal?: string;
    regimenFiscal?: string;
    usoCfdi?: string;
}

interface UseInvoiceProps {
    suiteletUrl: string;
    clientId: string;
    searchId?: string;
}

export function useInvoice({ suiteletUrl, clientId, searchId }: UseInvoiceProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cfdiLinks, setCfdiLinks] = useState<{ xmlUrl: string | null; pdfUrl: string | null }>({ xmlUrl: null, pdfUrl: null });

    const formatCurrency = (amount: string | number) => {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(value)) return amount;
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(value);
    };

    const searchInvoice = async (data: InvoiceSearchInputs) => {
        setIsLoading(true);
        setInvoiceData(null);
        setError(null);
        setCfdiLinks({ xmlUrl: null, pdfUrl: null });

        const formData = new FormData();
        formData.append('custpage_invoice_id', data.invoiceOrCustomerId);
        formData.append('custpage_action', 'search');
        if (searchId) {
            formData.append('custpage_search_id', searchId);
        }
        if (data.invoiceTotal) {
            formData.append('custpage_invoice_total', data.invoiceTotal);
        }
        formData.append('custpage_client_id', clientId);

        try {
            const response = await fetch(suiteletUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const result = await response.json();

            if (result.invoiceData?.isStamped) {
                setError(result.message || 'Este folio ya ha sido timbrado anteriormente.');
                setCfdiLinks({ xmlUrl: result.invoiceData.xmlUrl, pdfUrl: result.invoiceData.pdfUrl });
            } else if (result.success && result.invoiceData) {
                const formattedData = {
                    ...result.invoiceData,
                    totalAmount: formatCurrency(result.invoiceData.totalAmount)
                };
                setInvoiceData(formattedData);
            } else {
                setError(result.message || 'Folio no encontrado o datos incorrectos.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al buscar la factura.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetInvoice = () => {
        setInvoiceData(null);
        setError(null);
        setCfdiLinks({ xmlUrl: null, pdfUrl: null });
    };

    return {
        isLoading,
        invoiceData,
        error,
        cfdiLinks,
        searchInvoice,
        resetInvoice,
        setError // Expose setter to clear error manually if needed
    };
}
