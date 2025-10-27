// Este es el código de tu backend: /api/proxyGroq.js

// Usamos sintaxis de Node.js (el backend)
export default async function handler(req, res) {
    
    // 1. Solo permitir solicitudes POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // 2. Obtener la clave secreta de Groq desde las "Variables de Entorno" de Vercel
    // "process.env.GROQ_API_KEY" es la forma segura de leerla
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: "La clave API de Groq no está configurada en el servidor." });
    }

    // 3. Obtener el cuerpo de la solicitud que envió el frontend (app.js)
    const requestBody = req.body;

    try {
        // 4. Llamar a la API de Groq (¡desde el servidor!)
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Añadimos la clave secreta aquí, en el backend
                'Authorization': `Bearer ${GROQ_API_KEY}` 
            },
            body: JSON.stringify(requestBody) // Reenviamos el cuerpo de la solicitud
        });

        if (!groqResponse.ok) {
            // Si Groq da un error, pasarlo al frontend
            const errorData = await groqResponse.json();
            return res.status(groqResponse.status).json(errorData);
        }

        // 5. Devolver la respuesta de Groq al frontend (app.js)
        const data = await groqResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Error en la función del proxy:", error);
        res.status(500).json({ error: error.message });
    }
}