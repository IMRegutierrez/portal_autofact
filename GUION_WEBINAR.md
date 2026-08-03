# Guion de Webinar: Portal de Autofacturación IMR + NetSuite

**Duración estimada:** 25-30 min de exposición + 10 min de Q&A
**Audiencia:** Clientes/prospectos de IMR Software que usan NetSuite y necesitan un flujo de autofacturación (CFDI) para sus clientes finales.
**Formato:** Presentación de slides + demo en vivo del portal.

---

## SLIDE 1 — Portada

**Título:** Portal de Autofacturación — Autoservicio de CFDI integrado a NetSuite
**Subtítulo:** Cómo tus clientes generan su factura electrónica sin que tu equipo mueva un dedo

**Notas del presentador:**
Bienvenida breve. Presentarse (nombre, rol en IMR Software). Una línea de gancho: "¿Cuántas veces su equipo de mostrador o call center recibe la misma pregunta: 'necesito mi factura'? Hoy les muestro cómo eliminar esa fricción por completo."

---

## SLIDE 2 — El problema

**Título:** La facturación manual cuesta tiempo, dinero y clientes molestos

**Bullets:**
- El cliente final compra/paga y después tiene que *pedir* su factura por teléfono, WhatsApp o en mostrador.
- El equipo administrativo captura RFC, régimen fiscal, uso de CFDI a mano → errores de captura, retrabajos.
- No hay trazabilidad de quién facturó qué, ni control de vigencia por sucursal/cliente.
- Cada empresa del grupo tiene su propia identidad visual y reglas — no hay una solución "talla única".

**Notas del presentador:**
Anclar el dolor en términos de negocio: costo operativo, tiempo de respuesta, riesgo de error fiscal (RFC mal capturado = CFDI cancelado). Mencionar que esto se agrava cuando son múltiples marcas/empresas dentro de un mismo grupo corporativo (multi-tenant).

---

## SLIDE 3 — La solución en una frase

**Título:** Un portal web de autoservicio, personalizado por cliente, conectado en tiempo real a NetSuite

**Bullets:**
- El cliente final busca su ticket/folio, valida sus datos y captura su información fiscal.
- El timbrado del CFDI ocurre directamente en NetSuite — la fuente de la verdad no se duplica.
- Cada empresa tiene su propia URL, logo, colores y reglas de negocio, sin desplegar código nuevo.
- Todo queda registrado en la transacción de NetSuite: sin hojas de cálculo paralelas, sin sistemas intermedios de datos.

**Notas del presentador:**
Este es el "elevator pitch" del producto. Enfatizar "sin duplicar datos" — mucha gente en NetSuite le teme a los sistemas satélite que generan inconsistencias; aquí NetSuite sigue siendo el sistema de registro.

---

## SLIDE 4 — Arquitectura general

**Título:** Arquitectura: Next.js + AWS + Suitelets de NetSuite

**Diagrama (describir para el diseñador):**
Tres columnas conectadas por flechas horizontales:
1. **Cliente final (navegador)** → visita `portal.com/?clientId=empresa`
2. **Portal Web (Next.js 15 / React 19 en Vercel o AWS Amplify)**
   - Lee configuración/tema del cliente desde **AWS DynamoDB** (logo, colores, vigencia, URLs de Suitelet)
   - Orquesta el flujo de 4 pasos (búsqueda → detalles → datos fiscales → timbrado)
3. **NetSuite (Suitelets)**
   - Suitelet de búsqueda/timbrado (`IMR - PORTAL FACTURACION - ST.js`)
   - Transacciones nativas: Factura, Orden de Venta
   - Motor de timbrado fiscal (PAC) ya configurado en la cuenta

**Bullets:**
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Configuración multi-cliente:** AWS DynamoDB — una fila por empresa (`clientId`).
- **Backend de negocio:** 100% NetSuite vía Suitelets (SuiteScript 2.x) — no hay base de datos de transacciones propia.

**Notas del presentador:**
Aclarar que el "backend" real de negocio es NetSuite: el portal es una capa de experiencia de usuario, no un sistema de registro paralelo. Esto es clave para tranquilizar a los administradores de NetSuite sobre integridad de datos.

---

## SLIDE 5 — Multi-tenant: un portal, infinitas marcas

**Título:** Cada cliente, su propio portal — sin tocar código

**Bullets:**
- Un solo despliegue sirve a todas las empresas del grupo mediante el parámetro `clientId` en la URL.
- Panel de administración (Backoffice) para dar de alta/editar/archivar clientes.
- Configurable por cliente: logo, colores (`primaryTextColor`, `buttonColor`, etc.), vigencia (`validFrom`/`validTo`), número de WhatsApp de soporte, correo de soporte, URL del Suitelet de NetSuite correspondiente.
- Se puede **apagar temporalmente** un portal (mantenimiento, fin de promoción) sin desplegar nada.

**Notas del presentador:**
Buen momento para mostrar el panel admin en vivo si el demo lo contempla, o al menos un screenshot. Mencionar que esto resuelve escenarios de grupos con múltiples razones sociales/subsidiarias en la misma cuenta de NetSuite.

---

## SLIDE 6 — El flujo del cliente final, paso a paso

**Título:** 4 pasos, cero llamadas a soporte

**Bullets (uno por paso, con ícono):**
1. **Buscar** — el cliente ingresa su folio (factura u orden de venta, configurable por campo: folio, ticket, ID de transacción).
2. **Confirmar** — el portal muestra monto, fecha y conceptos; el cliente valida que es su compra.
3. **Datos fiscales** — RFC, razón social, régimen fiscal, uso de CFDI, forma de pago, código postal, correo.
4. **Timbrado y descarga** — NetSuite genera el CFDI; el cliente descarga XML y PDF, y recibe copia por correo.

**Notas del presentador:**
Este slide es el más visual — ideal para capturas de pantalla reales del portal en cada paso. Sugerir al equipo de diseño usar un layout de "wizard" con los 4 pasos numerados horizontalmente.

---

## SLIDE 7 — Qué pasa "bajo el cuadro" en el timbrado

**Título:** Del clic del cliente al CFDI timbrado — en segundos

**Bullets:**
- El portal llama al Suitelet con el folio y los datos fiscales capturados.
- Si el folio es una **Orden de Venta**, el Suitelet la transforma automáticamente en Factura (evitando duplicados si ya existe una factura sin timbrar).
- Se actualizan en la transacción los campos fiscales: razón social, RFC, régimen fiscal, uso de CFDI, código postal.
- El Suitelet invoca al script de timbrado (PAC) configurado por subsidiaria en NetSuite.
- Si el timbrado responde código 200, se recuperan los archivos **XML y PDF** generados y se listos para descarga/envío por correo.
- Si el folio **ya fue timbrado previamente**, el sistema lo detecta y ofrece directamente los archivos existentes — no se genera una factura duplicada.

**Notas del presentador:**
Este es el slide "técnico" para audiencias de IT/NetSuite admins. Se puede simplificar para audiencias de negocio. Mencionar que el PAC y la configuración fiscal se leen de un registro de configuración por subsidiaria (`customrecord_fe_sf_config`), lo que permite múltiples RFC emisores/subsidiarias en la misma cuenta.

---

## SLIDE 8 — Manejo de errores y soporte

**Título:** Cuando algo falla, el cliente no se queda varado

**Bullets:**
- Botón flotante de **WhatsApp** visible en todo el flujo para ayuda humana inmediata.
- Si ocurre un error de timbrado o de datos, se despliega un **modal de reporte** que envía automáticamente el detalle técnico a soporte.
- El equipo de soporte recibe el caso con contexto (folio, cliente, error) sin que el cliente final tenga que explicar nada.

**Notas del presentador:**
Este punto suele tranquilizar a los prospectos: "no es una caja negra sin salida", siempre hay una vía de escape hacia soporte humano.

---

## SLIDE 9 — Beneficios de negocio

**Título:** El impacto real

**Bullets (con métrica/frase de impacto donde aplique):**
- **Menos carga operativa:** el equipo deja de capturar datos fiscales manualmente.
- **Disponible 24/7:** el cliente factura cuando quiere, sin depender de horario de oficina.
- **Menos errores fiscales:** validación de formato en el propio formulario (RFC, código postal, etc.) antes de llegar a NetSuite.
- **Consistencia de marca:** cada empresa del grupo mantiene su identidad visual.
- **Cero sistemas paralelos:** todo vive en NetSuite, con trazabilidad completa de la transacción.
- **Control total:** activar/desactivar vigencia de facturación por cliente sin intervención de TI.

**Notas del presentador:**
Este es el slide para decisión de negocio (dueños, dirección financiera). Aterrizar con un beneficio cuantificable si el cliente tiene datos propios (ej. "X llamadas de soporte menos al mes").

---

## SLIDE 10 — Demo en vivo

**Título:** Vamos a verlo funcionando

**Bullets:**
- Buscar un folio de ejemplo.
- Confirmar detalles.
- Capturar datos fiscales.
- Timbrar y descargar XML/PDF.
- (Opcional) Mostrar panel admin: cómo se configura un nuevo cliente en minutos.

**Notas del presentador:**
Slide de transición — poco texto, es la señal para cambiar a pantalla compartida del navegador. Tener preparado un ambiente de sandbox/demo con datos de prueba ya cargados en NetSuite.

---

## SLIDE 11 — Seguridad y buenas prácticas

**Título:** Diseñado pensando en control y seguridad

**Bullets:**
- Configuración sensible (credenciales AWS) fuera del código, vía variables de entorno.
- El Suitelet valida la existencia y estado de la transacción antes de timbrar — no se puede timbrar dos veces el mismo folio.
- CORS configurado explícitamente en el Suitelet para controlar qué orígenes pueden llamar al backend.
- Vigencia por cliente (`validFrom`/`validTo`) permite cerrar el portal automáticamente al vencer una promoción o convenio.

**Notas del presentador:**
Ajustar el nivel de detalle según la audiencia — si hay gente de TI/seguridad en la sala, profundizar; si es audiencia de negocio, resumir en una frase.

---

## SLIDE 12 — Roadmap / próximos pasos

**Título:** Hacia dónde va el producto

**Bullets:**
- Internacionalización (multi-idioma) para operaciones fuera de México.
- Validación proactiva de RFC contra listas del SAT antes del timbrado.
- Cache de configuración de cliente para mejorar tiempos de carga.
- Pruebas automatizadas end-to-end sobre el flujo crítico de búsqueda y timbrado.

**Notas del presentador:**
Muestra que el producto está vivo y en mejora continua — útil para cerrar con confianza ante prospectos.

---

## SLIDE 13 — Cierre / Llamado a la acción

**Título:** ¿Listos para eliminar la fricción de facturar?

**Bullets:**
- Agenda una sesión de configuración de tu portal personalizado.
- Contacto: [correo/teléfono de ventas IMR Software]
- Preguntas y respuestas.

**Notas del presentador:**
Cerrar con la invitación clara a agendar una demo personalizada o piloto. Abrir espacio a preguntas.

---

## Apéndice — Glosario rápido para la audiencia

- **CFDI:** Comprobante Fiscal Digital por Internet (factura electrónica en México).
- **PAC:** Proveedor Autorizado de Certificación — quien timbra el CFDI ante el SAT.
- **Suitelet:** Script de NetSuite que expone un endpoint web (usado aquí como API del portal).
- **Uso de CFDI:** Catálogo del SAT que indica el motivo fiscal de la factura (ej. G03 Gastos en general).
- **Timbrar:** Proceso de sellar fiscalmente un CFDI ante el SAT a través del PAC.

---

## Notas para quien diseñe las slides

- Usar la identidad visual de IMR Software; dejar espacio para 1-2 capturas de pantalla reales del portal por cada paso del flujo (Slide 6).
- El diagrama de arquitectura (Slide 4) funciona mejor como 3 cajas conectadas con flechas horizontales, iconografía simple (navegador → Next.js/AWS → NetSuite).
- Mantener los slides técnicos (4, 7, 11) con menos texto y más diagrama; son los que más se benefician de visualización sobre prosa.
- Slides 2 y 9 (problema/beneficios) funcionan bien como pares antes/después.
