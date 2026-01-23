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
  logoHeight?: string; // Se añade el campo opcional para la altura del logo
  backgroundColor?: string;
  cardBackgroundColor?: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  searchId?: string;
  reportSuiteletUrl?: string;
  isActive?: boolean;
  whatsappNumber?: string; // --- CAMBIO: Nuevo campo para el número de WhatsApp ---
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
    telefono?: string;
    domicilioFiscal: string;
    codigoPostalFiscal: string;
    regimenFiscal: string;
    usoCfdi: string;
    confirmedFromPortal?: boolean;
}

// --- Componente Principal del Cliente ---
export default function PortalClientComponent({ config }: { config: ClientConfig }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceData | null>(null);
    const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
    const [showFiscalForm, setShowFiscalForm] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showReportButton, setShowReportButton] = useState(false);
    const [cfdiLinks, setCfdiLinks] = useState({ xmlUrl: null, pdfUrl: null });
    const [mockSavedFiscalData, setMockSavedFiscalData] = useState<{ [key: string]: any }>({});
    const [collectedFiscalData, setCollectedFiscalData] = useState<FiscalData | null>(null);

    // Se define el tamaño del logo dinámicamente, con un valor por defecto.
    const logoSizeClass = config.logoHeight || 'h-64';

    const theme = {
        background: config.backgroundColor || '#FFFFFF',
        cardBackground: config.cardBackgroundColor || '#78BE20',
        textPrimary: config.primaryTextColor || '#1E293B',
        textSecondary: config.secondaryTextColor || '#334155',
        button: config.buttonColor || '#0284C7',
        buttonText: config.buttonTextColor || '#FFFFFF'
    };

    const displayModal = (message: string, isReportableError: boolean = false) => {
        setModalMessage(message);
        setShowReportButton(isReportableError && !!config.reportSuiteletUrl);
        setShowModal(true);
    };

    const handleSearchSubmit = async (searchParams: { invoiceOrCustomerId: string; }) => {
        setIsLoading(true);
        setCurrentInvoiceData(null);
        setShowInvoiceDetails(false);
        setShowFiscalForm(false);
        setCfdiLinks({ xmlUrl: null, pdfUrl: null });

        const formData = new FormData();
        formData.append('custpage_invoice_id', searchParams.invoiceOrCustomerId);
        formData.append('custpage_action', 'search');
        if (config.searchId) {
            formData.append('custpage_search_id', config.searchId);
        }
        formData.append('custpage_client_id', config.clientId);

        try {
            const response = await fetch(config.suiteletUrl, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const data = await response.json();
            
            if (data && data.invoiceData && data.invoiceData.isStamped) {
                displayModal(data.message || 'Este folio ya ha sido timbrada anteriormente.');
                setCfdiLinks({ xmlUrl: data.invoiceData.xmlUrl, pdfUrl: data.invoiceData.pdfUrl });
            } else if (data && data.success && data.invoiceData) {
                setCurrentInvoiceData(data.invoiceData);
                setShowInvoiceDetails(true);
            } else {
                displayModal(data.message || 'Folio no encontrado o datos incorrectos.');
            }
        } catch (error: any) {
            displayModal(`Error al buscar folio: ${error.message}`);
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
            displayModal("Error: No hay una folio activa para procesar.");
            return;
        }
        setIsLoading(true);
        setCfdiLinks({ xmlUrl: null, pdfUrl: null });
        setCollectedFiscalData(fiscalDataFromForm);

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
        // Se usa || '' para asegurar que se envíe un string vacío si el campo es opcional y no se llenó.
        formData.append('custpage_telefono', fiscalDataFromForm.telefono || '');
        formData.append('custpage_domicilio_fiscal', fiscalDataFromForm.domicilioFiscal);
        formData.append('custpage_codigo_postal_fiscal', fiscalDataFromForm.codigoPostalFiscal);
        formData.append('custpage_regimen_fiscal', fiscalDataFromForm.regimenFiscal);
        formData.append('custpage_uso_cfdi', fiscalDataFromForm.usoCfdi);

        // --- CAMBIO AQUÍ: Se añade el nuevo campo si la confirmación vino del portal ---
        if (fiscalDataFromForm.confirmedFromPortal) {
            // En Netsuite, los checkboxes suelen usar 'T' para verdadero (true) y 'F' para falso (false).
            formData.append('custpage_portal_confirmation', 'T'); // Reemplaza 'custpage_portal_confirmation' con el ID de tu campo
        }

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
                displayModal(data.message || "Ocurrió un error durante el timbrado.", true);
            }
        } catch (error: any) {
            displayModal(`Error al timbrar: ${error.message}`, true);
        } finally {
            setIsLoading(false);
        }
    };

    // --- NUEVA FUNCIÓN PARA MANEJAR EL REPORTE ---
    const handleReportProblem = async () => {
        if (!currentInvoiceData || !collectedFiscalData) {
            displayModal("No hay suficiente información para enviar el reporte.");
            return;
        }
        // --- CAMBIO AQUÍ: Se verifica si la URL de reporte está configurada ---
        if (!config.reportSuiteletUrl) {
            displayModal("La función para reportar problemas no está configurada.");
            return;
        }
        setIsReporting(true);

        const reportSuiteletUrl = config.reportSuiteletUrl; // Se usa la URL de la configuración

        // El objeto 'collectedFiscalData' ya contiene el teléfono, por lo que se enviará automáticamente.
        const reportData = {
            invoiceData: currentInvoiceData,
            fiscalData: collectedFiscalData,
            errorMessage: modalMessage,
            clientEmail: collectedFiscalData.emailCfdi
        };

        try {
            const response = await fetch(reportSuiteletUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "El servidor de reportes devolvió un error.");
            }
            // Se cierra el modal actual y se muestra uno nuevo de confirmación
            setShowModal(false);
            setTimeout(() => displayModal(result.message), 500); // Pequeño delay para que se vea la transición
        } catch (error: any) {
            // Se cierra el modal actual y se muestra uno nuevo de error
            setShowModal(false);
            setTimeout(() => displayModal(`No se pudo enviar el reporte: ${error.message}`), 500);
        } finally {
            setIsReporting(false);
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
                            // --- CAMBIO AQUÍ: Se usa la clase de tamaño dinámica ---
                            className={`${logoSizeClass} w-auto mx-auto object-contain`} 
                        />
                     ) : (
                        <svg 
                            style={{ color: theme.textPrimary }} 
                            // --- CAMBIO AQUÍ: Se usa la clase de tamaño dinámica ---
                            className={`${logoSizeClass} w-auto mx-auto`} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                     )}
                    <h1 style={{ color: theme.textPrimary }} className="text-3xl font-bold pt-4">{config.clientName || 'Portal de Autofacturación'}</h1>
                    <p style={{ color: theme.textSecondary }} className="mt-2">Consulta folios y genera tu CFDI.</p>
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
            
            {/* --- BOTÓN FLOTANTE DE WHATSAPP --- */}
            {config.whatsappNumber && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
                    {/* Burbuja de ayuda */}
                    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg mb-1 relative border border-gray-100 max-w-[200px] text-center text-sm font-medium animate-bounce-slow">
                        ¿Tienes alguna duda sobre tu folio/factura?
                        {/* Triángulo inferior */}
                        <div className="absolute w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 bottom-[-6px] right-6"></div>
                    </div>
                    
                <a
                    href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent("Hola, necesito ayuda con mi facturación.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                    title="Ayuda por WhatsApp"
                >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                </a>
                </div>
            )}

            <Modal 
                isOpen={showModal} 
                message={modalMessage} 
                onClose={() => setShowModal(false)}
                showReportButton={showReportButton}
                onReportProblem={handleReportProblem}
                isReporting={isReporting}
            />
            <footer className="text-center mt-12 pb-6">
                <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} {'IMR Software'} Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
