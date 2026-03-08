import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { getBaseUrl } from "../../../../Utils/Utils";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import success from "../../../../assets/images/success.svg";

interface Question {
  _id: string;
  title: string;
  description?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    _id?: string;
  };
  type: string;
  difficulty: string;
}

interface QuizDetails {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  score_per_question: number;
  questions_number: number;
  difficulty: string;
  type: string;
  status: string;
  questions: Question[];
}

interface Answer {
  question: string;
  answer: string;
}

export default function TakeQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useSelector(
    (state: { user: { token: string } }) => state.user
  );

  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null);

  const getQuizDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use the correct endpoint for students to get quiz questions without answers
      const response = await axios.get(
        `${getBaseUrl()}/api/quiz/without-answers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const quizData = response.data;
      
      // The API returns the quiz object with questions embedded
      // Questions should be in quizData.questions or quizData.questions_bank
      let questions: Question[] = [];
      
      // Check various possible locations for questions
      if (quizData.questions && Array.isArray(quizData.questions)) {
        questions = quizData.questions;
      } else if (quizData.questions_bank && Array.isArray(quizData.questions_bank)) {
        questions = quizData.questions_bank;
      } else if (quizData.data && quizData.data.questions) {
        questions = quizData.data.questions;
      }
      
      // Check if quiz is closed
      if (quizData.status === "closed") {
        toast.error("This quiz has been closed by the instructor.");
        navigate("/test/quizzes");
        return;
      }
      
      if (questions.length === 0) {
        toast.error("This quiz has no questions assigned.");
        navigate("/test/quizzes");
        return;
      }
      
      setQuiz({
        _id: quizData._id || id || "",
        title: quizData.title || "Quiz",
        description: quizData.description || "",
        duration: quizData.duration || 30,
        score_per_question: quizData.score_per_question || 1,
        questions_number: quizData.questions_number || questions.length,
        difficulty: quizData.difficulty || "medium",
        type: quizData.type || "MCQ",
        status: quizData.status || "open",
        questions: questions,
      });
      
      setTimeLeft((quizData.duration || 30) * 60);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to load quiz. You may not have access to this quiz.");
      }
      navigate("/test/quizzes");
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.question === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { question: questionId, answer };
        return updated;
      }
      return [...prev, { question: questionId, answer }];
    });
  };

  const getSelectedAnswer = (questionId: string): string | undefined => {
    return answers.find((a) => a.question === questionId)?.answer;
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    if (answers.length < quiz.questions.length) {
      const unanswered = quiz.questions.length - answers.length;
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirm) return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${getBaseUrl()}/api/quiz/submit/${id}`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success(response.data.message || "Quiz submitted successfully!");
      
      // The API returns data in response.data.data
      const resultData = response.data.data;
      const score = resultData?.score ?? 0;
      const total = quiz.questions.length * (quiz.score_per_question || 1);
      
      // Save submitted quiz to localStorage so it shows in "Completed Quizzes"
      const submittedQuiz = {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        type: quiz.type,
        score: score,
        total: total,
        submittedAt: new Date().toISOString(),
      };
      
      // Get existing submitted quizzes from localStorage
      const existingSubmitted = JSON.parse(localStorage.getItem("submittedQuizzes") || "[]");
      // Add new submission (avoid duplicates)
      const alreadyExists = existingSubmitted.some((q: { _id: string }) => q._id === quiz._id);
      if (!alreadyExists) {
        existingSubmitted.push(submittedQuiz);
        localStorage.setItem("submittedQuizzes", JSON.stringify(existingSubmitted));
      }
      
      setQuizResult({
        score: score,
        total: total,
      });
      setShowSuccessModal(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to submit quiz");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit will be triggered by the timeLeft reaching 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && quiz && quiz.questions.length > 0 && !isSubmitting && !showSuccessModal) {
      handleSubmitQuiz();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    if (token && id) {
      getQuizDetails();
    }
  }, [token, id, getQuizDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Quiz not found or has no questions.</p>
        <button
          onClick={() => navigate("/test/quizzes")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto p-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 mt-1">{quiz.description}</p>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className={`text-lg font-semibold px-4 py-2 rounded-lg ${
              timeLeft <= 60 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
          }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-600 capitalize mb-3">
            {currentQuestion.difficulty || "Medium"} • {currentQuestion.type || "Multiple Choice"}
          </span>
          <h2 className="text-xl font-semibold text-gray-800">
            {currentQuestionIndex + 1}. {currentQuestion.title}
          </h2>
          {currentQuestion.description && (
            <p className="text-gray-600 mt-2">{currentQuestion.description}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {Object.entries(currentQuestion.options)
            .filter(([key]) => ["A", "B", "C", "D"].includes(key))
            .map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleAnswerSelect(currentQuestion._id, key)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  getSelectedAnswer(currentQuestion._id) === key
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <span className={`inline-block w-8 h-8 text-center leading-8 rounded-full mr-3 ${
                  getSelectedAnswer(currentQuestion._id) === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {key}
                </span>
                <span className="text-gray-800">{value}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-2 rounded-md ${
            currentQuestionIndex === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-sm ${
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : answers.some((a) => a.question === quiz.questions[index]._id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next →
          </button>
        )}
      </div>

      {/* Answered Summary */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <p className="text-gray-600">
          Answered: {answers.length} / {quiz.questions.length} questions
        </p>
      </div>

      {/* Success Modal */}
      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto"
        open={showSuccessModal}
        onClose={() => {}}
      >
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

        <DialogPanel className="relative w-full max-w-md sm:max-w-lg m-auto mt-20 rounded-lg overflow-hidden bg-white shadow-lg">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <img className="w-20 mb-5" src={success} alt="Success" />
              <DialogTitle className="font-bold text-2xl mb-3">
                Quiz Submitted Successfully!
              </DialogTitle>
              {quizResult && (
                <p className="text-lg text-gray-600 mb-4">
                  Your Score: <span className="font-bold text-blue-600">{quizResult.score}</span> / {quizResult.total}
                </p>
              )}
              <button
                onClick={() => navigate("/test/quizzes")}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
