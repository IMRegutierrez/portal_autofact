/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/log', 'N/url', 'N/https', 'N/encode', 'N/file', 'N/config', 'N/email'],
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
    function (search, record, log, url, https, encode, file, config, email) {

        function onRequest(context) {
            // --- SECURITY IMPROVEMENT: CORS RESTRICTION ---
            // In production, replace '*' with your specific domain to prevent unauthorized access.
            context.response.setHeader({
                name: 'Access-Control-Allow-Origin',
                value: '*' // TODO: Change this to your Vercel app domain, e.g., 'https://your-app.vercel.app'
            });
            context.response.setHeader({
                name: 'Access-Control-Allow-Methods',
                value: 'POST, GET, OPTIONS'
            });
            context.response.setHeader({
                name: 'Access-Control-Allow-Headers',
                value: 'Content-Type, X-User-Agent'
            });

            var responseData = {
                success: false,
                message: '',
                invoiceData: null
            };

            if (context.request.method === 'OPTIONS') {
                context.response.write(JSON.stringify(responseData));
                return;
            }

            try {
                if (context.request.method === 'POST') {
                    var invoiceOrCustomerId = context.request.parameters.custpage_invoice_id;
                    var action = context.request.parameters.custpage_action;
                    var clientId = context.request.parameters.custpage_client_id;
                    var customerEmail = context.request.parameters.custpage_email_cfdi;
                    var searchId = context.request.parameters.custpage_search_id || null;

                    if (action === "search") {
                        if (!invoiceOrCustomerId) {
                            responseData.message = 'Parámetros incompletos: Se requiere Número de Factura/ID Cliente.';
                            context.response.write(JSON.stringify(responseData));
                            return;
                        } else {
                            var invoiceSearch;

                            if (searchId) {
                                invoiceSearch = search.load({ id: searchId });
                                invoiceSearch.filters.push(search.createFilter({
                                    name: 'tranid',
                                    operator: search.Operator.IS,
                                    values: invoiceOrCustomerId
                                }));
                            } else {
                                invoiceSearch = search.create({
                                    type: search.Type.INVOICE,
                                    filters: [
                                        ['tranid', search.Operator.IS, invoiceOrCustomerId],
                                        'AND',
                                        ['type', search.Operator.ANYOF, 'CustInvc'],
                                        'AND',
                                        ['mainline', search.Operator.IS, 'T']
                                    ],
                                    columns: [
                                        'tranid',
                                        { name: 'entity', label: 'CustomerInternalId' },
                                        { name: 'companyname', join: 'customer', label: 'CustomerName' },
                                        'trandate',
                                        'duedate',
                                        'total',
                                        'custbody_fe_razon_social',
                                        'custbody_ce_rfc',
                                        'custbodyimr_regimenfiscalreceptor',
                                        'custbody_uso_cfdi_fe_imr_33',
                                        'custbody_forma_pago_fe_imr_33',
                                        'custbody_fe_metodo_de_pago',
                                        'billaddress',
                                        'custbody_domiciliofiscalreceptor',
                                        'subsidiary',
                                        'custbody_fe_sf_codigo_respuesta',
                                        'custbody_fe_sf_xml_sat',
                                        'custbody_fe_sf_pdf'
                                    ]
                                });
                            }

                            // --- PERFORMANCE IMPROVEMENT: DIRECT EXECUTION ---
                            // Instead of runPaged(), we use run().getRange() for better performance on single results.
                            var searchResult = invoiceSearch.run().getRange({ start: 0, end: 1 });

                            if (searchResult && searchResult.length > 0) {
                                var result = searchResult[0];
                                var invoiceRecordId = result.id;
                                var codResp = result.getValue({ name: 'custbody_fe_sf_codigo_respuesta' }) || '';

                                if (codResp == '200.0' || codResp == '200') {
                                    var xmlSat = result.getValue({ name: 'custbody_fe_sf_xml_sat' }) || '';
                                    var pdf = result.getValue({ name: 'custbody_fe_sf_pdf' }) || '';

                                    var xmlFileUrl = '';
                                    var pdfFileUrl = '';

                                    if (xmlSat) {
                                        var xmlFile = file.load({ id: xmlSat });
                                        xmlFileUrl = xmlFile.url;
                                    }
                                    if (pdf) {
                                        var pdfFile = file.load({ id: pdf });
                                        pdfFileUrl = pdfFile.url;
                                    }

                                    var configRecObj = config.load({ type: config.Type.COMPANY_INFORMATION });
                                    var accountId = configRecObj.getValue('companyid').toLowerCase().replace('_', '-');
                                    var domain = 'https://' + accountId + '.app.netsuite.com';

                                    responseData.message = 'La factura ya ha sido timbrada.';
                                    responseData.invoiceData = {
                                        isStamped: true,
                                        xmlUrl: domain + xmlFileUrl,
                                        pdfUrl: domain + pdfFileUrl,
                                    }
                                    context.response.write(JSON.stringify(responseData));
                                    return;
                                }

                                var invoiceRecord = record.load({
                                    type: record.Type.INVOICE,
                                    id: invoiceRecordId,
                                    isDynamic: false
                                });

                                var lineItems = [];
                                var numLines = invoiceRecord.getLineCount({ sublistId: 'item' });
                                for (var i = 0; i < numLines; i++) {
                                    lineItems.push({
                                        description: invoiceRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }) + " (" + invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }) + ")",
                                        quantity: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                                        unitPrice: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }),
                                        total: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i })
                                    });
                                }

                                responseData.success = true;
                                responseData.message = 'Factura encontrada.';
                                responseData.invoiceData = {
                                    invoiceNumber: result.getValue('tranid'),
                                    internalId: result.id,
                                    customerId: result.getValue('entity'),
                                    customerName: result.getText('entity') || result.getValue({ name: 'companyname', join: 'customer' }),
                                    subsidiaryId: result.getValue('subsidiary'),
                                    issueDate: result.getValue('trandate'),
                                    dueDate: result.getValue('duedate'),
                                    totalAmount: parseFloat(result.getValue('total')).toFixed(2),
                                    razonSocial: result.getValue('custbody_fe_razon_social'),
                                    rfc: result.getValue('custbody_ce_rfc'),
                                    regimenFiscal: result.getText('custbodyimr_regimenfiscalreceptor'),
                                    usoCfdi: result.getText('custbody_uso_cfdi_fe_imr_33'),
                                    formaPago: result.getText('custbody_forma_pago_fe_imr_33'),
                                    metodoPago: result.getText('custbody_fe_metodo_de_pago'),
                                    domicilioFiscal: invoiceRecord.getText('billaddress'),
                                    codigoPostalFiscal: invoiceRecord.getText('custbody_domiciliofiscalreceptor'),
                                    lineItems: lineItems,
                                };
                            } else {
                                responseData.message = 'Factura no encontrada o los datos no coinciden.';
                                // log.audit('Búsqueda sin resultados', 'ID: ' + invoiceOrCustomerId);
                            }
                        }
                    }

                    if (action === "timbrar") {
                        // ... (Mantener lógica de timbrado existente o refactorizar si es necesario)
                        // Por brevedad, asumo que la lógica de timbrado se mantiene igual, 
                        // ya que es compleja y depende de otros scripts/procesos.
                        // Se recomienda modularizar esta parte también.

                        // Aquí iría el código de timbrado original...
                        // He simplificado este bloque para el ejemplo de "Optimization".

                        var SENDER_ID = -5; // ID del autor del correo (ej. -5 para el usuario actual)
                        if (!invoiceOrCustomerId) {
                            responseData.message = 'Parámetro incompleto: Se requiere ID de Factura.';
                            context.response.write(JSON.stringify(responseData));
                            return;
                        }
                        var recordType = context.request.parameters.recordType || 'invoice'; // Por defecto, 'invoice'
                        var usoCfdi = getUsoCfdi(context.request.parameters.custpage_uso_cfdi);
                        var facturaTimbrar = record.load({ type: record.Type.INVOICE, id: invoiceOrCustomerId, isDynamic: true });
                        var subsidiaryTransaccion = facturaTimbrar.getValue({ fieldId: "subsidiary" });
                        facturaTimbrar.setValue({ fieldId: 'custbody_fe_razon_social', value: context.request.parameters.custpage_razon_social });
                        facturaTimbrar.setValue({ fieldId: 'custbody_ce_rfc', value: context.request.parameters.custpage_rfc });
                        facturaTimbrar.setValue({ fieldId: 'custbodyimr_regimenfiscalreceptor', value: context.request.parameters.custpage_regimen_fiscal });
                        facturaTimbrar.setValue({ fieldId: 'custbody_uso_cfdi_fe_imr_33', value: usoCfdi });
                        facturaTimbrar.setValue({ fieldId: 'custbody_codigo_postal_fiscal', value: context.request.parameters.custpage_codigo_postal_fiscal });
                        facturaTimbrar.save();

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
                            log.debug('Customer Email', customerEmail);
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
                                    subject: 'Su Factura Electrónica',
                                    body: 'Estimado cliente,\n\nAdjuntamos los archivos XML y PDF de su Comprobante Fiscal Digital por Internet (CFDI).\n\nGracias por su preferencia.',
                                    attachments: [xmlFile, pdfFile]
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
                        //responseData.message = "Funcionalidad de timbrado optimizada pendiente de integración completa.";
                    }

                } else {
                    responseData.message = 'Método no permitido. Solo se aceptan solicitudes POST.';
                }
            } catch (e) {
                log.error('Error en Suitelet', e.toString());
                responseData.message = 'Ocurrió un error en el servidor. Por favor contacte al administrador.';
            }

            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json'
            });
            context.response.write(JSON.stringify(responseData));
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
            //log.error('Uso CFDI encontrado', usoCfdiId);
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
