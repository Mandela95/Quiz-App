import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ResponsivePaginationComponent from "react-responsive-pagination";
import "react-responsive-pagination/themes/classic.css";
import { toast } from "react-toastify";

import style from "../../AdminDashboard/Componenets/Quizzes/Questions.module.css";
import {
  GroupInterface,
  ResultsInterface,
} from "../../../InterFaces/InterFaces";
import { getBaseUrl } from "../../../Utils/Utils";
import NoData from "../../SharedModules/Components/NoData/NoData";

export default function TestResults() {
  const { token } = useSelector(
    (state: { user: { token: string } }) => state.user
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [results, setResults] = useState<ResultsInterface[]>([]);
  const [group, setGroup] = useState<GroupInterface>({
    _id: "",
    name: "",
    students: [],
  });
  const pageSize = 8;
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<ResultsInterface>({
    quiz: {
      _id: "",
      title: "",
      status: "",
      difficulty: "",
      type: "",
      instructor: "",
      group: "",
      score_per_question: 0,
      createdAt: "",
    },
    participants: [],
  });

  const getAllResults = useCallback(async () => {
    try {
      const res = await axios.get(`${getBaseUrl()}/api/quiz/result`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let resultsData = res.data;
      
      // If no results from the endpoint, try to get closed quizzes as fallback
      if (!resultsData || resultsData.length === 0) {
        const allQuizzesResponse = await axios.get(
          `${getBaseUrl()}/api/quiz`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Transform closed quizzes into result format
        const closedQuizzes = allQuizzesResponse.data.filter(
          (quiz: { status?: string }) => quiz.status === "closed"
        );
        
        resultsData = closedQuizzes.map((quiz: {
          _id: string;
          title: string;
          group?: string;
          difficulty?: string;
          type?: string;
          status?: string;
          score_per_question?: number;
          createdAt?: string;
          participants?: number;
        }) => ({
          quiz: {
            _id: quiz._id,
            title: quiz.title,
            group: quiz.group || "",
            difficulty: quiz.difficulty || "",
            type: quiz.type || "",
            instructor: "",
            status: quiz.status || "closed",
            score_per_question: quiz.score_per_question || 0,
            createdAt: quiz.createdAt || "",
          },
          participants: quiz.participants ? Array(quiz.participants).fill("participant") : [],
        }));
      }
      
      setResults(resultsData);
      setTotalPages(Math.ceil(resultsData.length / pageSize));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to fetch results");
      }
    }
  }, [token]);

  const getGroupDetails = useCallback(async () => {
    console.log(selectedResult);
    try {
      const res = await axios.get(
        `${getBaseUrl()}/api/group/${selectedResult.quiz.group}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroup(res.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to book");
      }
    }
  }, [token, selectedResult]);

  const handleClose = () => {
    setOpenViewModal(false);
  };

  useEffect(() => {
    getAllResults();
    getGroupDetails();
  }, [getAllResults, getGroupDetails, openViewModal]);

  // here a small calculate to display the number of questions according to the page number and every click we slice the array of questions
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentResults = results.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto mt-2 relative border border-gray-400 p-4 ">
      <div className="data-header flex justify-between items-center">
        <h2 className="font-bold text-xl">Completed Quizzes</h2>
      </div>
      {/* Table Data */}
      <div className={`project-body mt-2 container rounded-4 shadow px-4 py-5`}>
        <ul className={`${style.responsiveTableProjects} bg-black`}>
          {/* Table header */}
          <li className={`${style.tableHeader} text-white`}>
            <div className={`${style.col} ${style.col4}`}>Title</div>
            <div className={`${style.col} ${style.col3}`}>Group name</div>
            <div className={`${style.col} ${style.col3}`}>
              No. of persons in group
            </div>
            <div className={`${style.col} ${style.col1}`}>Participants</div>
            <div className={`${style.col} ${style.col1}`}>Date</div>
            <div className={`${style.col} ${style.col1}`}>actions</div>
          </li>
        </ul>

        {/* Table body */}
        <ul className={`${style.responsiveTableProjects} py-2`}>
          {currentResults.length > 0 ? (
            currentResults.map((res: ResultsInterface) => {
              const date = new Date(res.quiz.createdAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }
              );
              return (
                <li
                  key={res?.quiz?._id}
                  className={`${style.tableRow} py-0 px-4 gap-2`}
                >
                  <div
                    className={`${style.col} ${style.col4}`}
                    data-label="Title"
                  >
                    {res?.quiz?.title}
                  </div>
                  <div
                    className={`${style.col} ${style.col3}`}
                    data-label="status :"
                  >
                    {group.name ? group.name : res.quiz?.group}
                  </div>
                  <div
                    className={`${style.col} ${style.col3}`}
                    data-label="Difficulty :"
                  >
                    {res?.quiz?.difficulty}
                  </div>
                  <div
                    className={`${style.col} ${style.col1}`}
                    data-label="Type :"
                  >
                    {res?.participants?.length} participants
                  </div>
                  <div
                    className={`${style.col} ${style.col1}`}
                    data-label="Type :"
                  >
                    {date}
                  </div>
                  <div
                    className={`${style.col} ${style.col1} flex items-center justify-start`}
                    data-label="Actions :"
                  >
                    <ul className="flex items-center justify-start m-0 p-0">
                      <li
                        role="button"
                        className="px-3 py-1 pt-2 "
                        onClick={() => {
                          setOpenViewModal(true);
                          setSelectedResult(res);
                        }}
                      >
                        <div className="dropdown-div flex flex-col items-center gap-1 ">
                          <i className="fa-solid fa-eye"></i>
                          {window.innerWidth < 650 ? "" : <span>View</span>}
                        </div>
                      </li>
                    </ul>
                  </div>
                </li>
              );
            })
          ) : (
            <NoData />
          )}
        </ul>
      </div>

      {/* Pagination */}
      <div className="mt-5">
        <ResponsivePaginationComponent
          current={currentPage}
          total={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
      {/* Overlay and Modal */}
      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto"
        open={openViewModal}
        onClose={handleClose}
      >
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

        <DialogPanel className="relative w-full max-w-md sm:max-w-lg m-auto mt-20 rounded-lg overflow-hidden bg-white shadow-lg">
          <div className="p-4 sm:p-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              View Result
              <hr className="my-3" />
            </DialogTitle>

            <div className="w-full my-4">
              <div className={`${style.table_container} w-full`}>
                <div className={`${style.table_row} w-full`}>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3 w-1/4`}
                  >
                    <p className="font-bold text-lg">Title</p>
                  </div>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3 w-3/4`}
                  >
                    <p>{selectedResult?.quiz?.title}</p>
                  </div>
                </div>
                <div className={`${style.table_row} w-full`}>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3`}
                  >
                    <p className="font-bold text-lg">status</p>
                  </div>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3`}
                  >
                    <p>{selectedResult?.quiz?.status}</p>
                  </div>
                </div>
                <div className={`${style.table_row} w-full`}>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3`}
                  >
                    <p className="font-bold text-lg">Difficulty</p>
                  </div>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3`}
                  >
                    <p>{selectedResult?.quiz?.difficulty}</p>
                  </div>
                </div>
                <div className={`${style.table_row} w-full`}>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3`}
                  >
                    <p className="font-bold text-lg">Type</p>
                  </div>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3`}
                  >
                    <p>{selectedResult?.quiz?.type}</p>
                  </div>
                </div>
                <div className={`${style.table_row} w-full`}>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3`}
                  >
                    <p className="font-bold text-lg">instructor</p>
                  </div>
                  <div
                    className={`${style.table_cell} border border-gray-300 p-3`}
                  >
                    <p>{selectedResult?.quiz?.instructor}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
