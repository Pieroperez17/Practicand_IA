import './App.css'
import { useState } from 'react';


function App() {
  const API_KEY = import.meta.env.VITE_LINK;
  const MODEL_NAME = 'gemini-2.0-flash';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError('Por favor ingresa un tema');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('Generando preguntas...');

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

      const apiResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.5
          }
        })
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`Error ${apiResponse.status}: ${errorData.error?.message || 'Error desconocido'}`);
      }

      const data = await apiResponse.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const jsonText = extractJson(data.candidates[0].content.parts[0].text);
        setResponse(jsonText);
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      console.error('Error completo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const extractJson = (text) => {
    try {
      JSON.parse(text);
      return text;
    } catch {
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const potentialJson = text.slice(jsonStart, jsonEnd + 1);
        try {
          JSON.parse(potentialJson);
          return potentialJson;
        } catch (e) {
          return `No se pudo extraer JSON válido. Error: ${e instanceof Error ? e.message : String(e)}\n\nTexto recibido:\n${text}`;
        }
      }
      return `No se encontró JSON en la respuesta:\n${text}`;
    }
  };


  return (
    <>
      <div className="Initial">
        <h1>🧑‍💻Practicand-IA</h1>
      </div>
      <div>
        <div className='prontContainer'>
          <input 
            type="text" 
            name="" 
            id="" 
            value={topic} 
            placeholder='Ingresa aqui el tema que quieres practicar'
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            />
          <button onClick={generateQuestions} disabled={isLoading}>
            {isLoading ? 'Generando...' : 'Generar 🔍'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        <div className="response-container">
          {response && (
            <pre>{response}</pre>
          )}
        </div>
      </div>
    </>
  )
}

export default App
