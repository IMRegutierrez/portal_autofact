import { getClientConfig, getCatalogos } from '../lib/aws-config'; // Se importa la nueva función
import PortalClientComponent from './PortalClientComponent';

// Interfaz para definir la estructura de la configuración del cliente
interface ClientConfig {
  clientId: string;
  suiteletUrl: string;
  netsuiteCompId: string;
  clientName: string;
  logoUrl?: string;
  // ... otros campos de tema
}
interface SelectOption {
    value: string;
    label: string;
}
interface AwsConfig {
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string | undefined;
    tableName: string | undefined;
}

export default async function Page(props: any) {
    const clientId = props.searchParams?.clientId;

    // Se leen las variables de entorno para crear el objeto de configuración
    const awsConfig: AwsConfig = {
        accessKeyId: process.env.PORTAL_ACCESS_KEY_ID,
        secretAccessKey: process.env.PORTAL_SECRET_ACCESS_KEY,
        region: process.env.PORTAL_REGION,
        tableName: process.env.PORTAL_TABLE_NAME,
    };

    let clientConfig: ClientConfig | null = null;
    let error: string | null = null;
    // Se inicializan los catálogos como arreglos vacíos
    let regimenesFiscales: SelectOption[] = [];
    let usosCfdi: SelectOption[] = [];

    if (clientId) {
        try {
            // Se obtienen la configuración del cliente y los catálogos en paralelo
            const [configResult, catalogosResult] = await Promise.all([
                getClientConfig(clientId, awsConfig),
                getCatalogos(awsConfig) // Se pasa awsConfig a la función de catálogos
            ]);

            clientConfig = configResult as ClientConfig | null;
            
            if (catalogosResult) {
                regimenesFiscales = catalogosResult.regimenes;
                usosCfdi = catalogosResult.usos;
            }

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

    // Se pasan los catálogos obtenidos como props al componente de cliente
    return (
        <PortalClientComponent 
            config={clientConfig} 
            regimenesFiscales={regimenesFiscales}
            usosCfdi={usosCfdi}
        />
    );
}
