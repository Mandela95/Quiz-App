import { useCallback, useEffect, useState } from "react";
import newQuizzPic from "../../../../assets/images/new quiz icon.svg";
import axios from "axios";
import { toast } from "react-toastify";
import quizzpic from "../../../../assets/images/Quiz img span.svg";
import { QuizJoinInterface } from "../../../../InterFaces/InterFaces";
import success from "../../../../assets/images/success.svg";
import { getBaseUrl } from "../../../../Utils/Utils";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

// Interface for quiz data
interface QuizData {
  _id: string;
  title: string;
  description?: string;
  status: string;
  difficulty: string;
  type: string;
  scpi?: number;
  schadule?: string;
  duration?: number;
  score_per_question?: number;
  questions_number?: number;
  participants?: number;
  closed_at?: string;
  createdAt?: string;
  updatedAt?: string;
  group?: string;
  code?: string;
  score?: number; // Student's score for completed quizzes
}

// Interface for student result data (from /api/quiz/result for student view)
interface StudentResult {
  quiz: {
    _id: string;
    title: string;
    difficulty?: string;
    type?: string;
    status?: string;
    score_per_question?: number;
    createdAt?: string;
  };
  score?: number;
}

// Interface for locally stored submitted quiz
interface SubmittedQuiz {
  _id: string;
  title: string;
  description?: string;
  difficulty: string;
  type: string;
  score: number;
  total: number;
  submittedAt: string;
}

export default function TestQuizzes() {
  const navigate = useNavigate();
  const { token } = useSelector(
    (state: { user: { token: string } }) => state.user
  );
  const [upcomingQuizList, setUpcomingQuizList] = useState<QuizData[]>([]);
  const [completedQuizList, setCompletedQuizList] = useState<QuizData[]>([]);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [submittedQuizzes, setSubmittedQuizzes] = useState<SubmittedQuiz[]>([]);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  // Load submitted quizzes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("submittedQuizzes");
    if (stored) {
      try {
        setSubmittedQuizzes(JSON.parse(stored));
      } catch {
        console.error("Failed to parse submitted quizzes from localStorage");
      }
    }
  }, []);

  const handleClose = () => {
    setOpenJoinModal(false);
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/test/quizzes/${quizId}`);
  };

  const onSubmit = async (data: { code?: string }) => {
    const formData = {
      ...data,
      code: data.code,
    };

    if (openJoinModal) {
      await JoinQuizSubmit(formData as QuizJoinInterface);
    }
  };

  const getUpcomingQuizz = useCallback(async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/quiz/incomming`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUpcomingQuizList(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to fetch upcoming quizzes");
      }
    }
  }, [token]);

  const getCompletedQuizz = useCallback(async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/quiz/completed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Handle different response structures
      let quizzes = response.data;
      
      // If response is wrapped in data property
      if (response.data && response.data.data) {
        quizzes = response.data.data;
      }
      
      // If it's not an array, try to extract quizzes
      if (!Array.isArray(quizzes)) {
        quizzes = [];
      }
      
      setCompletedQuizList(quizzes);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to fetch completed quizzes");
      }
    }
  }, [token]);

  // Fetch student's quiz results (alternative endpoint that may show submitted quizzes)
  const getStudentResults = useCallback(async () => {
    try {
      const response = await axios.get(`${getBaseUrl()}/api/quiz/result`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Handle different response structures
      let results = response.data;
      
      // If response is wrapped in data property
      if (response.data && response.data.data) {
        results = response.data.data;
      }
      
      // Ensure it's an array
      if (!Array.isArray(results)) {
        results = [];
      }
      
      setStudentResults(results);
    } catch (error) {
      // Silent fail - this might not work for students
    }
  }, [token]);

  const JoinQuizSubmit = async (formData: QuizJoinInterface) => {
    try {
      const response = await axios.post(
        `${getBaseUrl()}/api/quiz/join`,
        {
          code: formData.code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      handleClose();
      reset();
      setOpenSuccessModal(true);
      // Refresh quizzes after joining
      getUpcomingQuizz();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to join quiz");
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  useEffect(() => {
    if (token) {
      getCompletedQuizz();
      getUpcomingQuizz();
      getStudentResults();
    }
  }, [token, getCompletedQuizz, getUpcomingQuizz, getStudentResults]);

  // Filter out already submitted quizzes and closed quizzes from the upcoming list
  const submittedQuizIds = submittedQuizzes.map(q => q._id);
  const filteredUpcomingQuizzes = upcomingQuizList.filter(
    quiz => !submittedQuizIds.includes(quiz._id) && quiz.status !== "closed"
  );

  return (
    <>
      <div className="flex flex-col">
        <div className="flex md:flex-row p-5 md:container">
          <div className="p-5 xs:container">
            <button
              onClick={() => {
                setOpenJoinModal(true);
              }}
              className="w-full border border-gray-300 rounded-md flex flex-col items-center hover:bg-gray-300"
            >
              <img className="mt-6" src={newQuizzPic} alt="Join Quiz" />
              <p className="text-xl font-bold px-10 py-5">Join Quiz</p>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 p-10">
          {/* Upcoming Quizzes */}
          <div className="border border-gray-300 lg:w-6/12 rounded-lg">
            <p className="font-bold text-left p-5">Upcoming Quizzes</p>
            <div className="p-5">
              {filteredUpcomingQuizzes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No upcoming quizzes. Join a quiz using the code provided by your instructor.
                </p>
              ) : (
                filteredUpcomingQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="border border-gray-300 rounded-lg p-5 flex flex-row text-left mb-5 hover:shadow-md transition-shadow"
                  >
                    <img src={quizzpic} alt="Quiz" />
                    <div className="flex-col p-3 flex-1">
                      <p className="font-bold mb-2">{quiz.title}</p>
                      <p className="text-gray-600">
                        {formatDate(quiz.schadule || quiz.createdAt)}
                      </p>
                      <div className="flex flex-row justify-between mt-4">
                        <span className="text-sm text-gray-500">
                          Duration: {quiz.duration || "N/A"} min
                        </span>
                        <span className="text-sm text-gray-500 capitalize">
                          Difficulty: {quiz.difficulty || "N/A"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(quiz._id)}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
                      >
                        Start Quiz
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Quizzes */}
          <div className="border border-gray-300 lg:w-6/12 rounded-lg">
            <p className="font-bold text-left p-5">Completed Quizzes</p>
            <div className="p-5">
              {completedQuizList.length === 0 && studentResults.length === 0 && submittedQuizzes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No completed quizzes yet.
                </p>
              ) : (
                <>
                  {/* Show locally submitted quizzes (from localStorage) */}
                  {submittedQuizzes.map((quiz) => (
                    <div
                      key={`submitted-${quiz._id}`}
                      className="border border-green-300 bg-green-50 rounded-lg p-5 flex flex-row text-left mb-5"
                    >
                      <img src={quizzpic} alt="Quiz" />
                      <div className="flex-col p-3 flex-1">
                        <p className="font-bold mb-2">{quiz.title}</p>
                        <p className="text-gray-600">
                          Submitted: {formatDate(quiz.submittedAt)}
                        </p>
                        <div className="flex flex-row justify-between mt-4">
                          <span className="text-sm text-gray-500 capitalize">
                            Difficulty: {quiz.difficulty || "N/A"}
                          </span>
                          <span className="text-sm text-blue-600 font-semibold">
                            Score: {quiz.score} / {quiz.total}
                          </span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <span className="text-sm text-green-600 font-semibold">
                            ✓ Submitted
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show completed quizzes from /api/quiz/completed */}
                  {completedQuizList.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="border border-gray-300 rounded-lg p-5 flex flex-row text-left mb-5"
                    >
                      <img src={quizzpic} alt="Quiz" />
                      <div className="flex-col p-3 flex-1">
                        <p className="font-bold mb-2">{quiz.title}</p>
                        <p className="text-gray-600">
                          Completed: {formatDate(quiz.closed_at || quiz.updatedAt)}
                        </p>
                        <div className="flex flex-row justify-between mt-4">
                          <span className="text-sm text-gray-500 capitalize">
                            Difficulty: {quiz.difficulty || "N/A"}
                          </span>
                          {quiz.score !== undefined && (
                            <span className="text-sm text-blue-600 font-semibold">
                              Score: {quiz.score}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end mt-2">
                          <span className="text-sm text-green-600 font-semibold">
                            ✓ Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show student results from /api/quiz/result (fallback) */}
                  {studentResults.map((result) => (
                    <div
                      key={result.quiz._id}
                      className="border border-gray-300 rounded-lg p-5 flex flex-row text-left mb-5"
                    >
                      <img src={quizzpic} alt="Quiz" />
                      <div className="flex-col p-3 flex-1">
                        <p className="font-bold mb-2">{result.quiz.title}</p>
                        <p className="text-gray-600">
                          Completed: {formatDate(result.quiz.createdAt)}
                        </p>
                        <div className="flex flex-row justify-between mt-4">
                          <span className="text-sm text-gray-500 capitalize">
                            Difficulty: {result.quiz.difficulty || "N/A"}
                          </span>
                          {result.score !== undefined && (
                            <span className="text-sm text-blue-600 font-semibold">
                              Score: {result.score}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end mt-2">
                          <span className="text-sm text-green-600 font-semibold">
                            ✓ Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Join Quiz Modal */}
        <Dialog
          className="fixed inset-0 z-50 overflow-y-auto"
          open={openJoinModal}
          onClose={() => {
            setOpenJoinModal(false);
            reset();
          }}
        >
          <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

          <DialogPanel className="relative w-full max-w-md sm:max-w-lg m-auto mt-20 rounded-lg overflow-hidden bg-white shadow-lg">
            <div className="p-4 sm:p-6">
              <DialogTitle className="text-xl font-bold text-gray-800 text-center">
                Join Quiz
              </DialogTitle>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                <p className="font-semibold text-center mb-3">
                  Input the code received for the quiz below to join
                </p>
                <div className="mb-4">
                  <input
                    type="text"
                    {...register("code", { required: true })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter Quiz Code"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Join
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClose()}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </Dialog>

        {/* Success Modal */}
        <Dialog
          className="fixed inset-0 z-50 overflow-y-auto"
          open={openSuccessModal}
          onClose={() => {
            setOpenSuccessModal(false);
          }}
        >
          <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

          <DialogPanel className="relative w-full max-w-md sm:max-w-lg m-auto mt-20 rounded-lg overflow-hidden bg-white shadow-lg">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center">
                <img className="w-2/12 mb-5" src={success} alt="Success" />
                <p className="font-bold text-2xl mb-5">
                  Quiz Joined Successfully
                </p>
                <p className="text-gray-600 mb-4">
                  You can now see the quiz in your upcoming quizzes list.
                </p>
                <button
                  onClick={() => setOpenSuccessModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Got it!
                </button>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </div>
    </>
  );
}
