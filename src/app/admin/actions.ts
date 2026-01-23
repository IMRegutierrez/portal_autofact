'use server';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { uploadLogoToS3 } from "../../lib/s3-client";
import { revalidatePath } from "next/cache";

// Configuración del cliente DynamoDB (reutilizando variables de entorno)
const client = new DynamoDBClient({ region: process.env.PORTAL_REGION });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.PORTAL_TABLE_NAME;

export async function getClients() {
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
        });
        const response = await docClient.send(command);
        return { success: true, data: response.Items };
    } catch (error: any) {
        console.error("Error al obtener clientes:", error);
        return { success: false, error: error.message };
    }
}

export async function saveClient(formData: FormData) {
    try {
        const clientId = formData.get('clientId') as string;
        const clientName = formData.get('clientName') as string;
        const suiteletUrl = formData.get('suiteletUrl') as string;
        const reportSuiteletUrl = formData.get('reportSuiteletUrl') as string;
        const netsuiteCompId = formData.get('netsuiteCompId') as string;
        
        // Colores
        const backgroundColor = formData.get('backgroundColor') as string;
        const cardBackgroundColor = formData.get('cardBackgroundColor') as string;
        const buttonColor = formData.get('buttonColor') as string;
        
        // Manejo del Logo
        const logoFile = formData.get('logoFile') as File;
        let logoUrl = formData.get('currentLogoUrl') as string;

        if (logoFile && logoFile.size > 0) {
            const fileName = `${clientId}-${Date.now()}-${logoFile.name}`;
            logoUrl = await uploadLogoToS3(logoFile, fileName);
        }

        const item = {
            clientId,
            clientName,
            suiteletUrl,
            reportSuiteletUrl,
            netsuiteCompId,
            logoUrl,
            backgroundColor,
            cardBackgroundColor,
            buttonColor,
            // Puedes agregar más campos de estilo aquí
        };

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        });

        await docClient.send(command);
        
        // Revalidar la ruta para que la tabla se actualice visualmente
        revalidatePath('/admin');
        
        return { success: true };

    } catch (error: any) {
        console.error("Error al guardar cliente:", error);
        return { success: false, error: error.message };
    }
}