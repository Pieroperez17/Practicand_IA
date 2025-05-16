document.addEventListener('DOMContentLoaded', function() {
    // Configuración inicial
    const API_KEY = ''; // ¡Reemplaza esto!
    const MODEL_NAME = 'gemini-2.0-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    // Elementos del DOM
    const generateBtn = document.getElementById('generateBtn');
    const topicInput = document.getElementById('topic');
    const countInput = document.getElementById('count');
    const responseDiv = document.getElementById('response');

    // Evento click del botón
    generateBtn.addEventListener('click', async function() {
        console.log('Botón clickeado'); // Depuración
        
        const topic = topicInput.value.trim();
        const count = parseInt(countInput.value) || 5;
        
        if (!topic) {
            responseDiv.textContent = 'Por favor ingresa un tema';
            return;
        }

        responseDiv.textContent = 'Generando preguntas...';
        console.log('Iniciando solicitud...'); // Depuración
        
        try {
            const prompt = `Genera ${count} preguntas sobre "${topic}" en formato JSON válido. Estructura requerida:
[
  {
    "pregunta": "Texto pregunta",
    "opciones": ["Op1", "Op2", "Op3", "Op4", "Op5"],
    "respuesta_correcta": "OpX",
    "dificultad": 1
  }
]`;

            console.log('Enviando solicitud a API...'); // Depuración
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.5
                    }
                })
            });

            console.log('Respuesta recibida', response); // Depuración
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
            }

            const data = await response.json();
            console.log('Datos completos:', data); // Depuración
            
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const jsonText = extractJson(data.candidates[0].content.parts[0].text);
                responseDiv.textContent = jsonText;
            } else {
                throw new Error('Formato de respuesta inesperado');
            }
        } catch (error) {
            console.error('Error completo:', error); // Depuración
            responseDiv.textContent = `Error: ${error.message}`;
        }
    });

    // Función para extraer JSON
    function extractJson(text) {
        try {
            // Intenta parsear directamente
            JSON.parse(text);
            return text;
        } catch {
            // Si falla, intenta extraer el JSON
            const jsonStart = text.indexOf('[');
            const jsonEnd = text.lastIndexOf(']');
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const potentialJson = text.slice(jsonStart, jsonEnd + 1);
                try {
                    JSON.parse(potentialJson);
                    return potentialJson;
                } catch (e) {
                    return `No se pudo extraer JSON válido. Error: ${e.message}\n\nTexto recibido:\n${text}`;
                }
            }
            return `No se encontró JSON en la respuesta:\n${text}`;
        }
    }
});