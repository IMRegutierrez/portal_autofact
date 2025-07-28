import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Obtiene la configuración de un cliente desde la tabla de DynamoDB.
 * @param {string} clientId - El ID del cliente (leído desde la URL).
 * @param {object} awsConfig - Un objeto con la configuración de AWS (región y nombre de la tabla).
 * @param {string | undefined} awsConfig.region
 * @param {string | undefined} awsConfig.tableName
 * @returns {Promise<Object|null>} - Un objeto con la configuración del cliente o null si no se encuentra.
 */
export async function getClientConfig(clientId, awsConfig) {
    if (!clientId) {
        console.log("No se proporcionó clientId.");
        return null;
    }

    const { region, tableName } = awsConfig;

    if (!region || !tableName) {
        console.error("Error: Faltan las variables de entorno PFACT_AWS_REGION o PFACT_DYNAMODB_TABLE_NAME.");
        throw new Error("La configuración del servidor está incompleta.");
    }

    // --- CORRECCIÓN AQUÍ ---
    // Se elimina el objeto 'credentials'. El SDK de AWS, al ejecutarse en un entorno
    // de AWS como Amplify, buscará y usará automáticamente los permisos del Rol de IAM asociado.
    const client = new DynamoDBClient({
        region: region,
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
        // Si este error ocurre ahora, es casi seguro un problema de permisos en el Rol de IAM.
        throw new Error("No se pudo conectar con el servicio de configuración. Verifique los permisos del Rol de IAM.");
    }
}
