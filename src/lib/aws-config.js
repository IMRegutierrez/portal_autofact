import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Obtiene la configuración de un cliente desde la tabla de DynamoDB.
 * @param {string} clientId - El ID del cliente (leído desde la URL).
 * @param {object} awsConfig - Un objeto con las credenciales y configuración de AWS.
 * @param {string} awsConfig.accessKeyId - La clave de acceso de AWS.
 * @param {string} awsConfig.secretAccessKey - La clave secreta de AWS.
 * @param {string} awsConfig.region - La región de AWS.
 * @param {string} awsConfig.tableName - El nombre de la tabla de DynamoDB.
 * @returns {Promise<Object|null>} - Un objeto con la configuración del cliente o null si no se encuentra.
 */
export async function getClientConfig(clientId, awsConfig) {
    if (!clientId) {
        console.log("No se proporcionó clientId.");
        return null;
    }

    // --- CAMBIO AQUÍ ---
    // La función ahora recibe la configuración como un argumento en lugar de leer process.env.
    const { accessKeyId, secretAccessKey, region, tableName } = awsConfig;

    // Validamos que la configuración recibida sea completa.
    if (!region || !tableName || !accessKeyId || !secretAccessKey) {
        console.error("Error: La configuración de AWS proporcionada a getClientConfig está incompleta.");
        throw new Error("La configuración del servidor está incompleta.");
    }

    // Se configura el cliente de DynamoDB usando las credenciales y región pasadas como argumentos.
    const client = new DynamoDBClient({
        region: region,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
    });

    const docClient = DynamoDBDocumentClient.from(client);

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
        // Este error ahora podría indicar un problema de permisos o credenciales incorrectas.
        throw new Error("No se pudo conectar con el servicio de configuración. Verifique los permisos y las credenciales.");
    }
}
