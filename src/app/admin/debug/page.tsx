export const dynamic = 'force-dynamic';

export default function DebugPage() {
    const debugInfo = {
        NODE_ENV: process.env.NODE_ENV,
        HAS_ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
        HAS_REGION: !!process.env.PORTAL_REGION,
        HAS_ACCESS_KEY: !!process.env.PORTAL_ACCESS_KEY_ID,
        HAS_SECRET_KEY: !!process.env.PORTAL_SECRET_ACCESS_KEY,
        HAS_TABLE_NAME: !!process.env.PORTAL_TABLE_NAME,
        REGION_VALUE: process.env.PORTAL_REGION ? process.env.PORTAL_REGION : 'undefined',
        // Don't log actual secrets
    };

    return (
        <div className="p-8 font-mono">
            <h1 className="text-xl font-bold mb-4">Debug Info</h1>
            <pre className="bg-gray-100 p-4 rounded text-sm">
                {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <p className="mt-4 text-sm text-gray-600">
                If HAS_... is false, the environment variable is missing in Amplify.
            </p>
        </div>
    );
}
