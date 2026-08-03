# Documentación Técnica: Portal de Autofacturación (IMR Software)

## Descripción General
El **Portal de Autofacturación** es una aplicación en entorno web desarrollada por IMR Software, diseñada para que los clientes finales de diversas empresas puedan consultar sus folios/tickets y solicitar la generación de sus facturas electrónicas (CFDI). La aplicación actúa como un intermediario o "front-end" dinámico que se personaliza según el cliente (logo, colores, configuraciones específicas) y se comunica en el "back-end" con **NetSuite** a través de Suitelets para la extracción de información y el timbrado fiscal.

## Stack Tecnológico 💻
El proyecto está construido utilizando tecnologías modernas bajo un esquema "Serverless" parcial que conecta infraestructura de AWS con NetSuite.
* **Framework y Core:** Next.js 15.4 (App Router) y React 19.1
* **Lenguaje:** TypeScript, proporcionando tipado fuerte e interfaces rigurosas (definidas fundamentalmente en `src/lib/schemas.ts`).
* **Estilos:** Tailwind CSS v4 para diseño fluido, responsivo y dinámico basado en las variables del cliente.
* **Manejo de Formularios:** `react-hook-form` junto a `zod` para validaciones de esquema en el lado del cliente (y servidor cuando proceda).
* **Gestión de Datos/Configuración:** AWS DynamoDB (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`). Utilizado como base de datos NoSQL para almacenar la personalización y configuración de cada instancia de portal para un cliente u organización específica (`clientId`).

## Arquitectura del Proyecto 🏗️
El proyecto se organiza bajo la arquitectura del **App Router de Next.js**:

### Directorios principales:
* **`/src/app`**: Contiene las rutas principales de la aplicación.
    * `/src/app/page.tsx`: Punto de entrada del cliente. Recupera el `clientId` de los parámetros de búsqueda de la URL, se conecta a DynamoDB (en el lado del servidor) y extrae la configuración del cliente (incluyendo vigencias y banderas de activación). Renderiza el componente `PortalClientComponent`.
    * `/src/app/PortalClientComponent.tsx`: El "Orquestador" del lado del cliente (`'use client'`). Contiene la lógica principal de negocio e interactúa entre el usuario, los ganchos personalizados (`hooks`) y los componentes visuales de UI (búsqueda, detalles, formulario de datos fiscales).
    * `/src/app/components/`: Subcomponentes modulares de interfaz gráfica utilizados a lo largo del flujo del portal de cara al usuario final (`InvoiceSearchForm`, `InvoiceDetailsDisplay`, `FiscalDataForm`, `Modal`, `Loader`).
* **`/src/app/admin`**: Contiene el módulo de administración o "Backoffice".
    * Es un entorno restringido (requiere sesión/login) manejado mediante acciones de servidor en `admin-actions.ts`.
    * Permite crear, listar, modificar y archivar registros de "Clientes" (las empresas que contratan el portal de autofacturación). Las configuraciones se actualizan/insertan en la base de datos DynamoDB.
* **`/src/hooks`**: Ganchos lógicos de React (`useInvoice.ts`, `useFiscalForm.ts`) que abstraen las llamadas asíncronas tipo `fetch` hacia los endpoints (Suitelets) de NetSuite.
* **`/src/lib`**: Lógica auxiliar, configuraciones estables y esquemas.
    * `aws-config.js`: Contiene las llamadas y conexión utilizando el AWS SDK hacia DynamoDB para obtener el `GetCommand` del `clientId`.
    * `admin-actions.ts`: "Server actions" (funciones Node) que manipulan la tabla de DynamoDB para guardar y leer listados de la configuración.
    * `schemas.ts`: Esquemas de validación generados con Zod para todo el ciclo de llenado de datos (búsqueda y datos fiscales).

## Flujo Lógico de Funcionamiento 🔄
El ciclo central del negocio opera de la siguiente manera:

1. **Inicialización e Identificación:** El navegador accede a la URL base y se le pasa el query param (ej. `?clientId=mi-compania`). `page.tsx` identifica el cliente, verifica validez y temporalidad (estado de encendido/apagado o vigencias `validFrom`, `validTo`).
2. **Personalización del Entorno:** Si el contexto y el portal son válidos, se le inyectan propiedades dinámicas al `PortalClientComponent` como `logoUrl`, colores en formato HSL/Hex (`cardBackgroundColor`, `primaryTextColor`, etc.) y los IDs o URL's necesarios para el enrutamiento API con NetSuite.
3. **Búsqueda (Paso 1):** El usuario ingresa datos identificadores de su ticket o pedido. Por medio del hook `useInvoice.ts`, el portal realiza una llamada de búsqueda contra un "Suitelet URL" proporcionado por la configuración.
4. **Validación (Paso 2):** Se devuelve la información del "Ticket" detectado y el usuario valida el monto e información. Si un folio ya está facturado/timbrado previamente, el flujo lo intercepta aquí e informa al usuario.
5. **Datos Fiscales (Paso 3):** Con el ticket validado, el usuario rellena sus datos fiscales (RFC, Régimen, Forma de Pago, Uso del CFDI) en `FiscalDataForm.tsx`.
6. **Timbrado (Paso 4):** A través del hook `useFiscalForm.ts`, se hace una petición POST al "Suitelet URL" con los datos del ticket sumado al input de datos fiscales. NetSuite procesa, realiza el timbrado del CFDI y retorna URLs absolutos o blobs hacia el XML y PDF resultantes, dándole conclusión al proceso desde el frente.
7. **Resolución de Conflictos:** Si algo falla en los Suitelets (ejemplo, código HTTP 500, o fallos de negocio pre-controlados), la app lo intercepta y tiene configurado internamente la capacidad de reportar automáticamente detalles a un Suitelet de Soporte (`reportSuiteletUrl`).

## Configuración y Variables de Entorno ⚙️
Es imprescindible que para ejecutar este proyecto (y su comunicación con AWS DynamoDB), estén configuradas de forma óptima estas variables en el archivo `.env.local` y los "Environment Variables" de producción en plataformas como Vercel o AWS Amplify:

* `PORTAL_REGION`: Región de AWS (Ej. `us-east-1` o `us-west-2`)
* `PORTAL_TABLE_NAME`: Nombre de la tabla en DynamoDB que contiene los registros de los clientes.
* `PORTAL_ACCESS_KEY_ID`: IAM Access Key id con permiso de lectura/escritura en DynamoDB.
* `PORTAL_SECRET_ACCESS_KEY`: IAM Secret Key correspondiente.

Para desplegar localmente:
```bash
npm install
npm run dev
```

### Tabla de Base de Datos en DynamoDB (Estructura base del Item):
- `clientId` (Partition Key - String): Identidad única en la URL.
- Propiedades: `clientName`, `suiteletUrl`, `netsuiteCompId`, `isActive`, `validFrom`, `validTo`, `logoUrl`, `logoHeight`.
- Theming properties: `backgroundColor`, `cardBackgroundColor`, `primaryTextColor`, `secondaryTextColor`, `buttonColor`, `buttonTextColor`.
- Integraciones extras: `whatsappNumber`, `reportSuiteletUrl`, `supportEmail`.

## Puntos Extendibles para Futuras Mejoras
1. **Internacionalización y Multi-idioma (i18n):** Actualmente toda la interfaz está harcodeada en sintaxis directa en los `.tsx` (ej. `Portal no disponible`, `Todos los derechos reservados`). Introducir manejo de localización mejorará adaptabilidad de software para mercados extranjeros.
2. **Validadores Proactivos:** Añadir comprobación extra frente a listas del SAT para advertir RFC mal pre-ingresado (aunque se haga la validación de RegEx, se podrían emplear consultas pre-timbrado).
3. **Manejo de Caché:** La recuperación del item de DynamoDB podría situarse en capa de Memoria/Redis en vez de consultarla directamente con DynamoDB en cada inicio de `Page.tsx`, aligerando la persistencia. Next.js 15 incorpora muy buen sistema per-request, pero se puede refinar de cara al componente de servidor utilizando `unstable_cache`.
4. **Pruebas Automatizadas:** Implementación de Jest / React Testing Library orientando pruebas al proceso crítico dependiente de `useInvoice` y las transiciones de estado de `PortalClientComponent`.
