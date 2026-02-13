'use server';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// --- Configuration ---
// Inicializamos el cliente aquí para usarlo en las Server Actions
const client = new DynamoDBClient({
    region: process.env.PORTAL_REGION,
    credentials: {
        accessKeyId: process.env.PORTAL_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.PORTAL_SECRET_ACCESS_KEY || '',
    },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.PORTAL_TABLE_NAME;

// --- Authentication Helper ---
async function isAuthenticated() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin_auth');
    return authCookie?.value === process.env.ADMIN_PASSWORD;
}

// --- Server Actions ---

export async function login(formData: FormData) {
    const password = formData.get('password') as string;

    if (password === process.env.ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        // Set cookie manually since we are in a Server Action
        cookieStore.set('admin_auth', password, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });
        redirect('/admin/dashboard');
    } else {
        return { error: 'Contraseña incorrecta' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_auth');
    redirect('/admin/login');
}

export async function getClients() {
    if (!(await isAuthenticated())) {
        throw new Error("Unauthorized");
    }

    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
        });
        const response = await docClient.send(command);
        // Ordenar por nombre de cliente
        return (response.Items || []).sort((a: any, b: any) =>
            (a.clientName || '').localeCompare(b.clientName || '')
        );
    } catch (error) {
        console.error("Error scanning clients:", error);
        throw new Error("Failed to fetch clients");
    }
}

export async function getClient(clientId: string) {
    if (!(await isAuthenticated())) {
        throw new Error("Unauthorized");
    }

    try {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { clientId },
        });
        const response = await docClient.send(command);
        return response.Item;
    } catch (error) {
        console.error("Error fetching client:", error);
        throw new Error("Failed to fetch client");
    }
}

export async function saveClient(data: any) {
    if (!(await isAuthenticated())) {
        throw new Error("Unauthorized");
    }

    // Validación básica
    if (!data.clientId || !data.clientName) {
        return { error: "Faltan campos obligatorios (ID o Nombre)" };
    }

    try {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: data,
        });
        await docClient.send(command);
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error saving client:", error);
        return { error: "Error al guardar en DynamoDB" };
    }
}

export async function deleteClient(clientId: string) {
    if (!(await isAuthenticated())) {
        throw new Error("Unauthorized");
    }

    try {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { clientId },
        });
        await docClient.send(command);
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error deleting client:", error);
        return { error: "Error al eliminar cliente" };
    }
}
