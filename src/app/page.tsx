import { headers } from 'next/headers';
import PortalClientComponent from './PortalClientComponent';

// Interfaz para definir la estructura de la configuración del cliente
interface ClientConfig {
  clientId: string;
  suiteletUrl: string;
  netsuiteCompId: string;
  clientName: string;
}

// --- CORRECCIÓN AQUÍ ---
// La exportación por defecto de la página ahora es un único componente ASÍNCRONO.
export default async function Page(props: any) {
    const clientId = props.searchParams?.clientId;

    let clientConfig: ClientConfig | null = null;
    let error: string | null = null;

    if (clientId) {
        try {
            // Se usa 'await' para resolver la promesa que TypeScript cree que devuelve headers().
            const requestHeaders = await headers();
            const host = requestHeaders.get('host');
            const protocol = host?.startsWith('localhost') ? 'http' : 'https';
            const appUrl = `${protocol}://${host}`;

            const apiUrl = `${appUrl}/api/config?clientId=${clientId}`;
            
            console.log(`Llamando a la API interna: ${apiUrl}`);

            const response = await fetch(apiUrl, { cache: 'no-store' }); 
            const data = await response.json();

            if (response.ok && data.success) {
                clientConfig = data.config;
            } else {
                error = data.message || "La respuesta de la API de configuración no fue exitosa.";
            }
        } catch (e: any) {
            console.error("Error al hacer fetch a la API interna:", e);
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

    // Si todo está bien, renderizamos el componente de cliente.
    return (
        <PortalClientComponent config={clientConfig} />
    );
}
