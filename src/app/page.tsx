import { getClientConfig } from '../lib/aws-config';
import PortalClientComponent from './PortalClientComponent';

// Interfaz para definir la estructura de la configuración del cliente
interface ClientConfig {
  clientId: string;
  suiteletUrl: string;
  netsuiteCompId: string;
  clientName: string;
}

// Interfaz para la configuración de AWS (con nombres simplificados)
interface AwsConfig {
    region: string | undefined;
    tableName: string | undefined;
}

// Componente asíncrono que contiene la lógica de obtención de datos.
async function PortalPageContent({ clientId, awsConfig }: { clientId?: string, awsConfig: AwsConfig }) {
    let clientConfig: ClientConfig | null = null;
    let error: string | null = null;

    if (clientId) {
        try {
            clientConfig = (await getClientConfig(clientId, awsConfig)) as ClientConfig | null;
            if (!clientConfig) {
                error = `No se encontró una configuración válida para el cliente '${clientId}'.`;
            }
        } catch (e: any) {
            error = e.message || "Error al conectar con el servicio de configuración." + clientConfig;
        }
    } else {
        error = "Bienvenido. Por favor, accede a través de la URL proporcionada para tu empresa.";
    }

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

    return (
        <PortalClientComponent config={clientConfig} />
    );
}

// La exportación por defecto de la página (Componente Síncrono)
export default function Page(props: any) {
    const clientId = props.searchParams?.clientId;

    // --- CAMBIO AQUÍ ---
    // Leemos las variables de entorno con los nuevos nombres simplificados.
    const awsConfig: AwsConfig = {
        region: process.env.PORTAL_REGION,
        tableName: process.env.PORTAL_TABLE_NAME,
    };

    // Renderizamos el componente asíncrono, pasándole la configuración.
    return <PortalPageContent clientId={clientId} awsConfig={awsConfig} />;
}
