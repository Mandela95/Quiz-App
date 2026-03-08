import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useSelector((state: { user: { user: { first_name: string; last_name: string; role: string; email: string; status?: string } | null } }) => state.user);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 mt-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center justify-center">
            <div className="relative">
              <img
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
              />
            </div>
          </div>
          <h1 className="text-center text-white text-2xl font-bold mt-4">
            {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-center text-blue-100 mt-1">{user?.role}</p>
        </div>

        {/* Profile Details */}
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Profile Information
          </h2>

          <div className="space-y-4">
            {/* First Name */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <i className="fa-solid fa-user text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">First Name</p>
                <p className="text-gray-800 font-medium">
                  {user?.first_name || "N/A"}
                </p>
              </div>
            </div>

            {/* Last Name */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <i className="fa-solid fa-user text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Last Name</p>
                <p className="text-gray-800 font-medium">
                  {user?.last_name || "N/A"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                <i className="fa-solid fa-envelope text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">
                  {user?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                <i className="fa-solid fa-briefcase text-purple-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-gray-800 font-medium">
                  {user?.role || "N/A"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center pb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                <i className="fa-solid fa-circle-check text-yellow-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-gray-800 font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user?.status || "Active"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate("/change-password")}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fa-solid fa-key mr-2"></i>
              Change Password
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
