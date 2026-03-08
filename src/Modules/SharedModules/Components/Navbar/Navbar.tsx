import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import NavLogo from "../../../../assets/images/navLogo.png";
import { useSelector, useDispatch } from "react-redux";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s: { user: { user: { first_name: string; last_name: string; role: string; email: string } | null } }) => s.user);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userProfile");
    dispatch({ type: "user/setToken", payload: "" });
    dispatch({ type: "user/setUser", payload: null });
    navigate("/");
  };

  const getProfilePath = () => {
    return user?.role === "Instructor" ? "/dashboard/profile" : "/test/profile";
  };

  return (
    <>
      <nav className="w-full border border-b-slate-900">
        <div className="px-2 sm:px-6 lg:px-8 w-ful">
          <div className="relative flex items-center justify-around w-full h-16 lg:px-10">
            <div className="flex items-center justify-start flex-1">
              <div className="flex items-center flex-shrink-0">
                <img
                  className="w-auto h-8 ms-6 md:ms-0"
                  src={NavLogo}
                  alt="Your Company"
                />
              </div>
            </div>
            <div className="flex-1 hidden font-bold capitalize sm:flex title ms-auto">
              {location.pathname.slice(1) == "dashboard"
                ? "Dashboard"
                : location.pathname.slice(11)}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center gap-0 pr-2 md:gap-4 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <div className="items-center justify-center buttons felx">
                <button
                  type="button"
                  className="relative mx-1 text-xl text-gray-400 border rounded-full focus:outline-none size-10 md:size-12 border-b-slate-800"
                >
                  <i className="fa-solid fa-message"></i>
                </button>
                <button
                  type="button"
                  className="relative mx-1 text-xl text-gray-400 border rounded-full focus:outline-none size-10 md:size-12 border-b-slate-800"
                >
                  <i className="fa-solid fa-bell"></i>
                </button>
              </div>
              {/*user data */}
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="relative flex items-center justify-center gap-2 text-sm rounded-full focus:outline-none "
                    id="user-menu-button"
                    aria-expanded={isMenuOpen ? "true" : "false"}
                    aria-haspopup="true"
                    onClick={toggleMenu}
                  >
                    <img
                      className="rounded-full size-11"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <span>
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span>
                      <i className="fa fa-angle-down"> </i>
                    </span>
                  </button>
                </div>

                <div
                  className={`absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                    isMenuOpen ? "block" : "hidden"
                  }`}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <Link
                    to={getProfilePath()}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    id="user-menu-item-0"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    id="user-menu-item-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Change Password
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    id="user-menu-item-2"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
