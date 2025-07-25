import { getClientConfig } from '../lib/aws-config';
import PortalClientComponent from './PortalClientComponent'; // Importamos el nuevo componente de cliente

// Esta función se ejecuta en el servidor de AWS
export default async function Page({ searchParams }) {
    // Leemos el clientId del parámetro en la URL (ej. ?clientId=clienteprueba)
    const clientId = searchParams.clientId;

    let clientConfig = null;
    let error = null;

    if (clientId) {
        try {
            // Buscamos la configuración del cliente en DynamoDB
            clientConfig = await getClientConfig(clientId);
            if (!clientConfig) {
                error = `No se encontró una configuración válida para el cliente '${clientId}'.`;
            }
        } catch (e) {
            error = e.message;
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
