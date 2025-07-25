import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Configura el cliente de DynamoDB.
// Las credenciales (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) y la región (AWS_REGION)
// se tomarán automáticamente de las variables de entorno de Amplify.
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'PortalClientesConfig';

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

    console.log(`Buscando configuración para el cliente: ${clientId} en la tabla: ${TABLE_NAME}`);

    const command = new GetCommand({
        TableName: TABLE_NAME,
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
        // Lanza el error para que el componente de servidor pueda manejarlo.
        throw new Error("No se pudo conectar con el servicio de configuración.");
    }
}
