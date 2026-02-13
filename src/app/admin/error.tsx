'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Admin Panel Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 border-l-4 border-red-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Algo salió mal</h2>
                <p className="text-gray-600 mb-6">
                    Ha ocurrido un error inesperado en el panel de administración.
                </p>

                <div className="bg-red-50 p-4 rounded-md mb-6 overflow-auto max-h-40">
                    <p className="text-sm font-mono text-red-800 break-words">
                        {error.message || "Error desconocido"}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-red-500 mt-2">Digest: {error.digest}</p>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => reset()}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition"
                    >
                        Intentar de nuevo
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition"
                    >
                        Recargar página
                    </button>
                </div>
            </div>
        </div>
    );
}
