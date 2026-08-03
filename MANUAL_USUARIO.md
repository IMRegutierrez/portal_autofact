# Manual de Usuario: Portal de Autofacturación

¡Bienvenido al **Portal de Autofacturación**! Esta herramienta está diseñada para que puedas consultar tus notas de consumo, pagos o comprobantes (tickets) y generar la Factura Electrónica (CFDI) correspondiente de forma rápida y sencilla por tu propia cuenta, en cualquier momento.

Este manual te guiará paso a paso en el proceso de generar tus facturas electrónicas.

---

## 1. Ingresar al Portal

Para comenzar, ingresa al portal mediante el enlace (URL) único que te ha proporcionado el establecimiento donde realizaste tu compra o pago. 

> **Nota:** La dirección incluirá un identificador especial de la empresa en la que vas a facturar. (Por ejemplo: `www.tudominio.com/?clientId=empresa`). Cada empresa tendrá un portal con sus propios logotipos y colores.

Si el enlace te muestra un mensaje informando que "El portal no está disponible temporalmente", significa que el periodo permitido por la empresa para facturar se ha desactivado temporalmente o han programado un mantenimiento. En este caso deberás ponerte en contacto directo con soporte técnico.

---

## 2. Pantalla de Búsqueda (Paso 1)

Una vez en la plataforma verás la pantalla principal. En esta primera fase necesitarás tener tu **Ticket o Comprobante de Compra** a la mano.

1. **Campos de Búsqueda:** Observarás un formulario de búsqueda. Aquí deberás escribir de manera exacta los datos solicitados que aparecen en tu ticket. Estos pueden variar por cliente, pero usualmente te solicitarán el **Folio Fiscal**, **Número de Ticket**, **ID de Transacción** y el **Monto Total**.
2. Presiona el botón **Buscar**. 
3. El sistema verificará la existencia de tu operación en las bases de datos.

> **¡Presta atención!** Si al ingresar tus datos, el sistema te notifica: *"Este folio ya ha sido timbrado anteriormente"*, significa que ya se generó un CFDI y el portal podría mostrarte las opciones para descargas u ofrecerte un botón de ayuda si necesitas re-enviarlo.

---

## 3. Confirmar Detalles (Paso 2)

Si el sistema localiza exitosamente la compra o el pago que deseas y certifica que aún no ha sido facturada, la pantalla avanzará a la **Vista de Detalles del Comprobante**.

1. Revisa detenidamente la información que aparece en pantalla: el monto, fecha y descripción de tus productos o servicios asegurándote que sean correctos.
2. Si los datos coinciden con tu compra real, haz clic en el botón de confirmación ("Siguiente", "Confirmar Detalles", etc.).

---

## 4. Capturar Datos Fiscales (Paso 3)

Llegarás a la última fase del proceso, donde introducirás la información que es requerida por la autoridad fiscal (como el SAT en México o análogo según corresponda) mediante un formulario.

Deberás completar con cuidado los siguientes campos (los marcados con un arterisco * son obligatorios):
* **RFC (Registro Federal de Contribuyentes):** Consta típicamente de 12 a 13 caracteres dependiendo de tu figura. Revísalo con cautela.
* **Razón Social o Nombre:** Como apareces registrado en tu constancia de situación.
* **Régimen Fiscal:** El recuadro desplegará un menú, escoge con qué figura declaras ante el fisco.
* **Uso de CFDI:** Escoge el motivo general de esta factura, por ejemplo *G03 (Gastos en general)*.
* **Forma de Pago:** Deberá coincidir con el mecanismo que usaste al pagar. (01 - Efectivo, 04 - Tarjeta de Crédito, etc.).
* **Código Postal:** Los dígitos de la dirección donde está radicado o pertenece tu organización.
* **Correo Electrónico:** *¡Importante!* Introduce un buzón al cual tengas acceso, ya que ahí te puede llegar la copia con los XML de facturación o donde te responderán ante dudas de soporte.

Tómate el tiempo necesario para confirmar los datos y presiona el botón **Generar CFDI** (o "Timbrar").

---

## 5. Descarga de CFDI (Final)

Al procesarse correctamente, el sistema procesará la emisión de la factura electrónica tras unos instantes.

* Verás en la pantalla un mensaje de **CFDI Generado Exitosamente**.
* Abajo, visualizarás un par de botones:
   1. **Descargar XML**: Archivo con la estructura informática y código base para presentación y contabilidad.
   2. **Descargar PDF**: Archivo con diseño listo para imprimirse o guardarse legíblemente. 

Ambos documentos quedarán listos para descarga en tu dispositivo actual para su almacenamiento.

---

###  ¿Tuviste dudas o problemas con tu facturación?

El sistema cuenta con varios mecanismos de ayuda integrados:
* En diversas interfaces notarás un botón flotante con el ícono de **WhatsApp**, normalmente en color verde y con una invitación de ayuda flotando. Al dar click te enlazará al Centro de Ayuda o al Servicio de Contacto directamente en tu celular para recibir ayuda humana expedita.
* Si el portal sufre una desconexión o un caso de negación para poder facturar un folio no reconocido automáticamente (como errores directos del sistema de origen o un SAT sin respuesta) la plataforma te ofrecerá mediante una **Ventana (Modal de Reporte)** un botón de apoyo que envía a Sistemas los errores logrados durante la extracción para contactarte después con una resolución por correo electrónico.
