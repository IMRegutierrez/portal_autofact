import { getClientConfig } from '../lib/aws-config';
import PortalClientComponent from './PortalClientComponent';

// --- SOLUCIÓN AQUÍ ---
// Esta línea le dice a Next.js que esta página debe ser renderizada dinámicamente
// en cada petición, deshabilitando la caché de datos.
export const dynamic = 'force-dynamic';

// Interfaz para definir la estructura de la configuración del cliente
interface ClientConfig {
  clientId: string;
  suiteletUrl: string;
  netsuiteCompId: string;
  clientName: string;
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

    // Leemos las variables de entorno.
    const awsConfig: AwsConfig = {
        accessKeyId: process.env.PORTAL_ACCESS_KEY_ID,
        secretAccessKey: process.env.PORTAL_SECRET_ACCESS_KEY,
        region: process.env.PORTAL_REGION,
        tableName: process.env.PORTAL_TABLE_NAME,
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
