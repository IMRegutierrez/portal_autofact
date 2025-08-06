'use client';
import Head from 'next/head';
import { useState } from 'react';
import InvoiceSearchForm from './components/InvoiceSearchForm';
import InvoiceDetailsDisplay from './components/InvoiceDetailsDisplay';
import FiscalDataForm from './components/FiscalDataForm';
import Modal from './components/Modal';
import Loader from './components/Loader';

// --- Definición de Tipos (Interfaces) ---
interface ClientConfig {
    clientId: string;
    suiteletUrl: string;
    netsuiteCompId: string;
    clientName: string;
    logoUrl?: string;
    backgroundColor?: string;
    cardBackgroundColor?: string;
    primaryTextColor?: string;
    secondaryTextColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    searchId?: string;
}
interface LineItem {
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
}
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
    lineItems: LineItem[];
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
interface FiscalData {
    razonSocial: string;
    rfc: string;
    emailCfdi: string;
    domicilioFiscal: string;
    codigoPostalFiscal: string;
    regimenFiscal: string;
    usoCfdi: string;
}

// --- Componente Principal del Cliente ---
export default function PortalClientComponent({ config }: { config: ClientConfig }) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceData | null>(null);
    const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
    const [showFiscalForm, setShowFiscalForm] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [cfdiLinks, setCfdiLinks] = useState({ xmlUrl: null, pdfUrl: null });
    const [mockSavedFiscalData, setMockSavedFiscalData] = useState<{ [key: string]: any }>({});

    const theme = {
        background: config.backgroundColor || '#FFFFFF',
        cardBackground: config.cardBackgroundColor || '#78BE20',
        textPrimary: config.primaryTextColor || '#1E293B',
        textSecondary: config.secondaryTextColor || '#334155',
        button: config.buttonColor || '#0284C7',
        buttonText: config.buttonTextColor || '#FFFFFF'
    };

    const displayModal = (message: string) => {
        setModalMessage(message);
        setShowModal(true);
    };

    const handleSearchSubmit = async (searchParams: { invoiceOrCustomerId: string }) => {
        setIsLoading(true);
        setCurrentInvoiceData(null);
        setShowInvoiceDetails(false);
        setShowFiscalForm(false);
        setCfdiLinks({ xmlUrl: null, pdfUrl: null });

        const formData = new FormData();
        formData.append('custpage_invoice_id', searchParams.invoiceOrCustomerId);
        formData.append('custpage_action', 'search');
        formData.append('custpage_client_id', config.clientId);
        if (config.searchId) {
            formData.append('custpage_search_id', config.searchId);
        }

        try {
            const response = await fetch(config.suiteletUrl, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const data = await response.json();

            if (data && data.invoiceData && data.invoiceData.isStamped) {
                displayModal(data.message || 'Esta factura ya ha sido timbrada anteriormente.');
                setCfdiLinks({ xmlUrl: data.invoiceData.xmlUrl, pdfUrl: data.invoiceData.pdfUrl });
            } else if (data && data.success && data.invoiceData) {
                setCurrentInvoiceData(data.invoiceData);
                setShowInvoiceDetails(true);
            } else {
                displayModal(data.message || 'Factura no encontrada o datos incorrectos.');
            }
        } catch (error: any) {
            displayModal(`Error al buscar factura: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmInvoiceDetails = () => {
        if (!currentInvoiceData) return;
        setShowFiscalForm(true);
        displayModal("Detalles confirmados. Procede con los datos fiscales.");
    };

    const handleFiscalDataSubmit = async (fiscalDataFromForm: FiscalData) => {
        if (!currentInvoiceData || !currentInvoiceData.internalId) {
            displayModal("Error: No hay una factura activa para procesar.");
            return;
        }
        setIsLoading(true);
        setCfdiLinks({ xmlUrl: null, pdfUrl: null });

        const formData = new FormData();
        formData.append('custpage_action', 'timbrar');
        formData.append('custpage_invoice_id', currentInvoiceData.internalId);
        formData.append('custpage_customer_id', currentInvoiceData.customerId);
        formData.append('recordType', currentInvoiceData.recordType || 'invoice');
        if (currentInvoiceData.subsidiaryId) {
            formData.append('custpage_subsidiary_id', currentInvoiceData.subsidiaryId);
        }
        formData.append('custpage_razon_social', fiscalDataFromForm.razonSocial);
        formData.append('custpage_rfc', fiscalDataFromForm.rfc);
        formData.append('custpage_email_cfdi', fiscalDataFromForm.emailCfdi);
        formData.append('custpage_domicilio_fiscal', fiscalDataFromForm.domicilioFiscal);
        formData.append('custpage_codigo_postal_fiscal', fiscalDataFromForm.codigoPostalFiscal);
        formData.append('custpage_regimen_fiscal', fiscalDataFromForm.regimenFiscal);
        formData.append('custpage_uso_cfdi', fiscalDataFromForm.usoCfdi);

        try {
            const response = await fetch(config.suiteletUrl,{
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error(`Error del servidor de timbrado: ${response.status}`);
            const data = await response.json();
            if (data && data.success) {
                displayModal(data.message || "Proceso de CFDI completado.");
                if (data.invoiceData && (data.invoiceData.xmlUrl || data.invoiceData.pdfUrl)) {
                    setCfdiLinks({ xmlUrl: data.invoiceData.xmlUrl, pdfUrl: data.invoiceData.pdfUrl });
                }
                setShowFiscalForm(false);
                setShowInvoiceDetails(false);
            } else {
                displayModal(data.message || "Ocurrió un error durante el timbrado.");
            }
        } catch (error: any) {
            displayModal(`Error al timbrar: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: theme.background, color: theme.textPrimary }} className="min-h-screen flex flex-col items-center justify-center p-4">
            <Head>
                <title>{config.clientName || 'Portal de Autofacturación'}</title>
            </Head>
            <div style={{ backgroundColor: theme.cardBackground }} className="w-full max-w-2xl shadow-2xl rounded-xl p-6 md:p-10">
                <header className="text-center mb-8">
                    {config.logoUrl ? (
                        <img
                            src={config.logoUrl}
                            alt={`Logo de ${config.clientName}`}
                            className="h-64 w-auto mx-auto object-contain"
                        />
                    ) : (
                        <svg style={{ color: theme.textPrimary }} className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    )}
                    <h1 style={{ color: theme.textPrimary }} className="text-3xl font-bold pt-4">{config.clientName || 'Portal de Autofacturación'}</h1>
                    <p style={{ color: theme.textSecondary }} className="mt-2">Consulta facturas y genera tu CFDI.</p>
                </header>

                <InvoiceSearchForm
                    onSearch={handleSearchSubmit}
                    isLoading={isLoading}
                    theme={theme}
                />

                {isLoading && <Loader />}

                {showInvoiceDetails && currentInvoiceData && (
                    <InvoiceDetailsDisplay
                        invoiceData={currentInvoiceData}
                        onConfirmDetails={handleConfirmInvoiceDetails}
                        theme={theme}
                    />
                )}
                {showFiscalForm && currentInvoiceData && (
                    <FiscalDataForm
                        invoiceNumberForContext={currentInvoiceData.invoiceNumber}
                        initialData={mockSavedFiscalData[currentInvoiceData.invoiceNumber] || currentInvoiceData}
                        onSubmit={handleFiscalDataSubmit}
                        isLoading={isLoading}
                        theme={theme}
                    />
                )}
                {(cfdiLinks.xmlUrl || cfdiLinks.pdfUrl) && !isLoading && (
                    <div className="mt-8 p-6 bg-white/50 rounded-lg shadow-inner text-center">
                        <h3 style={{ color: theme.textPrimary }} className="text-xl font-semibold mb-4">CFDI Generado Exitosamente</h3>
                        <p style={{ color: theme.textSecondary }} className="mb-6">Descarga los archivos de tu factura.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {cfdiLinks.xmlUrl && <a href={cfdiLinks.xmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors">Descargar XML</a>}
                            {cfdiLinks.pdfUrl && <a href={cfdiLinks.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">Descargar PDF</a>}
                        </div>
                    </div>
                )}
            </div>
            <Modal isOpen={showModal} message={modalMessage} onClose={() => setShowModal(false)} />
            <footer className="text-center mt-12 pb-6">
                <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} {'IMR Software'} Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
