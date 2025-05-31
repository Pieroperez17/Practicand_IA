import React, { useState, useEffect } from 'react';

const QuizGame = ({ questions = [] }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);

  // Validación inicial del array de preguntas
  useEffect(() => {
    if (!Array.isArray(questions) || questions.length === 0) {
      setError('No se proporcionaron preguntas o el formato es incorrecto');
    } else {
      const isValid = questions.every(q => 
        q.pregunta && 
        Array.isArray(q.opciones) && 
        q.respuesta_correcta && 
        q.dificultad
      );
      
      if (!isValid) {
        setError('El formato de las preguntas no es correcto');
      }
    }
  }, [questions]);

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <p>Por favor, verifica el formato de las preguntas.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer) => {
    if (!isAnswered && currentQuestion) {
      setSelectedAnswer(answer);
      setIsAnswered(true);
      
      if (answer === currentQuestion.respuesta_correcta) {
        setScore(score + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const getAnswerStyle = (option) => {
    if (!isAnswered || !currentQuestion) return {};
    
    if (option === currentQuestion.respuesta_correcta) {
      return { backgroundColor: 'green', color: 'white' };
    }
    
    if (option === selectedAnswer && option !== currentQuestion.respuesta_correcta) {
      return { backgroundColor: 'red', color: 'white' };
    }
    
    return {};
  };

  if (currentQuestionIndex >= questions.length) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h2>¡Quiz completado!</h2>
        <p>Tu puntuación final es: {score} / {questions.length}</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Cargando pregunta...</div>;
  }

  return (
    <div style={{ maxWidth: '90vw', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{margin : 0, padding: 0}} >Pregunta {currentQuestionIndex + 1} de {questions.length}</h3>
        <p style={{ fontWeight: 'bold', fontSize: 25, margin : 0, padding: 0 }}>{currentQuestion.pregunta}</p>
        <p style={{margin : 0, padding: 0}} >Dificultad: {currentQuestion.dificultad}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        {currentQuestion.opciones.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              margin: '12px 0',
              textAlign: 'left',
              fontSize: '20px',
              ...getAnswerStyle(option),
              cursor: isAnswered ? 'default' : 'pointer'
            }}
            disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>
      
      {isAnswered && (
        <button 
          onClick={handleNextQuestion}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            fontSize: '21px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'}
        </button>
      )}
    </div>
  );
};

export default QuizGame;