'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import InvoiceSearchForm from './components/InvoiceSearchForm';
import InvoiceDetailsDisplay from './components/InvoiceDetailsDisplay';
import FiscalDataForm from './components/FiscalDataForm';
import Modal from './components/Modal';
import Loader from './components/Loader';
import { useInvoice } from '../hooks/useInvoice';
import { useFiscalForm } from '../hooks/useFiscalForm';
import { InvoiceSearchInputs, FiscalDataInputs } from '../lib/schemas';

// --- Definición de Tipos (Interfaces) ---
interface ClientConfig {
    clientId: string;
    suiteletUrl: string;
    netsuiteCompId: string;
    clientName: string;
    logoUrl?: string;
    logoHeight?: string;
    backgroundColor?: string;
    cardBackgroundColor?: string;
    primaryTextColor?: string;
    secondaryTextColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    searchId?: string;
    reportSuiteletUrl?: string;
    isActive?: boolean;
    whatsappNumber?: string;
    senderId?: string;
    supportEmail?: string;
    searchFieldsConfig?: {
        showTotalAmount?: boolean;
        customFieldLabel?: string;
    };
}

// --- Componente Principal del Cliente ---
export default function PortalClientComponent({ config }: { config: ClientConfig }) {
    // Hooks personalizados
    const {
        invoiceData,
        isLoading: isSearching,
        error: searchError,
        cfdiLinks: searchCfdiLinks,
        searchInvoice,
        resetInvoice,
        setError: setSearchError
    } = useInvoice({
        suiteletUrl: config.suiteletUrl,
        clientId: config.clientId,
        searchId: config.searchId
    });

    const {
        stampInvoice,
        isStamping,
        stampError,
        stampSuccess,
        stampedFiles,
        setStampError
    } = useFiscalForm({
        suiteletUrl: config.suiteletUrl
    });

    // Estado local para UI
    const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
    const [showFiscalForm, setShowFiscalForm] = useState(false);

    // Estado para el modal
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showReportButton, setShowReportButton] = useState(false);
    const [isReporting, setIsReporting] = useState(false);

    // Estado para datos fiscales recolectados (para reporte)
    const [collectedFiscalData, setCollectedFiscalData] = useState<FiscalDataInputs | null>(null);

    // Efectos para manejar estados derivados de los hooks
    useEffect(() => {
        if (searchError) {
            displayModal(searchError);
        }
    }, [searchError]);

    useEffect(() => {
        if (stampError) {
            displayModal(stampError, true); // Permitir reporte si falla timbrado
        }
    }, [stampError]);

    useEffect(() => {
        if (stampSuccess) {
            displayModal(stampSuccess);
            setShowFiscalForm(false);
            setShowInvoiceDetails(false);
        }
    }, [stampSuccess]);

    useEffect(() => {
        if (invoiceData) {
            if (invoiceData.isStamped) {
                // Si la factura ya está timbrada (detectado por useInvoice al buscar)
                displayModal('Este folio ya ha sido timbrado anteriormente.');
            } else {
                setShowInvoiceDetails(true);
            }
        }
    }, [invoiceData]);

    // Combinar links de CFDI (de búsqueda o de timbrado reciente)
    const activeCfdiLinks = stampedFiles.xmlUrl ? stampedFiles : searchCfdiLinks;

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

    const handleSearchSubmit = (data: InvoiceSearchInputs) => {
        setShowInvoiceDetails(false);
        setShowFiscalForm(false);
        resetInvoice(); // Limpiar estado anterior
        searchInvoice(data);
    };

    const handleConfirmInvoiceDetails = () => {
        setShowFiscalForm(true);
        displayModal("Detalles confirmados. Procede con los datos fiscales.");
    };

    const handleFiscalDataSubmit = async (fiscalData: FiscalDataInputs) => {
        if (!invoiceData) return;
        setCollectedFiscalData(fiscalData);
        await stampInvoice(fiscalData, invoiceData);
    };

    const handleReportProblem = async () => {
        if (!invoiceData || !collectedFiscalData) {
            displayModal("No hay suficiente información para enviar el reporte.");
            return;
        }
        if (!config.reportSuiteletUrl) {
            displayModal("La función para reportar problemas no está configurada.");
            return;
        }
        setIsReporting(true);

        const reportData = {
            invoiceData: invoiceData,
            fiscalData: collectedFiscalData,
            errorMessage: modalMessage,
            clientEmail: collectedFiscalData.emailCfdi,
            systemContext: {
                senderEmployeeId: config.senderId,
                supportEmailTarget: config.supportEmail
            }
        };

        try {
            const response = await fetch(config.reportSuiteletUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "El servidor de reportes devolvió un error.");
            }
            setShowModal(false);
            setTimeout(() => displayModal(result.message), 500);
        } catch (error: any) {
            setShowModal(false);
            setTimeout(() => displayModal(`No se pudo enviar el reporte: ${error.message}`), 500);
        } finally {
            setIsReporting(false);
        }
    };

    const isLoading = isSearching || isStamping;

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
                            className={`${logoSizeClass} w-auto mx-auto object-contain`}
                        />
                    ) : (
                        <svg
                            style={{ color: theme.textPrimary }}
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
                    searchConfig={config.searchFieldsConfig}
                />

                {isLoading && <Loader />}

                {showInvoiceDetails && invoiceData && (
                    <InvoiceDetailsDisplay
                        invoiceData={invoiceData}
                        onConfirmDetails={handleConfirmInvoiceDetails}
                        theme={theme}
                    />
                )}

                {showFiscalForm && invoiceData && (
                    <FiscalDataForm
                        invoiceNumberForContext={invoiceData.invoiceNumber}
                        initialData={invoiceData as Partial<FiscalDataInputs>}
                        onSubmit={handleFiscalDataSubmit}
                        isLoading={isLoading}
                        theme={theme}
                    />
                )}

                {(activeCfdiLinks.xmlUrl || activeCfdiLinks.pdfUrl) && !isLoading && (
                    <div className="mt-8 p-6 bg-white/50 rounded-lg shadow-inner text-center">
                        <h3 style={{ color: theme.textPrimary }} className="text-xl font-semibold mb-4">CFDI Generado Exitosamente</h3>
                        <p style={{ color: theme.textSecondary }} className="mb-6">Descarga los archivos de tu factura.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {activeCfdiLinks.xmlUrl && <a href={activeCfdiLinks.xmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors">Descargar XML</a>}
                            {activeCfdiLinks.pdfUrl && <a href={activeCfdiLinks.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">Descargar PDF</a>}
                        </div>
                    </div>
                )}
            </div>

            {config.whatsappNumber && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
                    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg mb-1 relative border border-gray-100 max-w-[200px] text-center text-sm font-medium animate-bounce-slow">
                        ¿Tienes alguna duda sobre tu folio/factura?
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
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
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

