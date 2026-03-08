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
import { toast } from "react-toastify";
import {
  StudentsInterface,
  GroupInterface,
} from "../../../../../InterFaces/InterFaces";
import { getBaseUrl } from "../../../../../Utils/Utils";
import NoData from "../../../../SharedModules/Components/NoData/NoData";
import studentImg from "../../../../../assets/images/studentImg.jpg"
import ResponsivePaginationComponent from "react-responsive-pagination";
import "react-responsive-pagination/themes/classic.css";
import style from "../Students.module.css";

const StudentsList = () => {
  const { token } = useSelector(
    (state: { user: { token: string } }) => state.user
  );
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setopenViewModal] = useState(false);
  const { handleSubmit, reset } = useForm();

  const [studentList, setStudentList] = useState([]);
  const [groups, setGroups] = useState<GroupInterface[]>([]);
  const [selectedStudentFirstName, setSelectedStudentFirstName] = useState("");
  const [selectedStudentLastName, setSelectedStudentLastName] = useState("");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");
  const [selectedStudentRole, setSelectedStudentRole] = useState("");

  const [selectedDeletedStudents, setSelectedDeletedStudents] = useState<{
    _id: string;
  }>({
    _id: "",
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 16;

  // Get all groups
  const getAllGroups = useCallback(async () => {
    try {
      const res = await axios.get(`${getBaseUrl()}/api/group`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups(res.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to fetch groups");
      }
    }
  }, [token]);

  // Get all students
  const getAllStudents = useCallback(async () => {
    try {
      const res = await axios.get(`${getBaseUrl()}/api/student`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudentList(res.data);
      setTotalPages(Math.ceil(res.data.length / pageSize));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      }
    }
  }, [token]);

  // close the modal for all
  const handleClose = () => {
    setOpenAddModal(false);
    setopenViewModal(false);
    setOpenDeleteModal(false);
    reset();
  };

  // view selected student
  const handleShowStudent = (student: StudentsInterface) => {
    setSelectedStudentFirstName(student.first_name);
    setSelectedStudentLastName(student.last_name);
    setSelectedStudentEmail(student.email);
    setSelectedStudentRole(student.role);
  };

  // delete the selected student
  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${getBaseUrl()}/api/student/${selectedDeletedStudents._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleClose();
      getAllStudents();
      toast.success(res.data.message);
      // setDeletedStudent(studentId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      }
    }
  };


  // here a small calculate to display the number of questions according to the page number and every click we slice the array of questions
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const students = studentList.slice(startIndex, endIndex);
  
  useEffect(() => {
    getAllStudents();
    getAllGroups();
  }, [getAllStudents, getAllGroups]);

  return (
    <>
    <div className="flex justify-center m-auto">
      <div className="container px-4 py-5 mt-5 shadow project-body head-bg rounded-4">
        <div>
          <section className="my-4">
            <h1 className="mb-3 text-xl text-bold">Students List</h1>
            <ul className={`${style.groups}`}>
              {groups.length > 0 ? (
                groups.map((group: GroupInterface) => (
                  <li key={group._id}>{group.name}</li>
                ))
              ) : (
                <li>No groups available</li>
              )}
            </ul>
            <ul className={`${style.responsiveTableProjects}`}>
              {students.length > 0 ? (
                students.map((student: StudentsInterface) => (
                  <li
                    key={student._id}
                    className={`${style.tableRow} flex flex-col sm:flex-row items-center justify-between`}
                  >
                    <div
                      className={`${style.col} flex justify-items-center`}
                      data-label="Name :"
                    >
                      <img style={{width: "40px"}} src={studentImg} alt="student image" />
                      <span style={{display: "flex", alignItems: "center"}}> {student?.first_name} {student?.last_name} </span>
                    </div>
                    <div
                      className={`${style.col} p-0 flex items-between justify-start sm:justify-end`}
                      data-label="Actions :"
                    >
                      <ul className="flex items-center justify-center gap-3 p-0 m-0">

                        {/* View button */}
                        <button
                          role="button"
                          className="mb-0"
                          onClick={() => {
                            setopenViewModal(true);
                            handleShowStudent(student)
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <i className="mx-2 fas fa-eye"></i>
                            <span className="hidden sm:inline">View</span>
                          </div>
                        </button>
                        {/* Delete button */}
                        <button
                          role="button"
                          className="mb-0"
                          onClick={() => {
                            setOpenDeleteModal(true);
                            setSelectedDeletedStudents(student)
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <i className="mx-2 fa-regular fa-trash-can"></i>
                            <span className="hidden sm:inline">Delete</span>
                          </div>
                        </button>
                      </ul>
                    </div>
                  </li>
                ))
              ) : (
                <NoData />
              )}
            </ul>
          </section>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto"
        open={openAddModal || openDeleteModal || openViewModal}
        onClose={() => {
          setOpenAddModal(false);
          setopenViewModal(false);
          setOpenDeleteModal(false);
          reset();
        }}
      >
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

        <DialogPanel className="relative w-full max-w-md m-auto mt-20 overflow-hidden bg-white rounded-lg shadow-lg sm:max-w-lg">
          <div className="p-4 sm:p-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              {openDeleteModal
                ? "Delete Student"
                : openViewModal
                  ? "Student Details"
                  : "Add Student"}
            </DialogTitle>
            <form onSubmit={handleSubmit(() => {
              if (openDeleteModal) {
                handleDelete();
              }
            })} className="mt-3">
              {openDeleteModal ? (
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete this student?
                </p>
              ) : (
                <>
                  <div>
                    <p className="">{`Name: ${selectedStudentFirstName} ${selectedStudentLastName}`}</p>
                    <p className="">{`Email: ${selectedStudentEmail}`}</p>
                    <p className="">{`Role: ${selectedStudentRole}`}</p>
                  </div>

                </>
              )}
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 mr-2 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {openDeleteModal ? "Delete" : openViewModal ? "View" : "Add"}
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
    </div>
    
      {/* Pagination */}

      <div className="m-5">
        <ResponsivePaginationComponent
          current={currentPage}
          total={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </>
  );
};

export default StudentsList;
