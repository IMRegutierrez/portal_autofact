import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// --- CAMBIO AQUÍ ---
// Leemos explícitamente tus variables de entorno con prefijo personalizado.
const credentials = {
    accessKeyId: process.env.PFACT_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.PFACT_AWS_SECRET_ACCESS_KEY,
};

const region = process.env.PFACT_AWS_REGION;
const tableName = process.env.PFACT_DYNAMODB_TABLE_NAME || 'PortalClientesConfig';


// Se configura el cliente de DynamoDB, pasándole explícitamente las credenciales y la región.
// Se añade una comprobación para asegurar que las variables existen.
const client = new DynamoDBClient({
    region: region,
    credentials: (credentials.accessKeyId && credentials.secretAccessKey) ? credentials : undefined,
});

const docClient = DynamoDBDocumentClient.from(client);

/**
 * Obtiene la configuración de un cliente desde la tabla de DynamoDB.
 * @param {string} clientId - El ID del cliente (leído desde la URL).
 * @returns {Promise<Object|null>} - Un objeto con la configuración del cliente o null si no se encuentra.
 */
export async function getClientConfig(clientId) {
    if (!clientId) {
        console.log("No se proporcionó clientId.");
        return null;
    }

    // Comprobación adicional para asegurar que las variables de entorno están cargadas.
    if (!region || !credentials.accessKeyId || !credentials.secretAccessKey) {
        console.error("Error: Faltan variables de entorno de AWS en la configuración del servidor.");
        throw new Error("La configuración del servidor está incompleta." + region + " " + credentials.accessKeyId + " " + credentials.secretAccessKey);
    }

    console.log(`Buscando configuración para el cliente: ${clientId} en la tabla: ${tableName}`);

    const command = new GetCommand({
        TableName: tableName,
        Key: {
            clientId: clientId,
        },
    });

    try {
        const response = await docClient.send(command);
        if (response.Item) {
            console.log("Configuración encontrada:", response.Item);
            return response.Item;
        } else {
            console.log(`No se encontró configuración para el cliente: ${clientId}`);
            return null;
        }
    } catch (error) {
        console.error("Error al obtener datos de DynamoDB:", error);
        throw new Error("No se pudo conectar con el servicio de configuración.");
    }
}