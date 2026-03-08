import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBaseUrl } from "../../../../Utils/Utils";
import { useSelector } from "react-redux";
import {
  SingleQuizInterface,
  SingleStudentInterface,
} from "../../../../InterFaces/InterFaces";
import quizImg from "../../../../assets/images/quizImg.png";
import studentImg from "../../../../assets/images/studentImg.png";
export default function Dashboard() {
  const { token } = useSelector(
    (state: { user: { token: string } }) => state.user
  );
  const [top5quizzes, setTop5quizzes] = useState<
    SingleQuizInterface[] | undefined
  >();
  const [top5students, setTop5students] = useState<
    SingleStudentInterface[] | undefined
  >();

  const getTop5Quizzes = useCallback(async () => {
    try {
      const res = await axios.get(`${getBaseUrl()}/api/quiz`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const slice5Quizzes = res.data.slice(0, 5);
      setTop5quizzes(slice5Quizzes);
    } catch (error) {
      console.log(error);
    }
  }, [token]);
  const getTop5Students = useCallback(async () => {
    try {
      const res = await axios.get(`${getBaseUrl()}/api/student`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const slice5students = res.data.slice(0, 5);
      setTop5students(slice5students);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    getTop5Quizzes();
    getTop5Students();
  }, [getTop5Quizzes, getTop5Students]);
  return (
    <div className="container w-full mt-4 flex items-start justify-center">
      <div className="flex items-center justify-around w-full gap-2 flex-wrap lg:flex-nowrap mx-3 mt-10">
        {/*left side */}
        <div className="left border border-gray-300 w-full p-4">
          <div className="header flex items-center justify-between p-4">
            <h4>Upcoming 5 quizzes</h4>
            <Link 
              to="/dashboard/quizzes"
              className="flex items-center justify-center text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
            >
              see all quizzes
              <i className="fa-solid fa-arrow-right-long mx-1"></i>
            </Link>
          </div>
          <hr />
          <div className="list p-2">
            {top5quizzes &&
              top5quizzes.length > 0 &&
              top5quizzes.map((quiz: SingleQuizInterface) => {
                const date = new Date(quiz.updatedAt);
                const formattedTime = date.toLocaleTimeString("en-US", {
                  hour12: false,
                });
                const formattedDate = new Date(quiz.updatedAt)
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })
                  .replace(/\//g, "/");
                return (
                  <div
                    key={quiz._id}
                    className="flex items-center w-full gap-3 border border-gray-300 rounded-md my-4"
                  >
                    <div className="quizImg">
                      <img src={quizImg} alt="..." className="size-24" />
                    </div>
                    <div className="content w-full flex flex-col gap-1 p-2">
                      <h1 className="font-semibold text-xl">{quiz.title}</h1>
                      <div className="flex items-start justify-start">
                        <p className="me-3">{formattedDate}</p> |
                        <p className="ms-3">{formattedTime}</p>
                      </div>
                      <div className="flex items-start justify-between">
                        <p> No. of student’s enrolled: {quiz.participants}</p>
                        <p className="flex items-center justify-center">
                          <span className="hidden sm:block">open</span>
                          <i className="fa fa-arrow-alt-circle-right mx-1"></i>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {/*right side */}
        <div className="left border border-gray-300 w-full p-4">
          <div className="header flex items-center justify-between p-4">
            <h4>Top 5 Students</h4>
            <Link 
              to="/dashboard/students"
              className="flex items-center justify-center text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
            >
              see all Students
              <i className="fa-solid fa-arrow-right-long mx-1"></i>
            </Link>
          </div>
          <hr />
          <div className="list p-2">
            {top5students &&
              top5students.length > 0 &&
              top5students.map((student: SingleStudentInterface) => {
                return (
                  <div
                    key={student._id}
                    className="flex items-center w-full gap-3 border border-gray-300 rounded-md my-4"
                  >
                    <div className="quizImg">
                      <img src={studentImg} alt="..." className="size-24" />
                    </div>
                    <div className="content w-full flex flex-col gap-4 p-2">
                      <h1 className="font-semibold text-xl">
                        {student.first_name} {student.last_name}
                      </h1>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start justify-start">
                          <p className="me-3">{student.email}</p> |
                          <p className="ms-3">{student.status}</p>
                        </div>
                        <div>
                          <i className="fa fa-arrow-alt-circle-right mx-1"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
