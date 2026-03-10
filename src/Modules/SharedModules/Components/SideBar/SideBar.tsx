import { useEffect, useState } from "react";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./SideBar.css";

export default function SideBar() {
  const [breakPoint, setBreakpoint] = useState("no");
  const [isCollapse, setIsCollapse] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [toggleIcon, setToggleIcon] = useState(false);
  const [activeSideBar, setActiveSideBar] = useState("Dashboard");
  const { user } = useSelector((state) => state.user);

  const BreakPoint = () => {
    setBreakpoint(breakPoint === "sm" ? "no" : "sm");
    setToggleIcon(!toggleIcon);
  };

  const getSize = () => {
    setWindowWidth(window.innerWidth);
  };

  const toggelCollapse = () => {
    setIsCollapse(!isCollapse);
  };

  const handleActiveItem = (item: string) => {
    setActiveSideBar(item);
    setTimeout(() => {
      BreakPoint();
    }, 1000);
  };

  useEffect(() => {
    window.addEventListener("resize", getSize);
    if (windowWidth < 992 && window.innerWidth < 992) {
      setIsCollapse(true);
    } else {
      setIsCollapse(false);
    }
    if (windowWidth < 576 && window.innerWidth < 576) {
      setBreakpoint("sm");
    } else {
      setBreakpoint("no");
    }
    return () => {
      window.removeEventListener("resize", getSize);
    };
  }, [windowWidth]);

  return (
    <section>
      <div className="sidBar text-center">
        <Sidebar
          width="217px"
          breakPoint={breakPoint}
          collapsedWidth="65px"
          collapsed={isCollapse}
        >
          <Menu className="mt-sm-3">
            {/*collapse btn */}
            {window.innerWidth < 576 ? (
              ""
            ) : (
              <button
                onClick={window.innerWidth < 576 ? BreakPoint : toggelCollapse}
                className="btn-collapse z-10"
              >
                <i
                  className={`m-auto fa-solid  ${
                    isCollapse ? "fa-chevron-right" : "fa-chevron-left"
                  }`}
                ></i>
              </button>
            )}
            <div className="flex w-full flex-col gap-8 mt-3">
              <MenuItem
                data-title="Home"
                icon={
                  <i
                    className="fa-solid bg-[#FFEDDF] p-2 fa-1x text-2xl fa-house"
                    style={{ fontSize: "25px" }}
                  ></i>
                }
                component={
                  <Link
                    to={user?.role === "Instructor" ? "/dashboard" : "/test"}
                  />
                }
                className="mt-9 text-black"
                onClick={() => handleActiveItem("Dashboard")}
                active={activeSideBar === "Dashboard"}
              >
                Dashboard
              </MenuItem>
              {user?.role === "Instructor" ? (
                <>
                  <MenuItem
                    data-title="Students"
                    icon={
                      <i className="fa-solid bg-[#FFEDDF] p-2 fa-1x text-2xl fa-users-gear"></i>
                    }
                    component={<Link to="/dashboard/Students" />}
                    className="mt-2 text-black"
                    onClick={() => handleActiveItem("Students")}
                    active={activeSideBar === "Students"}
                  >
                    Students
                  </MenuItem>
                  <MenuItem
                    data-title="Groups"
                    icon={
                      <i className="fa-solid bg-[#FFEDDF] p-2 px-3 fa-1x text-2xl fa-layer-group"></i>
                    }
                    component={<Link to="/dashboard/Groups" />}
                    className="mt-2 text-black"
                    onClick={() => handleActiveItem("Groups")}
                    active={activeSideBar === "Groups"}
                  >
                    Groups
                  </MenuItem>
                </>
              ) : (
                ""
              )}

              <MenuItem
                data-title="Quizzes"
                icon={
                  <i className="fa-solid bg-[#FFEDDF] p-2 px-3 fa-1x text-2xl fa-paste"></i>
                }
                component={
                  <Link
                    to={
                      user?.role === "Instructor"
                        ? "/dashboard/Quizzes"
                        : "/test/quizzes"
                    }
                  />
                }
                className="mt-2 text-black"
                onClick={() => handleActiveItem("Quizzes")}
                active={activeSideBar === "Quizzes"}
              >
                Quizzes
              </MenuItem>
              {user?.role === "Instructor" ? (
                <MenuItem
                data-title="Results"
                icon={
                  <i className="fa-solid bg-[#FFEDDF] p-2 px-3 fa-1x text-2xl fa-square-poll-vertical"></i>
                }
                component={
                  <Link
                    to={
                      user?.role === "Instructor"
                        ? "/dashboard/results"
                        : "/test/results"
                    }
                  />
                }
                className="mt-2 text-black"
                onClick={() => handleActiveItem("Results")}
                active={activeSideBar === "Results"}
              >
                Results
              </MenuItem>
              ) : (
                ""
              )}
              
            </div>
          </Menu>
        </Sidebar>
        {/*toggle btn */}
        {window.innerWidth > 576 ? (
          ""
        ) : (
          <button
            onClick={BreakPoint}
            className="btn-toggle text-theme text-2xl"
          >
            <i
              className={
                !toggleIcon ? "fa-solid fa-bars" : "fa-solid fa-bars-staggered"
              }
            ></i>
          </button>
        )}
      </div>
    </section>
  );
}
