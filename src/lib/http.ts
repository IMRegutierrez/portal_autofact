/**
 * Lee la respuesta de un fetch como JSON de forma robusta.
 *
 * A diferencia de `response.json()`, no lanza el críptico
 * "Unexpected end of JSON input" cuando el cuerpo viene vacío o no es JSON
 * (típico cuando el Suitelet no está publicado, responde una página de error
 * de NetSuite, o falla el preflight CORS). En su lugar devuelve un mensaje
 * accionable con el código HTTP y un fragmento del cuerpo recibido.
 */
export async function readJsonResponse(response: Response): Promise<any> {
    const raw = await response.text();

    if (!raw || !raw.trim()) {
        throw new Error(
            `El servidor respondió vacío (HTTP ${response.status}). ` +
            `Verifica que el Suitelet esté publicado y disponible sin inicio de sesión.`
        );
    }

    try {
        return JSON.parse(raw);
    } catch {
        const snippet = raw.slice(0, 200).replace(/\s+/g, ' ').trim();
        throw new Error(
            `Respuesta no válida del servidor (HTTP ${response.status}): ${snippet}`
        );
    }
}
