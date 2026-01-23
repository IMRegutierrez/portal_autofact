import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.PORTAL_REGION,
    // Si estás en Amplify, usa el Rol de IAM automáticamente.
    // Si estás en local, necesitarás tus credenciales en .env.local
});

const BUCKET_NAME = 'portalautofact'; // Asegúrate que este sea el nombre real de tu bucket

export async function uploadLogoToS3(file, fileName) {
    const fileBuffer = await file.arrayBuffer();
    
    const params = {
        Bucket: BUCKET_NAME,
        Key: `logos/${fileName}`, // Guardamos en una carpeta 'logos'
        Body: Buffer.from(fileBuffer),
        ContentType: file.type,
        // No usamos ACL='public-read' porque ahora usamos CloudFront, 
        // pero el archivo debe existir en el bucket.
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Retornamos la URL construida (aquí deberías poner tu dominio de CloudFront si ya lo tienes)
    // Si no tienes CloudFront aún, usa la de S3, pero recuerda el tema de permisos.
    // Ejemplo CloudFront: https://d12345abcdef.cloudfront.net/logos/${fileName}
    return `https://${BUCKET_NAME}.s3.${process.env.PORTAL_REGION}.amazonaws.com/logos/${fileName}`;
}