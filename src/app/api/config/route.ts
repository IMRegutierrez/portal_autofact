import { NextResponse } from 'next/server';
import { getClientConfig } from '../../../lib/aws-config'; // La ruta sube tres niveles

// Interfaz para la configuración de AWS
interface AwsConfig {
    region: string | undefined;
    tableName: string | undefined;
}

export async function GET(request: Request) {
    // Leemos el clientId de los parámetros de la URL de la petición
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
        return NextResponse.json({ success: false, message: "clientId es requerido." }, { status: 400 });
    }

    // Leemos las variables de entorno aquí, en el entorno de la API
    const awsConfig: AwsConfig = {
        region: process.env.PORTAL_REGION,
        tableName: process.env.PORTAL_TABLE_NAME,
    };

    try {
        // Llamamos a la misma función que ya teníamos para obtener los datos de DynamoDB
        const clientConfig = await getClientConfig(clientId, awsConfig);

        if (!clientConfig) {
            return NextResponse.json({ success: false, message: `No se encontró configuración para el cliente '${clientId}'.` }, { status: 404 });
        }

        // Si todo sale bien, devolvemos la configuración
        return NextResponse.json({ success: true, config: clientConfig });

    } catch (error: any) {
        console.error("Error en el Route Handler:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
