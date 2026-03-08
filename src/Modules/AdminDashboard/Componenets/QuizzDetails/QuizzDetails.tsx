import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { toast } from "react-toastify";
import { getBaseUrl } from "../../../../Utils/Utils";
import { useSelector } from "react-redux";

interface QuizDetailsType {
  title?: string;
  description?: string;
  schadule?: string;
  duration?: string;
  questions_number?: number;
  score_per_question?: string;
  difficulty?: string;
  type?: string;
  group?: string;
  status?: string;
  code?: string;
  participants?: number;
}

interface SelectOption {
  value: string | number;
  label: string | number;
}

interface QuizUpdateData {
  title?: string;
  description?: string;
  schadule?: string;
  duration?: string | number;
  questions_number?: string | number;
  score_per_question?: string | number;
  difficulty?: string | number;
}

export default function QuizzDetails() {
  const animatedComponents = makeAnimated();
  const { id } = useParams<{ id: string }>();
  const [quizDetails, setQuizDetails] = useState<QuizDetailsType>({});
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<SelectOption | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectOption | null>(null);
  const [selectedScore, setSelectedScore] = useState<SelectOption | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<SelectOption | null>(null);

  const handleClose = () => {
    setOpenEditModal(false);
  };

  const onSubmit = async (data: { title?: string; description?: string; schadule?: string }) => {
    const formData = {
      ...data,
      title: data.title,
      description: data.description,
      questions_number: selectedQuestions?.value,
      difficulty: selectedDifficulty?.value,
      schadule: data.schadule,
      duration: selectedDuration?.value,
      score_per_question: selectedScore?.value,
    };

    if (openEditModal) {
      await updateQuizz(formData);
    }
  };

  const durations = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
    { value: "60", label: "60" },
  ];
  const questions = [
    { value: 1, label: 1 },
    { value: 5, label: 5 },
    { value: 10, label: 10 },
    { value: 15, label: 15 },
    { value: 20, label: 20 },
    { value: 25, label: 25 },
  ];
  const score = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];
  const difficulty = [
    { value: "easy", label: "easy" },
    { value: "medium", label: "medium" },
    { value: "hard", label: "hard" },
  ];

  const { token } = useSelector(
    (state: { user: { token: string } }) => state.user
  );
  

  const getQuizzDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${getBaseUrl()}/api/quiz/${id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setQuizDetails(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message[0]);
      }
    }
  }, [id, token]);

  const updateQuizz = async (formData: QuizUpdateData) => {
    try {
      // Only send fields that have values to avoid API errors
      // Note: questions_number cannot be changed after quiz creation
      const updateData: Record<string, string | number | undefined> = {};
      
      if (formData.title) updateData.title = formData.title;
      if (formData.description) updateData.description = formData.description;
      if (formData.schadule) updateData.schadule = formData.schadule;
      if (formData.duration) updateData.duration = formData.duration;
      if (formData.score_per_question) updateData.score_per_question = formData.score_per_question;
      // Don't send questions_number or difficulty as they cannot be changed after creation
      
      const response = await axios.put(
        `${getBaseUrl()}/api/quiz/${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleClose();
      toast.success(response.data.message || "Quiz updated successfully");
      getQuizzDetails();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMsg = error.response.data.message;
        toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg || "Failed to update quiz");
      }
    }
  };

  // Close quiz - this moves it from "upcoming" to "completed"
  const closeQuiz = async () => {
    const confirmClose = window.confirm(
      "Are you sure you want to close this quiz? Students will no longer be able to take it."
    );
    if (!confirmClose) return;

    try {
      const response = await axios.put(
        `${getBaseUrl()}/api/quiz/${id}`,
        { status: "closed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message || "Quiz closed successfully");
      getQuizzDetails();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMsg = error.response.data.message;
        toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg || "Failed to close quiz");
      }
    }
  };

  // Re-open a closed quiz
  const reopenQuiz = async () => {
    try {
      const response = await axios.put(
        `${getBaseUrl()}/api/quiz/${id}`,
        { status: "open" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message || "Quiz reopened successfully");
      getQuizzDetails();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMsg = error.response.data.message;
        toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg || "Failed to reopen quiz");
      }
    }
  };

  const { register, handleSubmit } = useForm();

  useEffect(() => {
    getQuizzDetails();
  }, [getQuizzDetails]);

  return (
    <>
      <nav className="flex p-5" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              to={"/dashboard/Quizzes"}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="w-3 h-3 me-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              quizzes
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-3 h-3 mx-1 text-gray-400 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700 ms-1 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">
                quizz details
              </p>
            </div>
          </li>
        </ol>
      </nav>

      <div className="container p-5 sm:w-6/12 ">
        <div className="h-full p-5 border border-gray-300 rounded-lg">
          <h1 className="container text-2xl font-bold text-center sm:text-left">
            {quizDetails.title}
          </h1>
          <p className="mt-3 mb-5 font-semibold text-center sm:text-left">
            {quizDetails.schadule ? new Date(quizDetails.schadule).toLocaleString("en-US", {
              dateStyle: "short",
              timeStyle: "short",
            }) : "Not schaduled"}
          </p>
          <div className="container flex flex-row h-10 mb-5 border border-gray-300 rounded-lg lg:w-8/12">
            <p className="w-7/12 h-full p-2 font-bold bg-orange-100 rounded-lg">
              Duration
            </p>
            <p className="p-2 ml-2 font-semibold">{quizDetails.duration}</p>
          </div>
          <div className="container flex flex-row h-10 mb-5 border border-gray-300 rounded-lg lg:w-8/12">
            <p className="flex w-full h-full p-2 font-bold bg-orange-100 rounded-lg">
              Number of questions
            </p>
            <p className="p-2 ml-2 font-semibold">
              {quizDetails.questions_number}
            </p>
          </div>
          <div className="container flex flex-row h-10 mb-5 border border-gray-300 rounded-lg lg:w-8/12">
            <p className="flex flex-grow w-7/12 h-full p-2 font-bold bg-orange-100 rounded-lg">
              Score per question
            </p>
            <p className="p-2 ml-2 font-semibold">
              {quizDetails.score_per_question}
            </p>
          </div>
          <div className="container flex flex-col h-full mb-5 border border-gray-300 rounded-lg lg:w-8/12">
            <p className="w-full h-full p-2 font-bold bg-orange-100 rounded-lg">
              Description
            </p>
            <p className="p-2 ml-2 font-semibold">{quizDetails.description}</p>
          </div>
          
          {/* Status */}
          <div className="container flex flex-row h-10 mb-5 border border-gray-300 rounded-lg lg:w-8/12">
            <p className="w-7/12 h-full p-2 font-bold bg-orange-100 rounded-lg">
              Status
            </p>
            <p className={`p-2 ml-2 font-semibold capitalize ${
              quizDetails.status === "closed" ? "text-red-600" : "text-green-600"
            }`}>
              {quizDetails.status || "open"}
            </p>
          </div>
          
          {/* Quiz Code */}
          {quizDetails.code && (
            <div className="container flex flex-row h-10 mb-5 border border-gray-300 rounded-lg lg:w-8/12">
              <p className="w-7/12 h-full p-2 font-bold bg-orange-100 rounded-lg">
                Quiz Code
              </p>
              <p className="p-2 ml-2 font-semibold font-mono">{quizDetails.code}</p>
            </div>
          )}
          
          {/* Participants */}
          {quizDetails.participants !== undefined && (
            <div className="container flex flex-row h-10 mb-5 border border-gray-300 rounded-lg lg:w-8/12">
              <p className="w-7/12 h-full p-2 font-bold bg-orange-100 rounded-lg">
                Participants
              </p>
              <p className="p-2 ml-2 font-semibold">{quizDetails.participants}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end font-bold gap-3">
            {quizDetails.status !== "closed" ? (
              <button
                onClick={closeQuiz}
                className="flex items-center justify-around px-4 p-2 text-white bg-red-600 border rounded-full hover:bg-red-700"
              >
                <i className="fa-solid fa-lock mr-2"></i>
                <p>Close Quiz</p>
              </button>
            ) : (
              <button
                onClick={reopenQuiz}
                className="flex items-center justify-around px-4 p-2 text-white bg-green-600 border rounded-full hover:bg-green-700"
              >
                <i className="fa-solid fa-unlock mr-2"></i>
                <p>Reopen Quiz</p>
              </button>
            )}
            <button
              onClick={() => {
                setOpenEditModal(true);
              }}
              className="flex items-center justify-around w-24 p-2 text-white bg-black border rounded-full"
            >
              <i className="fa-solid fa-pencil"></i>
              <p>Edit</p>
            </button>
          </div>
        </div>
      </div>

      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto"
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
        }}
      >
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

        <DialogPanel className="relative w-full max-w-md m-auto mt-20 overflow-hidden bg-white rounded-lg shadow-lg sm:max-w-lg">
          <div className="p-4 sm:p-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Edit Quizz
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              <div className="mb-4">
                <input
                  type="text"
                  {...register("title")}
                  defaultValue={quizDetails.title}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Quiz Title"
                />
              </div>

              <label className="font-bold">Description</label>
              <div className="mb-4">
                <input
                  type="text"
                  {...register("description")}
                  defaultValue={quizDetails.description}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe the Quiz"
                />
              </div>

              <div className="flex justify-between font-bold">
                <label className="ml-7">No. of questions</label>
                <label className="mr-20">Difficulty</label>
              </div>

              <div className="flex justify-between w-full mb-4">
                <Select
                  closeMenuOnSelect={true}
                  components={animatedComponents}
                  options={questions}
                  value={selectedQuestions}
                  onChange={(e) => setSelectedQuestions(e as SelectOption)}
                  menuPortalTarget={document.body}
                  className="container mr-4"
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
                <Select
                  closeMenuOnSelect={true}
                  components={animatedComponents}
                  options={difficulty}
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e as SelectOption)}
                  menuPortalTarget={document.body}
                  className="container mr-4"
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>

              <label className="font-bold">schadule</label>
              <div className="mb-4">
                <input
                  type="datetime-local"
                  {...register("schadule")}
                  defaultValue={""}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex font-bold">
                <label>Score per question</label>
                <label className="ml-24">Duration</label>
              </div>

              <div className="flex justify-between w-full mb-4">
                <Select
                  closeMenuOnSelect={true}
                  components={animatedComponents}
                  options={score}
                  value={selectedScore}
                  onChange={(e) => setSelectedScore(e as SelectOption)}
                  menuPortalTarget={document.body}
                  className="container mr-4"
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
                <Select
                  closeMenuOnSelect={true}
                  components={animatedComponents}
                  options={durations}
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e as SelectOption)}
                  menuPortalTarget={document.body}
                  className="container mr-4"
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 mr-2 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleClose()}
                  className="px-4 py-2 text-gray-800 bg-gray-200 rounded-md shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
