import { getClientConfig } from '../lib/aws-config';
import PortalClientComponent from './PortalClientComponent';

// ... (tus interfaces ClientConfig y AwsConfig se mantienen igual) ...
interface ClientConfig {
  clientId: string;
  suiteletUrl: string;
  netsuiteCompId: string;
  clientName: string;
}

interface AwsConfig {
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string | undefined;
    tableName: string | undefined;
}




async function PortalPageContent({ clientId, awsConfig }: { clientId?: string, awsConfig: AwsConfig }) {
    // ... (el resto de esta función se mantiene igual) ...
    let clientConfig: ClientConfig | null = null;
    let error: string | null = null;

    if (!awsConfig.region || !awsConfig.tableName || !awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
        error = "La configuración del servidor está incompleta. Faltan variables de entorno de AWS.";
    } else if (clientId) {
        try {
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

export default function Page(props: any) {
    // --- PASO DE DIAGNÓSTICO AQUÍ ---
    // Imprimimos todas las variables de entorno disponibles en el servidor.
    // Esto aparecerá en los logs de CloudWatch de tu aplicación.
    console.log("Variables de entorno disponibles en el servidor:", process.env);

    const clientId = props.searchParams?.clientId;

    const awsConfig: AwsConfig = {
        accessKeyId: process.env.PFACT_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.PFACT_AWS_SECRET_ACCESS_KEY,
        region: process.env.PFACT_AWS_REGION,
        tableName: process.env.PFACT_DYNAMODB_TABLE_NAME,
    };

    return <PortalPageContent clientId={clientId} awsConfig={awsConfig} />;
}