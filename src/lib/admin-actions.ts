'use server';

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// --- Configuration Helper ---
function getDbClient() {
    const region = process.env.PORTAL_REGION;
    const accessKeyId = process.env.PORTAL_ACCESS_KEY_ID;
    const secretAccessKey = process.env.PORTAL_SECRET_ACCESS_KEY;

    if (!region || !accessKeyId || !secretAccessKey) {
        console.error("Missing AWS Configuration:");
        console.error("REGION:", region ? "Set" : "Missing");
        console.error("ACCESS_KEY:", accessKeyId ? "Set" : "Missing");
        console.error("SECRET_KEY:", secretAccessKey ? "Set" : "Missing");
        throw new Error("AWS credentials are not configured on the server.");
    }

    const client = new DynamoDBClient({
        region: region,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
    });

    return DynamoDBDocumentClient.from(client);
}

const TABLE_NAME = process.env.PORTAL_TABLE_NAME || 'PortalClientes';

// --- Authentication Helper ---
async function isAuthenticated() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin_auth');
    if (!process.env.ADMIN_PASSWORD) {
        console.error("ADMIN_PASSWORD environment variable is not set!");
        return false;
    }
    return authCookie?.value === process.env.ADMIN_PASSWORD;
}

// --- Server Actions ---

export async function login(formData: FormData) {
    const password = formData.get('password') as string;

    if (!process.env.ADMIN_PASSWORD) {
        return { error: 'Error del servidor: Contraseña de administración no configurada.' };
    }

    if (password === process.env.ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set('admin_auth', password, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });
    } else {
        return { error: 'Contraseña incorrecta' };
    }

    // Redirect must happen outside try/catch or be re-thrown if caught
    redirect('/admin/dashboard');
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
        const docClient = getDbClient();
        const command = new ScanCommand({
            TableName: TABLE_NAME,
        });
        const response = await docClient.send(command);
        return (response.Items || []).sort((a: any, b: any) =>
            (a.clientName || '').localeCompare(b.clientName || '')
        );
    } catch (error) {
        console.error("Error scanning clients:", error);
        throw new Error("Error al obtener los clientes. Revise los logs del servidor.");
    }
}

export async function getClient(clientId: string) {
    if (!(await isAuthenticated())) {
        throw new Error("Unauthorized");
    }

    try {
        const docClient = getDbClient();
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { clientId },
        });
        const response = await docClient.send(command);
        return response.Item;
    } catch (error) {
        console.error("Error fetching client:", error);
        throw new Error("Error al obtener el cliente.");
    }
}

export async function saveClient(data: any) {
    if (!(await isAuthenticated())) {
        return { error: "No autorizado" };
    }

    // Validación básica
    if (!data.clientId || !data.clientName) {
        return { error: "Faltan campos obligatorios (ID o Nombre)" };
    }

    try {
        const docClient = getDbClient();
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: data,
        });
        await docClient.send(command);
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error("Error saving client:", error);
        return { error: `Error al guardar: ${error.message}` };
    }
}

export async function deleteClient(clientId: string) {
    if (!(await isAuthenticated())) {
        return { error: "No autorizado" };
    }

    try {
        const docClient = getDbClient();
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { clientId },
        });
        await docClient.send(command);
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting client:", error);
        return { error: `Error al eliminar: ${error.message}` };
    }
}
