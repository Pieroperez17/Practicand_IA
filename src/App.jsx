import './App.css'
import { useState } from 'react';
import QuizGame from './components/ContPreguntas.jsx';

function App() {
  const API_KEY = import.meta.env.VITE_LINK;
  const MODEL_NAME = 'gemini-2.0-flash';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(12);
  const [response, setResponse] = useState(null); // Cambiado a null inicialmente
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError('Por favor ingresa un tema');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse(null); // Resetear la respuesta antes de generar nuevas preguntas

    try {
      const prompt = `Genera ${count} preguntas sobre "${topic}" en formato JSON válido. Estructura requerida:
[
  {
    "pregunta": "Texto pregunta",
    "opciones": ["Op1", "Op2", "Op3", "Op4", "Op5"],
    "respuesta_correcta": "OpX",
    "dificultad": Alta | Media | Baja
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
        try {
          // Parsear el JSON aquí mismo
          const parsedQuestions = JSON.parse(jsonText);
          setResponse(parsedQuestions);
        } catch (e) {
          throw new Error('El formato de las preguntas generadas no es válido');
        }
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
          throw new Error('No se pudo extraer JSON válido de la respuesta');
        }
      }
      throw new Error('No se encontró JSON en la respuesta');
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
            value={topic} 
            placeholder='Ingresa aqui el tema que quieres practicar'
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
          />
          <button onClick={generateQuestions} disabled={isLoading}>
            {isLoading ? 'Generando...' : 'Generar 🔍'}
          </button>
        </div>
        <div className='countContainer'>
          <label htmlFor="count">Cantidad de preguntas:</label>
          <input 
            type="number" 
            id="count" 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))} 
            min="1" 
            max="20" 
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {isLoading && <div className="loading-message">Generando preguntas...</div>}
        
        {response && Array.isArray(response) && (
          <div className="response-container">
            <h1 style={{margin: 0}}>Preguntas Generadas:</h1>
            <QuizGame questions={response} />
          </div>
        )}
      </div>
    </>
  )
}

export default App