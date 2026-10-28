import React, { useState } from 'react';
import type { QuizQuestion } from '../../types/block';
import { Language } from '../../types/language';
import { shuffledIndices } from '../../utils/shuffle';

/** A fresh option order per question, so the right answer is not always in the same position. */
const makeOptionOrders = (quiz: QuizQuestion[]) => Object.fromEntries(quiz.map((q) => [q.id, shuffledIndices(q.options.es.length)])) as Record<number, number[]>;

interface QuizViewProps {
  quiz: QuizQuestion[];
  /** XP granted the first time the quiz is passed. */
  quizXp: number;
  blockOrder: number;
  quizPassed: boolean;
  quizScore: number;
  onSaveQuizResult: (score: number, maxScore: number) => void;
  lang: Language;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quiz,
  quizXp,
  blockOrder,
  quizPassed,
  quizScore,
  onSaveQuizResult,
  lang,
}) => {
  const QUIZ = quiz;
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [optionOrders, setOptionOrders] = useState<Record<number, number[]>>(() => makeOptionOrders(quiz));
  const [submitted, setSubmitted] = useState<boolean>(false);
  /** Whether the quiz had already been passed before this attempt (XP is only granted once). */
  const [passedBefore, setPassedBefore] = useState<boolean>(quizPassed);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) score += 1;
    });
    return score;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setPassedBefore(quizPassed);
    setSubmitted(true);
    onSaveQuizResult(score, QUIZ.length);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setOptionOrders(makeOptionOrders(quiz));
  };

  const score = submitted ? calculateScore() : 0;
  const passingScore = Math.ceil(QUIZ.length * 0.7);
  const passed = score >= passingScore;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">
            {lang === 'es' ? `Examen de Evaluación: Bloque ${blockOrder}` : `Assessment Test: Block ${blockOrder}`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'es' ? 'Demuestra tu dominio conceptual de los fundamentos del qubit.' : 'Demonstrate your conceptual mastery of qubit fundamentals.'}
          </p>
          {quizPassed && <p className="mt-2 text-xs font-semibold text-emerald-400">
            {lang === 'es' ? `Aprobado anteriormente · mejor resultado ${quizScore}/${QUIZ.length}` : `Previously passed · best score ${quizScore}/${QUIZ.length}`}
          </p>}
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400 uppercase">{lang === 'es' ? 'Mínimo' : 'Minimum'}</span>
            <span className="block text-lg font-black text-emerald-400 font-mono">70% · {passingScore}/{QUIZ.length}</span>
        </div>
      </div>

      <div className="space-y-6">
        {QUIZ.map((q, idx) => {
          const selectedOption = userAnswers[q.id];
          const isCorrect = selectedOption === q.correctAnswer;

          return (
            <div
              key={q.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md"
            >
              <h3 className="text-sm font-extrabold text-slate-100 flex items-start space-x-2">
                <span className="text-indigo-400 font-mono">{idx + 1}.</span>
                <span>{q.question[lang]}</span>
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {(optionOrders[q.id] ?? q.options[lang].map((_, index) => index)).map((optIdx) => {
                  const opt = q.options[lang][optIdx];
                  let buttonStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800';

                  if (selectedOption === optIdx) {
                    buttonStyle = 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold';
                  }

                  if (submitted) {
                    if (optIdx === q.correctAnswer) {
                      buttonStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                    } else if (selectedOption === optIdx && !isCorrect) {
                      buttonStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      aria-pressed={selectedOption === optIdx}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${buttonStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <strong>{isCorrect ? (lang === 'es' ? '✨ Correcto:' : '✨ Correct:') : (lang === 'es' ? '❌ Explicación:' : '❌ Explanation:')}</strong> {q.explanation[lang]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-6 bg-slate-950/90 p-4 border border-slate-800 rounded-2xl shadow-2xl flex items-center justify-between backdrop-blur-md">
        {submitted ? (
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="text-xs text-slate-400 font-mono">{lang === 'es' ? 'Resultado:' : 'Score:'}</span>
              <span className={`block text-xl font-black ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {score} / {QUIZ.length} - {passed ? (lang === 'es' ? (passedBefore ? '¡Aprobado!' : `¡Aprobado! (+${quizXp} XP)`) : (passedBefore ? 'Passed!' : `Passed! (+${quizXp} XP)`)) : (lang === 'es' ? 'No aprobado: revisa las explicaciones y reintenta' : 'Not passed: review the explanations and retry')}
              </span>
            </div>
            <button
              onClick={resetQuiz}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
            >
              {lang === 'es' ? '🔄 Reintentar' : '🔄 Retry'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">
              {Object.keys(userAnswers).length} / {QUIZ.length}
            </span>
            <button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < QUIZ.length}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              🚀 {lang === 'es' ? 'Enviar respuestas' : 'Submit quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
