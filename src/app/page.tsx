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

// --- CORRECCIÓN AQUÍ ---
// Se ajusta la interfaz para que acepte 'string | undefined', que es el tipo
// que realmente devuelve process.env.
interface AwsConfig {
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string | undefined;
    tableName: string | undefined;
}

// Componente asíncrono que contiene la lógica de obtención de datos.
async function PortalPageContent({ clientId, awsConfig }: { clientId?: string, awsConfig: AwsConfig }) {
    let clientConfig: ClientConfig | null = null;
    let error: string | null = null;

    // Primero, validamos que la configuración de AWS esté presente.
    if (!awsConfig.region || !awsConfig.tableName || !awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
        error = "La configuración del servidor está incompleta. Faltan variables de entorno de AWS.";
    } else if (clientId) {
        try {
            // Pasamos la configuración de AWS a la función que consulta DynamoDB
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

    // Si hay un error, mostramos un mensaje.
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

    // Si todo está bien, renderizamos el componente de cliente.
    return (
        <PortalClientComponent config={clientConfig} />
    );
}

// La exportación por defecto de la página (Componente Síncrono)
export default function Page(props: any) {
    const clientId = props.searchParams?.clientId;

    // Leemos las variables de entorno en el nivel más alto (el Componente de Servidor).
    const awsConfig: AwsConfig = {
        accessKeyId: process.env.PFACT_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.PFACT_AWS_SECRET_ACCESS_KEY,
        region: process.env.PFACT_AWS_REGION,
        tableName: process.env.PFACT_DYNAMODB_TABLE_NAME,
    };

    // Renderizamos el componente asíncrono, pasándole la configuración.
    return <PortalPageContent clientId={clientId} awsConfig={awsConfig} />;
}
