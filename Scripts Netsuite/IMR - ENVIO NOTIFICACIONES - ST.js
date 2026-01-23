/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/email', 'N/log', 'N/runtime'],

    (email, log, runtime) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            // Configurar encabezados CORS
            scriptContext.response.setHeader({
                name: 'Access-Control-Allow-Origin',
                value: '*' // O tu dominio de Amplify para mayor seguridad
            });
            scriptContext.response.setHeader({
                name: 'Access-control-Allow-Headers',
                value: 'Content-Type'
            });

            if (scriptContext.request.method === 'OPTIONS') {
                return;
            }

            let responseData = { success: false, message: '' };
            const SUPPORT_EMAIL = ['egutierrez@imr.com.mx','sea@gpopremier.com']; // <-- CAMBIA ESTO por tu correo de soporte
            const SENDER_ID = 6225; // ID del autor del correo (ej. -5 para el usuario actual)


            try {
                if (scriptContext.request.method === 'POST') {
                    const requestBody = JSON.parse(scriptContext.request.body);
                    const { invoiceData, fiscalData, errorMessage, clientEmail } = requestBody;
                   
                    if (!invoiceData || !fiscalData || !errorMessage) {
                        throw new Error("Faltan datos en la solicitud de reporte.");
                    }

                    // Formatear el cuerpo del correo en HTML para que sea fácil de leer
                    let emailBody = `
                    <h2>Reporte de Problema de Timbrado</h2>
                    <p>Un usuario ha reportado un problema al intentar timbrar una factura desde el portal.</p>
                    <hr>
                    <h3>Detalles del Error</h3>
                    <p><strong>Mensaje de Error:</strong> ${errorMessage}</p>
                    <hr>
                    <h3>Datos de la Factura</h3>
                    <ul>
                        <li><strong>Número de Factura:</strong> ${invoiceData.invoiceNumber || 'N/A'}</li>
                        <li><strong>ID Interno:</strong> ${invoiceData.internalId || 'N/A'}</li>
                        <li><strong>Cliente:</strong> ${invoiceData.customerName || 'N/A'}</li>
                        <li><strong>Monto:</strong> $${invoiceData.totalAmount || 'N/A'}</li>
                    </ul>
                    <hr>
                    <h3>Datos Fiscales Ingresados por el Usuario</h3>
                    <ul>
                        <li><strong>Razón Social:</strong> ${fiscalData.razonSocial || 'N/A'}</li>
                        <li><strong>RFC:</strong> ${fiscalData.rfc || 'N/A'}</li>
                        <li><strong>Email del Cliente:</strong> ${clientEmail || 'No proporcionado'}</li>
                        <li><strong>Teléfono del Cliente:</strong> ${fiscalData.telefono || 'No proporcionado'}</li>
                        <li><strong>Uso CFDI:</strong> ${fiscalData.usoCfdi || 'N/A'}</li>
                        <li><strong>Régimen Fiscal:</strong> ${fiscalData.regimenFiscal || 'N/A'}</li>
                        <li><strong>Código postal:</strong> ${fiscalData.codigoPostalFiscal || 'N/A'}</li>
                    </ul>
                `;

                    email.send({
                        author: SENDER_ID,
                        recipients: SUPPORT_EMAIL,
                        replyTo: clientEmail || null, // Si el cliente ingresó su email, puedes responderle directamente
                        subject: `Reporte de Problema - Factura ${invoiceData.invoiceNumber || 'N/A'}`,
                        body: emailBody
                    });

                    responseData.success = true;
                    responseData.message = "El reporte ha sido enviado exitosamente. Nuestro equipo de soporte se pondrá en contacto si es necesario.";
                    log.audit('Reporte Enviado Exitosamente', `Factura: ${invoiceData.invoiceNumber}`);

                } else {
                    throw new Error("Método no permitido.");
                }
            } catch (e) {
                log.error('Error en Suitelet de Reporte', e);
                responseData.message = 'Ocurrió un error al enviar el reporte: ' + e.message;
            }

            scriptContext.response.setHeader({ name: 'Content-Type', value: 'application/json' });
            scriptContext.response.write(JSON.stringify(responseData));
        }



        return { onRequest }

    });
