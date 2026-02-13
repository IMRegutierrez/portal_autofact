import { useState } from 'react';
import { FiscalDataInputs } from '../lib/schemas';

interface UseFiscalFormProps {
    suiteletUrl: string;
}

export function useFiscalForm({ suiteletUrl }: UseFiscalFormProps) {
    const [isStamping, setIsStamping] = useState(false);
    const [stampError, setStampError] = useState<string | null>(null);
    const [stampSuccess, setStampSuccess] = useState<string | null>(null);
    const [stampedFiles, setStampedFiles] = useState<{ xmlUrl: string | null; pdfUrl: string | null }>({ xmlUrl: null, pdfUrl: null });

    const stampInvoice = async (fiscalData: FiscalDataInputs, invoiceData: any) => {
        setIsStamping(true);
        setStampError(null);
        setStampSuccess(null);
        setStampedFiles({ xmlUrl: null, pdfUrl: null });

        const formData = new FormData();
        formData.append('custpage_action', 'timbrar');
        formData.append('custpage_invoice_id', invoiceData.internalId);
        formData.append('custpage_customer_id', invoiceData.customerId);
        formData.append('recordType', invoiceData.recordType || 'invoice');
        if (invoiceData.subsidiaryId) {
            formData.append('custpage_subsidiary_id', invoiceData.subsidiaryId);
        }

        formData.append('custpage_razon_social', fiscalData.razonSocial);
        formData.append('custpage_rfc', fiscalData.rfc);
        formData.append('custpage_email_cfdi', fiscalData.emailCfdi);
        formData.append('custpage_telefono', fiscalData.telefono || '');
        formData.append('custpage_domicilio_fiscal', fiscalData.domicilioFiscal);
        formData.append('custpage_codigo_postal_fiscal', fiscalData.codigoPostalFiscal);
        formData.append('custpage_regimen_fiscal', fiscalData.regimenFiscal);
        formData.append('custpage_uso_cfdi', fiscalData.usoCfdi);

        if (fiscalData.confirmedFromPortal) {
            formData.append('custpage_portal_confirmation', 'T');
        }

        try {
            const response = await fetch(suiteletUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setStampSuccess(result.message || "Proceso de Timbrado completado.");
                if (result.invoiceData) {
                    setStampedFiles({
                        xmlUrl: result.invoiceData.xmlUrl,
                        pdfUrl: result.invoiceData.pdfUrl
                    });
                }
                return true;
            } else {
                throw new Error(result.message || "Ocurrió un error durante el timbrado.");
            }
        } catch (err: any) {
            setStampError(err.message || 'Error al timbrar la factura.');
            return false;
        } finally {
            setIsStamping(false);
        }
    };

    return {
        isStamping,
        stampError,
        stampSuccess,
        stampedFiles,
        stampInvoice,
        setStampError
    };
}
