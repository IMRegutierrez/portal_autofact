import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Obtiene la configuración de un cliente desde la tabla de DynamoDB.
 * @param {string} clientId - El ID del cliente (leído desde la URL).
 * @param {object} awsConfig - Un objeto con las credenciales y configuración de AWS.
 * @param {string | undefined} awsConfig.accessKeyId
 * @param {string | undefined} awsConfig.secretAccessKey
 * @param {string | undefined} awsConfig.region
 * @param {string | undefined} awsConfig.tableName
 * @returns {Promise<Object|null>} - Un objeto con la configuración del cliente o null si no se encuentra.
 */
export async function getClientConfig(clientId, awsConfig) {
    if (!clientId) {
        console.log("No se proporcionó clientId.");
        return null;
    }

    const { accessKeyId, secretAccessKey, region, tableName } = awsConfig;

    // --- CORRECCIÓN AQUÍ ---
    // Se valida cada variable de entorno individualmente para un diagnóstico preciso.
    // Si alguna falta, se lanza un error específico que será capturado en page.tsx.
    if (!region) {
        throw new Error("La configuración del servidor está incompleta: La variable PFACT_AWS_REGION falta o está vacía.");
    }
    if (!tableName) {
        throw new Error("La configuración del servidor está incompleta: La variable PFACT_DYNAMODB_TABLE_NAME falta o está vacía.");
    }
    if (!accessKeyId) {
        throw new Error("La configuración del servidor está incompleta: La variable PFACT_AWS_ACCESS_KEY_ID falta o está vacía.");
    }
    if (!secretAccessKey) {
        throw new Error("La configuración del servidor está incompleta: La variable PFACT_AWS_SECRET_ACCESS_KEY falta o está vacía.");
    }

    // Ahora que sabemos que las variables existen, podemos usarlas de forma segura.
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
        throw new Error("No se pudo conectar con el servicio de configuración. Verifique los permisos y las credenciales.");
    }
}
