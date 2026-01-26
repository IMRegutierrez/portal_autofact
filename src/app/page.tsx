import getConfig from 'next/config';
import { getClientConfig } from '../lib/aws-config';
import PortalClientComponent from './PortalClientComponent';

// Interfaz para definir la estructura de la configuración del cliente
interface ClientConfig {
    clientId: string;
    suiteletUrl: string;
    netsuiteCompId: string;
    clientName: string;
    isActive?: boolean; // --- CAMBIO AQUÍ: Nuevo campo ---

}

// Interfaz para la configuración de AWS
interface AwsConfig {
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string | undefined;
    tableName: string | undefined;
}

// La página ahora es un único componente de servidor asíncrono.
export default async function Page(props: any) {
    const clientId = props.searchParams?.clientId;

    // Se obtiene la configuración desde serverRuntimeConfig en next.config.js
    const { serverRuntimeConfig } = getConfig();

    const awsConfig: AwsConfig = {
        accessKeyId: serverRuntimeConfig.PORTAL_ACCESS_KEY_ID,
        secretAccessKey: serverRuntimeConfig.PORTAL_SECRET_ACCESS_KEY,
        region: serverRuntimeConfig.PORTAL_REGION,
        tableName: serverRuntimeConfig.PORTAL_TABLE_NAME,
    };

    let clientConfig: ClientConfig | null = null;
    let error: string | null = null;

    if (clientId) {
        try {
            // Llamamos a la función de DynamoDB directamente desde la página.
            clientConfig = (await getClientConfig(clientId, awsConfig)) as ClientConfig | null;
            if (!clientConfig) {
                error = `No se encontró una configuración válida para el cliente '${clientId}'.`;
            }
            // --- CAMBIO AQUÍ: Validación de portal activo ---
            // Si isActive es false explícitamente, bloqueamos el acceso.
            // Si el campo no existe, asumimos que está activo (true) por defecto, 
            // pero puedes cambiar la lógica a (clientConfig.isActive !== true) si quieres que sea obligatorio.
            else if (clientConfig.isActive === false) {
                return (
                    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
                        <div className="text-center bg-white p-10 rounded-xl shadow-lg max-w-md w-full">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Portal no disponible</h1>
                            <p className="text-gray-600">
                                El portal de facturación para <strong>{clientConfig.clientName}</strong> se encuentra temporalmente inhabilitado o en mantenimiento.
                            </p>
                            <p className="text-gray-500 text-sm mt-4">Por favor, contacte al administrador.</p>
                        </div>
                    </main>
                );
            }

        } catch (e: any) {
            error = e.message || "Error al conectar con el servicio de configuración.";
        }
    } else {
        error = "Bienvenido. Por favor, accede a través de la URL proporcionada para tu empresa.";
    }

    // Si hay un error o no se encontró la configuración, mostramos un mensaje de error.
    if (error || !clientConfig) {
        return (
            <main className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen flex items-center justify-center p-4 text-slate-100">
                <div className="text-center bg-slate-800 p-10 rounded-xl shadow-2xl">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Acceso no Válido</h1>
                    <p className="text-slate-400">{error}</p>
                </div>
            </main>
        );
    }

    // Si todo está bien, renderizamos el componente de cliente y le pasamos la configuración.
    return (
        <PortalClientComponent config={clientConfig} />
    );
}
