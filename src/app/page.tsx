import { getClientConfig } from '../lib/aws-config';
import PortalClientComponent from './PortalClientComponent';

// Interfaz para definir la estructura de la configuración del cliente
interface ClientConfig {
  clientId: string;
  suiteletUrl: string;
  netsuiteCompId: string;
  clientName: string;
  // Puedes añadir más campos si los tienes en DynamoDB
}

// --- APLICANDO LA SOLUCIÓN DE NEXT.JS 15 ---

// 1. Se crea un nuevo componente asíncrono que contiene la lógica de obtención de datos.
async function PortalPageContent({ clientId }: { clientId?: string }) {
    let clientConfig: ClientConfig | null = null;
    let error: string | null = null;

    if (clientId) {
        try {
            // Buscamos la configuración del cliente en DynamoDB
            clientConfig = (await getClientConfig(clientId)) as ClientConfig | null;
            if (!clientConfig) {
                error = `No se encontró una configuración válida para el cliente '${clientId}'.`;
            }
        } catch (e: any) {
            error = e.message || "Error al conectar con el servicio de configuración.";
        }
    } else {
        error = "Bienvenido. Por favor, accede a través de la URL proporcionada para tu empresa.";
    }

    // Si hay un error o no se encontró la configuración, mostramos un mensaje.
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

    // Si encontramos la configuración, renderizamos el componente de cliente
    // y le pasamos la configuración como props.
    return (
        <PortalClientComponent config={clientConfig} />
    );
}

// 2. La exportación por defecto de la página ahora es un componente SÍNCRONO.
export default function Page({ searchParams }: { searchParams: { clientId?: string } }) {
    const clientId = searchParams.clientId;

    // 3. El componente síncrono renderiza el componente asíncrono.
    // React y Next.js manejarán la carga y el streaming de este componente.
    return <PortalPageContent clientId={clientId} />;
}
