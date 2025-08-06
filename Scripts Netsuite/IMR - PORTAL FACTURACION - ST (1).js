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
                    var searchId = context.request.parameters.custpage_search_id || null; // ID del cliente, si es necesario
                    //log.error('Solicitud Recibida:', context.request.parameters);

                    if (action === "search") {
                        if (!invoiceOrCustomerId) {
                            responseData.message = 'Parámetros incompletos: Se requiere Número de Factura/ID Cliente y Código Postal.';
                            context.response.write(JSON.stringify(responseData));
                            return;
                        } else {
                            // --- Lógica de Búsqueda ---
                            var filters = [];
                            var invoiceSearch;

                            if (searchId) {
                                invoiceSearch = search.load({ id: searchId });
                                invoiceSearch.filters = invoiceSearch.filters || [];
                                invoiceSearch.columns = invoiceSearch.columns || [];
                                // Aquí podrías añadir filtros adicionales si es necesario
                                invoiceSearch.filters = invoiceSearch.filters.concat([
                                    search.createFilter({
                                        name: 'custbody_pos3_receiptnumber', // O 'invoicenumber' si ese es el campo que usas
                                        operator: search.Operator.IS,
                                        values: invoiceOrCustomerId
                                    })
                                ]);
                            } else {
                                filters.push(search.createFilter({
                                    name: 'tranid', // O 'invoicenumber' si ese es el campo que usas
                                    operator: search.Operator.IS,
                                    values: invoiceOrCustomerId
                                }));
                                // Asumimos que el código postal está en la dirección de facturación del cliente en la factura
                                // Esto puede variar. Podría ser 'billzip', 'shipzip', o un campo personalizado.
                                // También podrías necesitar buscar en el registro del cliente asociado.

                                filters.push(search.createFilter({ // Asegurar que sea una factura de venta
                                    name: 'type',
                                    operator: search.Operator.ANYOF,
                                    values: ['CustInvc']
                                }));
                                filters.push(search.createFilter({ // Considerar solo la línea principal
                                    name: 'mainline',
                                    operator: search.Operator.IS,
                                    values: 'T' // O 'F' si necesitas detalles de líneas específicas
                                }));


                                invoiceSearch = search.create({
                                    type: search.Type.INVOICE, // O 'transaction' si es más general
                                    filters: filters,
                                    columns: [
                                        search.createColumn({ name: 'tranid' }), // Número de Factura
                                        search.createColumn({ name: 'entity', label: 'CustomerInternalId' }), // ID Interno del Cliente
                                        search.createColumn({ name: 'companyname', join: 'customer', label: 'CustomerName' }), // Nombre del Cliente
                                        search.createColumn({ name: 'trandate' }), // Fecha de Emisión
                                        search.createColumn({ name: 'duedate' }), // Fecha de Vencimiento
                                        search.createColumn({ name: 'total' }), // Monto Total
                                        search.createColumn({ name: 'custbody_fe_razon_social' }), // Monto Total
                                        search.createColumn({ name: 'custbody_ce_rfc' }), // RFC cliente
                                        search.createColumn({ name: 'custbodyimr_regimenfiscalreceptor' }), // Monto Total
                                        search.createColumn({ name: 'custbody_uso_cfdi_fe_imr_33' }), // Monto Total
                                        search.createColumn({ name: 'custbody_forma_pago_fe_imr_33' }), // Monto Total
                                        search.createColumn({ name: 'custbody_fe_metodo_de_pago' }), // Monto Total
                                        search.createColumn({ name: 'billaddress' }), // Monto Total
                                        search.createColumn({ name: 'custbody_domiciliofiscalreceptor' }), // Monto Total
                                        search.createColumn({ name: 'subsidiary' }), // Monto Total
                                        search.createColumn({ name: 'custbody_fe_sf_codigo_respuesta' }), //Codigo de respuesta del timbrado
                                        search.createColumn({ name: 'custbody_fe_sf_xml_sat' }), //Codigo de respuesta del timbrado
                                        search.createColumn({ name: 'custbody_fe_sf_pdf' }), //Codigo de respuesta del timbrado
                                        // Podrías necesitar más columnas para los conceptos, lo que haría la búsqueda más compleja
                                        // o requeriría cargar el registro de la factura después.
                                    ]
                                });
                            }
                            var searchResult = invoiceSearch.run().getRange({ start: 0, end: 1 }); // Tomar solo el primer resultado

                            if (searchResult && searchResult.length > 0) {
                                var result = searchResult[0];
                                var invoiceRecordId = result.id; // ID interno de la factura encontrada
                                var codResp = result.getValue({ name: 'custbody_fe_sf_codigo_respuesta' }) || '';
                                if (codResp == '200.0' || codResp == '200') {
                                    var xmlSat = result.getValue({ name: 'custbody_fe_sf_xml_sat' }) || '';
                                    var pdf = result.getValue({ name: 'custbody_fe_sf_pdf' }) || '';
                                    var xmlFile = file.load({
                                        id: xmlSat  // Cargar el archivo XML del SAT
                                    });
                                    var pdfFile = file.load({
                                        id: pdf  // Cargar el archivo PDF   
                                    });
                                    var configRecObj = config.load({
                                        type: config.Type.COMPANY_INFORMATION
                                    });
                                    var accountId = '5652668-sb1' || configRecObj.getValue('companyid');



                                    var domain = 'https://' + accountId + '.app.netsuite.com'

                                    responseData.message = 'La factura ya ha sido timbrada.';
                                    responseData.invoiceData = {
                                        isStamped: true,
                                        xmlUrl: domain + xmlFile.url, // URL del XML
                                        pdfUrl: domain + pdfFile.url, // URL del PDF
                                    }
                                    context.response.write(JSON.stringify(responseData));
                                    return;
                                }

                                // Para obtener los conceptos (line items), usualmente necesitas cargar el registro
                                var lineItems = [];
                                var invoiceRecord = record.load({
                                    type: record.Type.INVOICE,
                                    id: invoiceRecordId,
                                    isDynamic: false
                                });

                                var numLines = invoiceRecord.getLineCount({ sublistId: 'item' });
                                for (var i = 0; i < numLines; i++) {
                                    lineItems.push({
                                        description: invoiceRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }) + " (" + invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }) + ")",
                                        quantity: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                                        unitPrice: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }),
                                        total: invoiceRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i })
                                    });
                                }

                                var customerData = record.load({
                                    type: record.Type.CUSTOMER,
                                    id: result.getValue({ name: 'entity' }),
                                    isDynamic: false
                                });
                                // Aquí podrías extraer más información del cliente si es necesario
                                var razonSocial = customerData.getValue({ fieldId: 'custentity_razon_social' }) || customerData.getValue({ fieldId: 'companyname' });
                                var rfc = customerData.getValue({ fieldId: 'custentity_ce_rfc' }) || customerData.getValue({ fieldId: 'vatregnumber' });

                                responseData.success = true;
                                responseData.message = 'Factura encontrada.';
                                responseData.invoiceData = {
                                    invoiceNumber: result.getValue('tranid'),
                                    internalId: result.id,
                                    // customerId: result.getValue('entity'), // Este es el ID interno
                                    customerName: result.getText('entity') || result.getValue({ name: 'companyname', join: 'customer' }), // Nombre del cliente
                                    subsidiaryId: result.getValue('subsidiary'),
                                    issueDate: result.getValue('trandate'),
                                    dueDate: result.getValue('duedate'),
                                    totalAmount: parseFloat(result.getValue('total')).toFixed(2), // Formatear a 2 decimales
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
                                log.audit('Búsqueda sin resultados', 'Criterios: ' + JSON.stringify(filters));
                            }
                        }
                    }

                    if (action === "timbrar") {
                        if (!invoiceOrCustomerId) {
                            responseData.message = 'Parámetro incompleto: Se requiere ID de Factura.';
                            context.response.write(JSON.stringify(responseData));
                            return;
                        }
                        var recordType = context.request.parameters.recordType || 'invoice'; // Por defecto, 'invoice'
                        log.error('params:', context.request.parameters);
                        var usoCfdi = getUsoCfdi(context.request.parameters.custpage_uso_cfdi);
                        var facturaTimbrar          = record.load({ type: record.Type.INVOICE, id: invoiceOrCustomerId, isDynamic: true });
                        var subsidiaryTransaccion   = facturaTimbrar.getValue({ fieldId: "subsidiary" });
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

                        // Simulación de timbrado exitoso
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
