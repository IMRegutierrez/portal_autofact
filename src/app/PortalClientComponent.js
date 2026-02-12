'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import InvoiceSearchForm from './components/InvoiceSearchForm';
import InvoiceDetailsDisplay from './components/InvoiceDetailsDisplay';
import FiscalDataForm from './components/FiscalDataForm';
import Modal from './components/Modal';
import Loader from './components/Loader';

// Este componente recibe la configuración del cliente como una "prop"
export default function PortalClientComponent({ config }) {
    // Estados para manejar el flujo y los datos
    const [isLoading, setIsLoading] = useState(false);
    const [currentInvoiceData, setCurrentInvoiceData] = useState(null);
    const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
    const [showFiscalForm, setShowFiscalForm] = useState(false);
    const [collectedFiscalData, setCollectedFiscalData] = useState(null); // Datos fiscales recolectados del form

    // Para el modal de notificaciones
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Para los enlaces de CFDI generados
    const [cfdiLinks, setCfdiLinks] = useState({ xmlUrl: null, pdfUrl: null });

    // Simulación de guardado de datos fiscales (en memoria para esta sesión)
    // Para persistencia real entre sesiones, se usaría localStorage aquí con useEffect.
    const [mockSavedFiscalData, setMockSavedFiscalData] = useState({});

    const displayModal = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    const handleSearchSubmit = async (searchParams) => {
        setIsLoading(true);
        setCurrentInvoiceData(null);
        setShowInvoiceDetails(false);
        setShowFiscalForm(false);
        setCfdiLinks({ xmlUrl: null, pdfUrl: null });

        // USA LA URL DEL SUITELET RECIBIDA POR PROPS
        const searchSuiteletUrl = config.suiteletUrl; 
        const formData = new FormData();
        formData.append('custpage_invoice_id', searchParams.invoiceOrCustomerId);
        formData.append('custpage_invoice_total', searchParams.invoiceTotal);
        formData.append('custpage_action','search');

        console.log(`Buscando factura en: ${searchSuiteletUrl}`);

        try {
            const response = await fetch(searchSuiteletUrl, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const data = await response.json();
            console.log("Respuesta de búsqueda de Netsuite:", data);

            if (data && data.success && data.invoiceData) {
                // Asegúrate que data.invoiceData contenga internalId, customerId, recordType, y subsidiaryId si aplica
                setCurrentInvoiceData(data.invoiceData);
                setShowInvoiceDetails(true);
            } else {
                displayModal(data.message || 'Factura no encontrada.');
            }
        } catch (error) {
            displayModal(`Error al buscar factura: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmInvoiceDetails = () => {
        if (!currentInvoiceData) return;
        setShowFiscalForm(true);
        // El botón de confirmar detalles se oculta/deshabilita en InvoiceDetailsDisplay si es necesario
        // o se puede manejar su visibilidad aquí.
        displayModal("Detalles confirmados. Procede con los datos fiscales.");
    };

    const handleFiscalDataSubmit = async (fiscalDataFromForm) => {
        if (!currentInvoiceData || !currentInvoiceData.internalId) {
            displayModal("Error: No hay una factura activa para procesar.");
            return;
        }
        setIsLoading(true);
        setCfdiLinks({ xmlUrl: null, pdfUrl: null });

        // USA LA URL DEL SUITELET RECIBIDA POR PROPS
        const timbradoSuiteletUrl = config.suiteletUrl;
        const formData = new FormData();

        console.log(currentInvoiceData);
   

        formData.append('custpage_action','timbrar');
        formData.append('custpage_invoice_id', currentInvoiceData.internalId);
        // ... resto de los append ...
        formData.append('custpage_customer_id', currentInvoiceData.customerId);
        formData.append('recordType', currentInvoiceData.recordType || 'invoice');
        if (currentInvoiceData.subsidiaryId) {
            formData.append('custpage_subsidiary_id', currentInvoiceData.subsidiaryId);
        }
        // Datos fiscales del formulario
        formData.append('custpage_razon_social', fiscalDataFromForm.razonSocial);
        formData.append('custpage_rfc', fiscalDataFromForm.rfc);
        formData.append('custpage_email_cfdi', fiscalDataFromForm.emailCfdi);
        formData.append('custpage_domicilio_fiscal', fiscalDataFromForm.domicilioFiscal);
        formData.append('custpage_codigo_postal_fiscal', fiscalDataFromForm.codigoPostalFiscal);
        formData.append('custpage_regimen_fiscal', fiscalDataFromForm.regimenFiscal);
        formData.append('custpage_uso_cfdi', fiscalDataFromForm.usoCfdi);

        try {
            const response = await fetch(timbradoSuiteletUrl,{
                method: 'POST',
                body : formData
            });
            if (!response.ok) throw new Error(`Error del servidor de timbrado: ${response.status}`);
            const data = await response.json();
            if (data && data.success) {
                displayModal(data.message || "Proceso de CFDI completado.");
                // ... resto de la lógica de éxito ...
                if (data.invoiceData && (data.invoiceData.xmlUrl || data.invoiceData.pdfUrl)) {
                    setCfdiLinks({ xmlUrl: data.invoiceData.xmlUrl, pdfUrl: data.invoiceData.pdfUrl });
                }
                setShowFiscalForm(false);
                setShowInvoiceDetails(false);
            } else {
                displayModal(data.message || "Ocurrió un error durante el timbrado.");
            }
        } catch (error) {
            displayModal(`Error al timbrar: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen flex flex-col items-center justify-center p-4 text-slate-100">
            <Head>
                <title>{config.clientName || 'Portal de Autofacturación'}</title>
                <meta name="description" content="Portal de Autofacturación integrado con Netsuite" />
            </Head>

            <div className="w-full max-w-2xl bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10">
                <header className="text-center mb-8">
                    {/* Podrías usar un logo dinámico aquí si lo guardas en DynamoDB */}
                    <svg className="w-16 h-16 mx-auto mb-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <h1 className="text-3xl font-bold text-sky-400">{config.clientName || 'Portal de Autofacturación'}</h1>
                    <p className="text-slate-400 mt-2">Consulta facturas y genera tu CFDI.</p>
                </header>

                <InvoiceSearchForm onSearch={handleSearchSubmit} isLoading={isLoading} />

                {isLoading && <Loader />}

                {showInvoiceDetails && currentInvoiceData && (
                    <InvoiceDetailsDisplay
                        invoiceData={currentInvoiceData}
                        onConfirmDetails={handleConfirmInvoiceDetails}
                    />
                )}

                {showFiscalForm && currentInvoiceData && (
                    <FiscalDataForm
                        invoiceNumberForContext={currentInvoiceData.invoiceNumber}
                        initialData={currentInvoiceData || {}} // Pasa datos guardados o un objeto vacío
                        onSubmit={handleFiscalDataSubmit}
                        isLoading={isLoading}
                    />
                )}

                {(cfdiLinks.xmlUrl || cfdiLinks.pdfUrl) && !isLoading && (
                    <div className="mt-8 p-6 bg-slate-700/50 rounded-lg shadow-inner text-center">
                        <h3 className="text-xl font-semibold text-sky-300 mb-4">CFDI Generado Exitosamente</h3>
                        <p className="text-slate-400 mb-6">Descarga los archivos de tu factura.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {cfdiLinks.xmlUrl && (
                                <a href={cfdiLinks.xmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                    Descargar XML
                                </a>
                            )}
                            {cfdiLinks.pdfUrl && (
                                <a href={cfdiLinks.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Descargar PDF
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <Modal isOpen={showModal} message={modalMessage} onClose={() => setShowModal(false)} />

            <footer className="text-center mt-12 pb-6">
                <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} {config.clientName || 'TuEmpresa S.A. de C.V.'} Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
