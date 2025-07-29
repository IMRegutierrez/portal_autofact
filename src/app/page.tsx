import PortalClientComponent from './PortalClientComponent';

// Interfaz para definir la estructura de la configuración del cliente
interface ClientConfig {
  clientId: string;
  suiteletUrl: string;
  netsuiteCompId: string;
  clientName: string;
}

// Componente asíncrono que ahora llama a nuestra API interna
async function PortalPageContent({ clientId }: { clientId?: string }) {
    let clientConfig: ClientConfig | null = null;
    let error: string | null = null;

    if (clientId) {
        try {
            // Obtenemos la URL base de la aplicación desde las variables de entorno de Amplify/Vercel
            // NEXT_PUBLIC_URL es una variable que puedes definir tú mismo en Amplify si es necesario.
            const appUrl = process.env.NEXT_PUBLIC_URL || process.env.AMPLIFY_DEFAULT_DOMAIN || `https://${process.env.AWS_BRANCH}.amplifyapp.com` || 'http://localhost:3000';
            const apiUrl = `${appUrl}/api/config?clientId=${clientId}`;
            
            console.log(`Llamando a la API interna: ${apiUrl}`);

            // Hacemos un fetch a nuestro propio Route Handler
            // 'no-store' es crucial para asegurar que los datos se obtienen en cada petición y no se cachean.
            const response = await fetch(apiUrl, { cache: 'no-store' }); 
            const data = await response.json();

            if (response.ok && data.success) {
                clientConfig = data.config;
            } else {
                // Si la respuesta no es ok o success es false, usamos el mensaje de la API
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

// La exportación por defecto de la página sigue siendo un componente SÍNCRONO
export default function Page(props: any) {
    const clientId = props.searchParams?.clientId;
    return <PortalPageContent clientId={clientId} />;
}
