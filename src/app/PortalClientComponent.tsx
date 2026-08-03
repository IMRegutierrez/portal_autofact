'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import InvoiceSearchForm from './components/InvoiceSearchForm';
import InvoiceDetailsDisplay from './components/InvoiceDetailsDisplay';
import FiscalDataForm from './components/FiscalDataForm';
import Modal from './components/Modal';
import Loader from './components/Loader';
import Stepper, { Step } from './components/Stepper';
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
    searchMode?: 'invoice' | 'salesorder' | 'both';
    searchField?: string;
    isActive?: boolean;
    whatsappNumber?: string;
    senderId?: string;
    supportEmail?: string;
    searchFieldsConfig?: {
        showTotalAmount?: boolean;
        customFieldLabel?: string;
    };
}

const WIZARD_STEPS: Step[] = [
    { title: 'Datos del folio', subtitle: 'Busca tu comprobante' },
    { title: 'Datos fiscales', subtitle: 'Información para tu CFDI' },
    { title: 'Generar CFDI', subtitle: 'Descarga tu factura' },
];

// --- Componente Principal del Cliente ---
export default function PortalClientComponent({ config }: { config: ClientConfig }) {
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
        searchId: config.searchId,
        searchMode: config.searchMode,
        searchField: config.searchField
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

    // Paso actual del wizard (1..3)
    const [currentStep, setCurrentStep] = useState(1);

    // Estado para el modal
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showReportButton, setShowReportButton] = useState(false);
    const [isReporting, setIsReporting] = useState(false);

    // Datos fiscales recolectados (para reporte)
    const [collectedFiscalData, setCollectedFiscalData] = useState<FiscalDataInputs | null>(null);

    const theme = {
        background: config.backgroundColor || '#F1F5F9',
        cardBackground: config.cardBackgroundColor || '#FFFFFF',
        textPrimary: config.primaryTextColor || '#1E293B',
        textSecondary: config.secondaryTextColor || '#334155',
        button: config.buttonColor || '#2563EB',
        buttonText: config.buttonTextColor || '#FFFFFF'
    };

    const displayModal = (message: string, isReportableError: boolean = false) => {
        setModalMessage(message);
        setShowReportButton(isReportableError && !!config.reportSuiteletUrl);
        setShowModal(true);
    };

    // --- Efectos derivados de los hooks ---
    useEffect(() => {
        if (searchError) displayModal(searchError);
    }, [searchError]);

    useEffect(() => {
        if (stampError) displayModal(stampError, true);
    }, [stampError]);

    useEffect(() => {
        // Timbrado exitoso -> avanzar al paso final
        if (stampSuccess) setCurrentStep(3);
    }, [stampSuccess]);

    useEffect(() => {
        // Si al buscar el folio ya estaba timbrado, avisamos (los enlaces se muestran en el paso 1)
        if (invoiceData && invoiceData.isStamped) {
            displayModal('Este folio ya ha sido timbrado anteriormente.');
        }
    }, [invoiceData]);

    // Enlaces activos (timbrado reciente o búsqueda)
    const activeCfdiLinks = stampedFiles.xmlUrl ? stampedFiles : searchCfdiLinks;
    const isLoading = isSearching || isStamping;
    const canAdvanceFromSearch = !!invoiceData && !invoiceData.isStamped;

    // --- Handlers ---
    const handleSearchSubmit = (data: InvoiceSearchInputs) => {
        resetInvoice();
        setSearchError(null);
        searchInvoice(data);
    };

    const handleFiscalDataSubmit = async (fiscalData: FiscalDataInputs) => {
        if (!invoiceData) return;
        setCollectedFiscalData(fiscalData);
        await stampInvoice(fiscalData, invoiceData);
    };

    const handleRestart = () => {
        resetInvoice();
        setSearchError(null);
        setStampError(null);
        setCollectedFiscalData(null);
        setCurrentStep(1);
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
            invoiceData,
            fiscalData: collectedFiscalData,
            errorMessage: modalMessage,
            clientEmail: collectedFiscalData.emailCfdi,
            systemContext: { senderEmployeeId: config.senderId, supportEmailTarget: config.supportEmail }
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

    // --- Panel de descarga (reutilizable) ---
    const DownloadButtons = () => (
        <div className="flex flex-col sm:flex-row justify-center gap-3">
            {activeCfdiLinks.xmlUrl && (
                <a href={activeCfdiLinks.xmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Descargar XML
                </a>
            )}
            {activeCfdiLinks.pdfUrl && (
                <a href={activeCfdiLinks.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Descargar PDF
                </a>
            )}
        </div>
    );

    // Altura del logo configurable por cliente (config.logoHeight, ej. "h-16", "h-24"); default modesto si no viene.
    const logoSizeClass = config.logoHeight || 'h-16';

    return (
        <div style={{ backgroundColor: theme.background }} className="min-h-screen flex flex-col items-center justify-center p-4">
            <Head>
                <title>{config.clientName || 'Portal de Autofacturación'}</title>
            </Head>

            <div style={{ backgroundColor: theme.cardBackground }} className="w-full max-w-3xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Encabezado */}
                <div className="px-6 md:px-10 pt-8 pb-4 text-center">
                    {config.logoUrl ? (
                        <img src={config.logoUrl} alt={`Logo de ${config.clientName}`} className={`${logoSizeClass} w-auto mx-auto object-contain`} />
                    ) : (
                        <svg style={{ color: theme.button }} className="h-12 w-auto mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    )}
                    <h1 className="text-2xl font-bold pt-3 text-gray-900">{config.clientName || 'Portal de Autofacturación'}</h1>
                    <p className="mt-1 text-sm text-gray-500">Consulta tu folio y genera tu CFDI en 3 pasos.</p>
                </div>

                {/* Stepper */}
                <div className="px-6 md:px-12 pb-5">
                    <Stepper steps={WIZARD_STEPS} current={currentStep} accent={theme.button} />
                </div>

                <div className="border-t border-gray-100" />

                {/* Contenido del paso */}
                <div key={currentStep} className="px-6 md:px-10 py-8 animate-step-in">
                    {/* PASO 1: Búsqueda */}
                    {currentStep === 1 && (
                        <div>
                            <InvoiceSearchForm
                                onSearch={handleSearchSubmit}
                                isLoading={isLoading}
                                theme={theme}
                                searchConfig={config.searchFieldsConfig as any}
                            />

                            {isLoading && <Loader />}

                            {invoiceData && invoiceData.isStamped && (activeCfdiLinks.xmlUrl || activeCfdiLinks.pdfUrl) && (
                                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center animate-fade-in">
                                    <p className="text-sm font-medium text-amber-800 mb-4">Este folio ya cuenta con un CFDI timbrado. Puedes descargarlo:</p>
                                    <DownloadButtons />
                                </div>
                            )}

                            {canAdvanceFromSearch && (
                                <InvoiceDetailsDisplay invoiceData={invoiceData as any} onConfirmDetails={() => { }} theme={theme} hideConfirmButton />
                            )}

                            {/* Navegación */}
                            <div className="flex justify-end pt-6">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!canAdvanceFromSearch}
                                    style={canAdvanceFromSearch ? { backgroundColor: theme.button, color: theme.buttonText } : undefined}
                                    className={`inline-flex items-center gap-2 font-semibold py-3 px-7 rounded-lg shadow-sm transition-all ${canAdvanceFromSearch ? 'hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    Siguiente
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: Datos fiscales */}
                    {currentStep === 2 && invoiceData && (
                        <FiscalDataForm
                            invoiceNumberForContext={invoiceData.invoiceNumber}
                            initialData={invoiceData as Partial<FiscalDataInputs>}
                            onSubmit={handleFiscalDataSubmit}
                            isLoading={isLoading}
                            theme={theme}
                            onBack={() => setCurrentStep(1)}
                        />
                    )}

                    {/* PASO 3: Generación / descarga de CFDI */}
                    {currentStep === 3 && (
                        <div className="text-center animate-fade-in">
                            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                                <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">¡CFDI generado exitosamente!</h3>
                            <p className="text-sm text-gray-500 mb-6">Descarga los archivos de tu factura. También se enviaron a tu correo.</p>
                            <DownloadButtons />
                            <div className="pt-8">
                                <button type="button" onClick={handleRestart} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
                                    Facturar otro folio
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {config.whatsappNumber && (
                <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
                    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg mb-1 relative border border-gray-100 max-w-[200px] text-center text-sm font-medium animate-bounce-slow">
                        ¿Tienes alguna duda sobre tu folio/factura?
                        <div className="absolute w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 bottom-[-6px] right-6"></div>
                    </div>
                    <a
                        href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent("Hola, necesito ayuda con mi facturación.")}`}
                        target="_blank" rel="noopener noreferrer"
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
            <footer className="text-center mt-8 pb-6">
                <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} IMR Software. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
