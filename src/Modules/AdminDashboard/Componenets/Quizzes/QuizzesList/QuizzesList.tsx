import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { toast } from "react-toastify";
import newQuizzPic from "../../../../../assets/images/new quiz icon.svg";
import quizzpic from "../../../../../assets/images/Quiz img span.svg";
import success from "../../../../../assets/images/success.svg";
import questionBank from "../../../../../assets/images/Vault icon.svg";
import vector from "../../../../../assets/images/Vector2.svg";
import {
  GroupInterface,
} from "../../../../../InterFaces/InterFaces";
import { getBaseUrl } from "../../../../../Utils/Utils";
import { Link, useNavigate } from "react-router-dom";

interface SelectOption {
  value: string | number;
  label: string | number;
}

interface GroupSelectOption {
  value: string;
  label: string;
}

interface QuizFormData {
  title?: string;
  description?: string;
  group?: string;
  questions_number?: string | number;
  difficulty?: string | number;
  type?: string | number;
  schadule?: string;
  duration?: string | number;
  score_per_question?: string | number;
}

export default function QuizzesList() {
  const navigate = useNavigate();
  const animatedComponents = makeAnimated();
  const [completedQuizList, setCompletedQuizList] = useState([]);
  const [upcomingQuizList, setUpcomingQuizList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [groups, setGroups] = useState<GroupSelectOption[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<SelectOption | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectOption | null>(null);
  const [selectedScore, setSelectedScore] = useState<SelectOption | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<SelectOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
  const [succesCode, setSuccessCode] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupSelectOption | null>(null);

  const handleOpenQuiz = (quizId: string) => {
    navigate(`/dashboard/quizzes/${quizId}`);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(succesCode)
      .then(() => {
        toast.success("Copied to clipboard !");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to Copy !");
      });
  };

  const { register, handleSubmit, reset } = useForm();

  const handleClose = () => {
    setOpenAddModal(false);
  };

  const onSubmit = async (data: { title?: string; description?: string; schadule?: string }) => {
    const formData = {
      ...data,
      title: data.title,
      description: data.description,
      group: selectedGroup?.value,
      questions_number: selectedQuestions?.value,
      difficulty: selectedDifficulty?.value,
      type: selectedCategory?.value,
      schadule: data.schadule,
      duration: selectedDuration?.value,
      score_per_question: selectedScore?.value,
    };

    if (openAddModal) {
      await createQuizSubmit(formData);
    }
  };

  const { token } = useSelector(
    (state: { user: { token: string } }) => state.user
  );

  {
    /* Select options START */
  }
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
  const type = [
    { value: "AE", label: "AE" },
    { value: "BE", label: "BE" },
    { value: "CE", label: "CE" },
    { value: "DE", label: "DE" },
    { value: "EE", label: "EE" },
    { value: "FE", label: "FE" },
  ];
  {
    /* Select options END */
  }

  {
    /* Api Requests START */
  }

  const getAllGroups = useCallback(async () => {
    try {
      const res = await axios.get(`${getBaseUrl()}/api/group`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(
        res.data.map((group: GroupInterface) => ({
          value: group._id,
          label: group.name,
        }))
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      }
    }
  }, [token]);

  const getCompletedQuizz = useCallback(async () => {
    try {
      // First try the completed endpoint
      const response = await axios.get(
        `${getBaseUrl()}/api/quiz/completed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let quizzes = response.data;
      
      // If no completed quizzes from the dedicated endpoint, fetch all and filter
      if (!quizzes || quizzes.length === 0) {
        const allQuizzesResponse = await axios.get(
          `${getBaseUrl()}/api/quiz`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Filter for closed quizzes
        quizzes = allQuizzesResponse.data.filter(
          (quiz: { status?: string }) => quiz.status === "closed"
        );
      }
      
      setCompletedQuizList(quizzes);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to fetch completed quizzes");
      }
    }
  }, [token]);

  const getUpcomingQuizz = useCallback(async () => {
    try {
      const response = await axios.get(
        `${getBaseUrl()}/api/quiz/incomming`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Filter out closed quizzes from upcoming
      const openQuizzes = response.data.filter(
        (quiz: { status?: string }) => quiz.status !== "closed"
      );
      setUpcomingQuizList(openQuizzes);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to fetch upcoming quizzes");
      }
    }
  }, [token]);

  const createQuizSubmit = async (formData: QuizFormData) => {
    try {
      const response = await axios.post(
        `${getBaseUrl()}/api/quiz`,
        {
          title: formData.title,
          description: formData.description,
          group: formData.group,
          questions_number: formData.questions_number,
          difficulty: formData.difficulty,
          type: formData.type,
          schadule: formData.schadule,
          duration: formData.duration,
          score_per_question: formData.score_per_question,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      handleClose();
      setOpenSuccessModal(true);
      setSuccessCode(response.data.data.code);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      }
    }
  };

  // const getGroupDetails = useCallback(async (groupId) => {
  //   try {
  //     const response = await axios.get(
  //       `${getBaseUrl()}/api/group/${groupId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     setGroupDetails((prevState) => ({
  //       ...prevState,
  //       [groupId]: response.data.name,
  //     }));
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response) {
  //       toast.error(error.response.data.message);
  //     }
  //   }
  // }, [token]);

  {
    /* Api Requests END */
  }

  useEffect(() => {
    getCompletedQuizz();
    getAllGroups();
    getUpcomingQuizz();
  }, [getCompletedQuizz, getAllGroups, getUpcomingQuizz]);

  return (
    <>
      <div className="flex flex-row justify-around flex-wrap">
        {/*New Quizz and Questions Bank*/}
        <div className="flex flex-wrap flex-row ms-3 justify-center sm:justify-start">
          <div className="py-4">
            <button
              onClick={() => {
                setOpenAddModal(true);
              }}
              className="border border-gray-300 rounded-md flex flex-col items-center hover:bg-gray-300"
            >
              <img className="mt-6" src={newQuizzPic} />
              <p className="text-lg sm:text-xl font-bold px-8 py-5 ">
                Set up a new quiz
              </p>
            </button>
          </div>

          <Link to="/dashboard/questions" className="p-5">
            <button className="border border-gray-300 rounded-md flex flex-col items-center hover:bg-gray-300">
              <img className="mt-6" src={questionBank} />
              <p className="text-lg sm:text-xl font-bold px-10 py-5 ">
                Questions Bank
              </p>
            </button>
          </Link>
        </div>

        {/*upcoming and completed quizz*/}
        <div className="flex flex-col p-5">
          <div className="border border-gray-300 w-full rounded-lg">
            <p className="font-bold text-left p-5">Upcoming quizzes</p>
            <div className="p-3">
              {upcomingQuizList.map(
                (
                  quiz: {
                    _id: string;
                    title: string;
                    participants: number;
                    schadule: string;
                  },
                  index
                ) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-3 flex flex-row text-left mb-5"
                  >
                    <img src={quizzpic} />
                    <div className="flex-col p-3">
                      <p className="font-bold mb-2">{quiz.title}</p>
                      <p>
                        {new Date(quiz.schadule).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                      <div className="flex flex-row justify-between mt-4 sm:font-bold ">
                        <p className="text-[16px] sm:text-lg">
                          No. of student's enrolled: {quiz.participants}
                        </p>
                        <button onClick={() => handleOpenQuiz(`${quiz._id}`)}>
                          <p className="hover:underline ml-10">Open</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end p-8">
        <div className="rounded-lg flex flex-col w-full items-end border border-gray-300">
          <div className="rounded-lg w-full flex flex-row justify-between">
            <p className="font-bold text-left p-5">Completed Quizzes</p>
            <button className="flex flext-row items-center p-5 hover:underline">
              <p className="mr-3">Results</p>
              <img src={vector} />
            </button>
          </div>

          <div className="w-full flex p-5 items-center justify-center m-auto">
            <table className="w-full border-separate border border-slate-400 text-center rounded m-auto">
              <thead className="bg-black text-white">
                <tr>
                  <th className="border border-slate-300 text-sm sm:text-xl">
                    Title
                  </th>
                  <th className="border border-slate-300 text-sm sm:text-xl px-2">
                    Group name
                  </th>
                  <th className="border border-slate-300 text-sm sm:text-xl px-2">
                    No. of persons in group
                  </th>
                  <th className="border border-slate-300 text-sm sm:text-xl">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {completedQuizList.map(
                  (quiz: {
                    _id: string;
                    title: string;
                    participants: number;
                    schadule: string;
                  }) => (
                    <tr key={quiz._id}>
                      <td className="border border-slate-300 text-sm sm:text-xl rounded p-5">
                        {quiz.title}
                      </td>
                      <td className="border border-slate-300 text-sm sm:text-xl rounded">
                        FirstGroup-MM
                      </td>
                      <td className="border border-slate-300 text-sm sm:text-xl rounded">
                        {quiz.participants}
                      </td>
                      <td className="border border-slate-300 text-sm sm:text-xl rounded p-3">
                        {new Date(quiz.schadule).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto"
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          reset();
        }}
      >
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

        <DialogPanel className="relative w-full max-w-md sm:max-w-lg m-auto mt-20 rounded-lg overflow-hidden bg-white shadow-lg">
          <div className="p-4 sm:p-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Set up a new Quiz
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              <div className="mb-4">
                <input
                  type="text"
                  {...register("title")}
                  defaultValue={""}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter Quiz Title"
                />
              </div>

              <label className="font-bold">Description</label>
              <div className="mb-4">
                <input
                  type="text"
                  {...register("description")}
                  defaultValue={""}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe the Quiz"
                />
              </div>

              <div className="flex justify-between font-bold">
                <label>Group name</label>
                <label className="ml-7">No. of questions</label>
                <label className="mr-20">Difficulty</label>
              </div>

              <div className="mb-4 flex w-full justify-between">
                <Select
                  closeMenuOnSelect={true}
                  components={animatedComponents}
                  options={groups}
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e as GroupSelectOption)}
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

              <label className="mr-10 font-bold">Category Type</label>
              <Select
                closeMenuOnSelect={true}
                components={animatedComponents}
                options={type}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e as SelectOption)}
                menuPortalTarget={document.body}
                className="container mr-4 mb-4"
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />

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

              <div className="mb-4 flex w-full justify-between">
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
                  className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Add
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

      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto"
        open={openSuccessModal}
        onClose={() => {
          setOpenSuccessModal(false);
          reset();
        }}
      >
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

        <DialogPanel className="relative w-full max-w-md sm:max-w-lg m-auto mt-20 rounded-lg overflow-hidden bg-white shadow-lg">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <img className="w-2/12 mb-5" src={success} />
              <p className="font-bold text-2xl mb-5">
                Quiz successfully created
              </p>
              <div className="flex flex-row justify-between w-6/12 h-10 border border-black rounded-xl">
                <p className="p-2 font-bold bg-orange-100 rounded-xl">CODE :</p>
                <p className="p-2">{succesCode}</p>
                <i
                  className="p-3 mr-3 fa fa-clipboard #0c0a09 hover:bg-gray-100 hover:cursor-pointer"
                  onClick={handleCopy}
                ></i>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
