/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/log', 'N/url', 'N/https', 'N/encode', 'N/file', 'N/config'],
    /**
     * @param {search} search
     * @param {record} record
     * @param {log} log
     * @param {url} url
     * @param {https} https
     * @param {encode} encode
     * @param {file} file
     * @param {config} config
     */
    function (search, record, log, url, https, encode, file, config) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            // Configurar cabeceras CORS para permitir solicitudes desde cualquier origen
            // En un entorno de producción, es mejor restringir esto a dominios específicos.
            // --- INICIO DE LA SOLUCIÓN CORS ---

            context.response.setHeader({
                name: 'Access-Control-Allow-Origin',
                value: '*' // Permitir solicitudes desde el dominio de tu portal de facturación
                // Para producción, es más seguro usar el dominio específico de tu portal:
                // value: 'https://tu-portal-de-facturacion.com' 
            });
            context.response.setHeader({
                name: 'Access-Control-Allow-Methods',
                value: 'POST, GET, OPTIONS' // Métodos permitidos
            });
            context.response.setHeader({
                name: 'Access-Control-Allow-Headers',
                value: 'Content-Type, X-User-Agent' // Cabeceras permitidas
            });

            var responseData = {
                success: false,
                message: '',
                invoiceData: null
            };


            // Manejar la solicitud 'preflight' del navegador para CORS
            if (context.request.method === 'OPTIONS') {
                context.response.write(JSON.stringify(responseData)); // Simplemente responde OK para OPTIONS
                return;
            }
            // --- FIN DE LA SOLUCIÓN CORS ---

            try {
                if (context.request.method === 'POST') {
                    // Obtener parámetros de la solicitud.
                    // Los nombres de los parámetros deben coincidir con los que envía el FormData del frontend.
                    var invoiceOrCustomerId = context.request.parameters.custpage_invoice_id;
                    var action = context.request.parameters.custpage_action; // 'search' o 'timbrar'
                    var clientId = context.request.parameters.custpage_client_id;
                    var customerEmail = context.request.parameters.custpage_email_cfdi;
                    var searchId = context.request.parameters.custpage_search_id || null; // ID del cliente, si es necesario
                    //log.error('Solicitud Recibida:', context.request.parameters);

                    if (action === "search") {
                        if (!invoiceOrCustomerId) {
                            responseData.message = 'Parámetros incompletos: Se requiere el folio a buscar.';
                            context.response.write(JSON.stringify(responseData));
                            return;
                        }

                        var searchMode = context.request.parameters.custpage_search_mode || 'invoice';
                        var searchResult = null;
                        var foundRecordType = null;

                        // Buscar según el modo configurado
                        if (searchMode === 'invoice' || searchMode === 'both') {
                            searchResult = searchByFolio(invoiceOrCustomerId, 'invoice', searchId, search, record, file, config);
                            if (searchResult) foundRecordType = 'invoice';
                        }

                        if (!searchResult && (searchMode === 'salesorder' || searchMode === 'both')) {
                            searchResult = searchByFolio(invoiceOrCustomerId, 'salesorder', null, search, record, file, config);
                            if (searchResult) foundRecordType = 'salesorder';
                        }

                        if (searchResult) {
                            responseData.success = searchResult.success;
                            responseData.message = searchResult.message;
                            responseData.invoiceData = searchResult.invoiceData;
                            if (responseData.invoiceData) {
                                responseData.invoiceData.recordType = foundRecordType;
                            }
                        } else {
                            responseData.message = searchMode === 'both'
                                ? 'No se encontró factura ni orden de venta con ese folio.'
                                : (searchMode === 'salesorder' ? 'Orden de venta no encontrada.' : 'Factura no encontrada o los datos no coinciden.');
                        }
                    }

                    if (action === "timbrar") {
                        var SENDER_ID = -5; // ID del autor del correo (ej. -5 para el usuario actual)
                        if (!invoiceOrCustomerId) {
                            responseData.message = 'Parámetro incompleto: Se requiere ID de Factura u Orden de Venta.';
                            context.response.write(JSON.stringify(responseData));
                            return;
                        }
                        var recordType = context.request.parameters.recordType || 'invoice';

                        // Si es OV, se transforma a factura antes de timbrar
                        if (recordType === 'salesorder') {
                            log.audit('Portal: Transformando OV a Factura', 'OV ID: ' + invoiceOrCustomerId);
                            var nuevaFactura = record.transform({
                                fromType: record.Type.SALES_ORDER,
                                fromId: parseInt(invoiceOrCustomerId),
                                toType: record.Type.INVOICE,
                                isDynamic: true
                            });
                            nuevaFactura.setValue({ fieldId: 'custbody_fe_razon_social', value: context.request.parameters.custpage_razon_social });
                            nuevaFactura.setValue({ fieldId: 'custbody_ce_rfc', value: context.request.parameters.custpage_rfc });
                            nuevaFactura.setValue({ fieldId: 'custbodyimr_regimenfiscalreceptor', value: context.request.parameters.custpage_regimen_fiscal });
                            nuevaFactura.setValue({ fieldId: 'custbody_uso_cfdi_fe_imr_33', value: getUsoCfdi(context.request.parameters.custpage_uso_cfdi) });
                            nuevaFactura.setValue({ fieldId: 'custbody_codigo_postal_fiscal', value: context.request.parameters.custpage_codigo_postal_fiscal });
                            invoiceOrCustomerId = String(nuevaFactura.save());
                            recordType = 'invoice';
                            log.audit('Portal: Factura creada desde OV', 'Nueva Factura ID: ' + invoiceOrCustomerId);
                        }
                        var usoCfdi = getUsoCfdi(context.request.parameters.custpage_uso_cfdi);
                        var facturaTimbrar = record.load({ type: record.Type.INVOICE, id: invoiceOrCustomerId, isDynamic: true });
                        var subsidiaryTransaccion = facturaTimbrar.getValue({ fieldId: "subsidiary" });
                        // Solo actualizar campos fiscales si la factura no fue recién creada desde OV (ya los tiene)
                        if (context.request.parameters.recordType !== 'salesorder') {
                            facturaTimbrar.setValue({ fieldId: 'custbody_fe_razon_social', value: context.request.parameters.custpage_razon_social });
                            facturaTimbrar.setValue({ fieldId: 'custbody_ce_rfc', value: context.request.parameters.custpage_rfc });
                            facturaTimbrar.setValue({ fieldId: 'custbodyimr_regimenfiscalreceptor', value: context.request.parameters.custpage_regimen_fiscal });
                            facturaTimbrar.setValue({ fieldId: 'custbody_uso_cfdi_fe_imr_33', value: usoCfdi });
                            facturaTimbrar.setValue({ fieldId: 'custbody_codigo_postal_fiscal', value: context.request.parameters.custpage_codigo_postal_fiscal });
                            facturaTimbrar.save();
                        }

                        var DataConfigTimbre = searchData("customrecord_fe_sf_config", null, [
                            search.createFilter({ name: "internalid", operator: search.Operator.ANYOF, values: [subsidiaryTransaccion] })
                        ], "customsearch_fe_sf_config");
                        var scriptTimbre = DataConfigTimbre[0].getValue({ name: "custrecord_fe_imr_pac_script_timbrado", join: "custrecord_fe_imr_pac" }) || 'customscript_fe_sf_st_moderna_33';
                        var deployTimbre = DataConfigTimbre[0].getValue({ name: "custrecord_fe_imr_pac_deploy_timbrado", join: "custrecord_fe_imr_pac" }) || 'customdeploy_fe_sf_st_moderna_33';
                        var emailAuthor = DataConfigTimbre[0].getValue({ name: "custrecord_ce_timbrado_author" }) || '';
                        log.error({ title: 'scriptTimbre ', details: scriptTimbre });
                        log.error({ title: 'deployTimbre ', details: deployTimbre });
                        var suiteletURL = url.resolveScript({ scriptId: scriptTimbre, deploymentId: deployTimbre, returnExternalUrl: true });
                        suiteletURL += '&data=' + encode.convert({
                            string: JSON.stringify({ "recordType": recordType, "recordId": invoiceOrCustomerId, "titleForm": "Factura Electrónica", "_fe_portal_cliente": "T" }),
                            inputEncoding: encode.Encoding.UTF_8,
                            outputEncoding: encode.Encoding.BASE_64
                        });
                        try {
                            var response = https.get({ url: suiteletURL });
                            log.error({ title: 'response ', details: response.body });
                        } catch (error) {
                            log.error({ title: 'error', details: error });
                        }

                        var fieldFe = search.lookupFields({
                            type: recordType,
                            id: invoiceOrCustomerId,
                            columns: ['custbody_fe_sf_codigo_respuesta', 'custbody_fe_sf_mensaje_respuesta', 'custbody_fe_sf_xml_sat', 'custbody_fe_sf_pdf']
                        });
                        //Timbrado exitoso
                        if (fieldFe.custbody_fe_sf_codigo_respuesta === 200 || fieldFe.custbody_fe_sf_codigo_respuesta === '200.0') {

                            responseData.success = true;
                            responseData.message = fieldFe.custbody_fe_sf_mensaje_respuesta;

                            var urlFile = url.resolveScript({ scriptId: 'customscript_fe_fel_files_st', deploymentId: 'customdeploy_fe_fel_files_st', returnExternalUrl: true });
                            var urlXml = urlFile + '&data=' + encode.convert({
                                string: JSON.stringify({ "fileID": getPropertySearch(fieldFe, 'custbody_fe_sf_xml_sat', 'value'), "titleForm": "XML - SAT" }),
                                inputEncoding: encode.Encoding.UTF_8,
                                outputEncoding: encode.Encoding.BASE_64
                            });

                            var urlPDF = urlFile + '&data=' + encode.convert({
                                string: JSON.stringify({ "fileID": getPropertySearch(fieldFe, 'custbody_fe_sf_pdf', 'value'), "titleForm": "PDF - SAT" }),
                                inputEncoding: encode.Encoding.UTF_8,
                                outputEncoding: encode.Encoding.BASE_64
                            });

                            var fieldFe = search.lookupFields({
                                type: recordType,
                                id: invoiceOrCustomerId,
                                columns: ['custbody_fe_sf_codigo_respuesta', 'custbody_fe_sf_mensaje_respuesta', 'custbody_fe_sf_xml_sat', 'custbody_fe_sf_pdf']
                            });

                            var xmlFileId = fieldFe.custbody_fe_sf_xml_sat ? fieldFe.custbody_fe_sf_xml_sat[0].value : null;
                            var pdfFileId = fieldFe.custbody_fe_sf_pdf ? fieldFe.custbody_fe_sf_pdf[0].value : null;

                            if (!xmlFileId || !pdfFileId) {
                                throw new Error("No se encontraron los archivos XML y PDF generados después del timbrado.");
                            }

                            // --- 3. ENVIAR CORREO AL CLIENTE (SI PROPORCIONÓ UN EMAIL) ---
                            if (customerEmail) {
                                // Cargar los archivos para adjuntarlos
                                var xmlFile = file.load({ id: xmlFileId });
                                var pdfFile = file.load({ id: pdfFileId });

                                // Opcional: Usar una plantilla de correo para un formato profesional
                                // const emailTemplateId = 123; // ID de tu plantilla de correo en Netsuite
                                // const mergeResult = render.mergeEmail({
                                //     templateId: emailTemplateId,
                                //     transactionId: parseInt(invoiceInternalId)
                                // });
                                // const emailSubject = mergeResult.subject;
                                // const emailBody = mergeResult.body;

                                email.send({
                                    author: SENDER_ID,
                                    recipients: customerEmail,
                                    // subject: emailSubject || `Su Factura Electrónica ${invoiceInternalId}`,
                                    // body: emailBody || `Estimado cliente, adjuntamos los archivos de su factura.`,
                                    subject: 'Su Factura Electrónica de Grupo Premier',
                                    body: 'Estimado cliente,\n\nAdjuntamos los archivos XML y PDF de su Comprobante Fiscal Digital por Internet (CFDI).\n\nGracias por su preferencia.',
                                    attachments: [xmlFile, pdfFile],
                                    relatedRecords: { // Asocia el correo a la transacción en Netsuite
                                        transactionId: parseInt(invoiceInternalId)
                                    }
                                });
                            }

                            responseData.invoiceData = {
                                xmlUrl: urlXml,
                                pdfUrl: urlPDF,
                            }

                        } else {
                            responseData.success = false;
                            responseData.message = 'Error al timbrar: ' + fieldFe.custbody_fe_sf_mensaje_respuesta;
                        }

                    }
                } else {
                    responseData.message = 'Método no permitido. Solo se aceptan solicitudes POST.';
                }
            } catch (e) {
                log.error('Error en Suitelet', e.toString() + ' Stack: ' + e.stack);
                responseData.message = 'Ocurrió un error en el servidor: ' + e.message;
                // Considera no exponer detalles del error al cliente en producción
            }

            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json'
            });
            context.response.write(JSON.stringify(responseData));
        }


        function searchByFolio(folio, mode, searchId, search, record, file, config) {
            var invoiceColumns = [
                search.createColumn({ name: 'tranid' }),
                search.createColumn({ name: 'entity', label: 'CustomerInternalId' }),
                search.createColumn({ name: 'companyname', join: 'customer', label: 'CustomerName' }),
                search.createColumn({ name: 'trandate' }),
                search.createColumn({ name: 'duedate' }),
                search.createColumn({ name: 'total' }),
                search.createColumn({ name: 'custbody_fe_razon_social' }),
                search.createColumn({ name: 'custbody_ce_rfc' }),
                search.createColumn({ name: 'custbodyimr_regimenfiscalreceptor' }),
                search.createColumn({ name: 'custbody_uso_cfdi_fe_imr_33' }),
                search.createColumn({ name: 'custbody_forma_pago_fe_imr_33' }),
                search.createColumn({ name: 'custbody_fe_metodo_de_pago' }),
                search.createColumn({ name: 'billaddress' }),
                search.createColumn({ name: 'custbody_domiciliofiscalreceptor' }),
                search.createColumn({ name: 'subsidiary' }),
                search.createColumn({ name: 'custbody_fe_sf_codigo_respuesta' }),
                search.createColumn({ name: 'custbody_fe_sf_xml_sat' }),
                search.createColumn({ name: 'custbody_fe_sf_pdf' })
            ];

            var recordTypeNS = mode === 'salesorder' ? search.Type.SALES_ORDER : search.Type.INVOICE;
            var nsType = mode === 'salesorder' ? 'salesorder' : 'invoice';
            var typeFilter = mode === 'salesorder'
                ? search.createFilter({ name: 'type', operator: search.Operator.ANYOF, values: ['SalesOrd'] })
                : search.createFilter({ name: 'type', operator: search.Operator.ANYOF, values: ['CustInvc'] });

            var invoiceSearch;
            if (searchId && mode !== 'salesorder') {
                invoiceSearch = search.load({ id: searchId });
                invoiceSearch.filters = (invoiceSearch.filters || []).concat([
                    search.createFilter({ name: 'custbody_pos3_receiptnumber', operator: search.Operator.IS, values: folio })
                ]);
            } else {
                invoiceSearch = search.create({
                    type: recordTypeNS,
                    filters: [
                        search.createFilter({ name: 'tranid', operator: search.Operator.IS, values: folio }),
                        typeFilter,
                        search.createFilter({ name: 'mainline', operator: search.Operator.IS, values: 'T' })
                    ],
                    columns: invoiceColumns
                });
            }

            var searchResult = invoiceSearch.run().getRange({ start: 0, end: 1 });
            if (!searchResult || searchResult.length === 0) return null;

            var result = searchResult[0];

            // Si es factura, verificar si ya está timbrada
            if (mode !== 'salesorder') {
                var codResp = result.getValue({ name: 'custbody_fe_sf_codigo_respuesta' }) || '';
                if (codResp == '200.0' || codResp == '200') {
                    var xmlSat = result.getValue({ name: 'custbody_fe_sf_xml_sat' }) || '';
                    var pdf = result.getValue({ name: 'custbody_fe_sf_pdf' }) || '';
                    var xmlFile = file.load({ id: xmlSat });
                    var pdfFile = file.load({ id: pdf });
                    var configRecObj = config.load({ type: config.Type.COMPANY_INFORMATION });
                    var accountId = configRecObj.getValue('companyid');
                    var domain = 'https://' + accountId + '.app.netsuite.com';
                    return {
                        success: false,
                        message: 'La factura ya ha sido timbrada.',
                        invoiceData: { isStamped: true, xmlUrl: domain + xmlFile.url, pdfUrl: domain + pdfFile.url }
                    };
                }
            }

            var transaccionRecord = record.load({ type: nsType, id: result.id, isDynamic: false });
            var lineItems = [];
            var numLines = transaccionRecord.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < numLines; i++) {
                lineItems.push({
                    description: transaccionRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }) + " (" + transaccionRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }) + ")",
                    quantity: transaccionRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                    unitPrice: transaccionRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }),
                    total: transaccionRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i })
                });
            }

            var customerData = record.load({ type: record.Type.CUSTOMER, id: result.getValue({ name: 'entity' }), isDynamic: false });
            var razonSocial = customerData.getValue({ fieldId: 'custentity_razon_social' }) || customerData.getValue({ fieldId: 'companyname' });
            var rfc = customerData.getValue({ fieldId: 'custentity_ce_rfc' }) || customerData.getValue({ fieldId: 'vatregnumber' });

            return {
                success: true,
                message: mode === 'salesorder' ? 'Orden de venta encontrada.' : 'Factura encontrada.',
                invoiceData: {
                    invoiceNumber: result.getValue('tranid'),
                    internalId: result.id,
                    customerName: result.getText('entity') || result.getValue({ name: 'companyname', join: 'customer' }),
                    subsidiaryId: result.getValue('subsidiary'),
                    issueDate: result.getValue('trandate'),
                    dueDate: result.getValue('duedate'),
                    totalAmount: parseFloat(result.getValue('total')).toFixed(2),
                    razonSocial: mode === 'salesorder' ? razonSocial : result.getValue('custbody_fe_razon_social'),
                    rfc: mode === 'salesorder' ? rfc : result.getValue('custbody_ce_rfc'),
                    regimenFiscal: result.getText('custbodyimr_regimenfiscalreceptor'),
                    usoCfdi: result.getText('custbody_uso_cfdi_fe_imr_33'),
                    formaPago: result.getText('custbody_forma_pago_fe_imr_33'),
                    metodoPago: result.getText('custbody_fe_metodo_de_pago'),
                    domicilioFiscal: transaccionRecord.getText('billaddress'),
                    codigoPostalFiscal: transaccionRecord.getText('custbody_domiciliofiscalreceptor'),
                    lineItems: lineItems
                }
            };
        }

        function searchData(type, columns, filters, idSearch) {
            var data = [];
            var searchData = null;
            if (idSearch) {
                searchData = search.load({ id: idSearch });
                searchData.filters = searchData.filters || [];
                searchData.columns = searchData.columns || [];
                searchData.filters = searchData.filters.concat(filters || []);
                searchData.columns = searchData.columns.concat(columns || []);
            } else {
                searchData = search.create({ type: type, columns: columns, filters: filters });
            }
            var PagedData = searchData.runPaged();
            PagedData.pageRanges.forEach(function (pageRange) {
                var Page = PagedData.fetch({ index: pageRange.index });
                Page.data.forEach(function (result) {
                    data.push(result);
                });
            });
            return data;
        }

        function getPropertySearch(obj, field, type) {
            if (obj[field] && obj[field].length > 0) {
                return obj[field][0][type];
            }
            if (obj[field] && !obj[field].length) {
                return obj[field];
            }
            return '';
        }

        function getUsoCfdi(usoCfdi) {
            log.error('Uso CFDI buscado', usoCfdi);
            var usoCfdiId = search.create({
                type: 'customrecord_uso_cfdi_fe_33',
                filters: [
                    ['idtext', 'is', usoCfdi]
                ],
                columns: ['internalid']
            }).run().getRange({ start: 0, end: 1 });
            log.error('Uso CFDI encontrado', usoCfdiId);
            if (usoCfdiId && usoCfdiId.length > 0) {
                return usoCfdiId[0].getValue('internalid');
            } else {
                log.error('Uso CFDI no encontrado', 'El uso CFDI especificado no existe: ' + usoCfdi);
                return null; // O manejar el error de otra manera
            }
        }

        return {
            onRequest: onRequest
        };
    });
