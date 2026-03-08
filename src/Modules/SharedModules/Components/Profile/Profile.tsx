import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import ChangePassword from "../../../AuthModule/Components/ChangePassword";
import { setUser } from "../../../../Redux/UserSlice";
import profileImage from "../../../../assets/images/profile.png";

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: { user: { user: { first_name: string; last_name: string; role: string; email: string; status?: string } | null } }) => state.user);
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(user?.first_name || "");
  const [editedLastName, setEditedLastName] = useState(user?.last_name || "");

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset values
      setEditedFirstName(user?.first_name || "");
      setEditedLastName(user?.last_name || "");
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    if (!editedFirstName.trim() || !editedLastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setIsSubmitting(true);
    
    // Update locally (Redux store and localStorage) since API doesn't support profile update
    const updatedUser = {
      ...user,
      first_name: editedFirstName,
      last_name: editedLastName,
    };
    dispatch(setUser(updatedUser));
    localStorage.setItem("userProfile", JSON.stringify(updatedUser));
    
    toast.success("Profile updated successfully!");
    setIsEditing(false);
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto p-6 mt-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center justify-center">
            <div className="relative">
              <img
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                src={profileImage}
                alt="Profile"
              />
            </div>
          </div>
          <h1 className="text-center text-white text-2xl font-bold mt-4">
            {isEditing ? `${editedFirstName} ${editedLastName}` : `${user?.first_name} ${user?.last_name}`}
          </h1>
          <p className="text-center text-blue-100 mt-1">{user?.role}</p>
        </div>

        {/* Profile Details */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Profile Information
            </h2>
            <button
              onClick={handleEditToggle}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditing 
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              {isEditing ? (
                <>
                  <i className="fa-solid fa-times mr-2"></i>
                  Cancel
                </>
              ) : (
                <>
                  <i className="fa-solid fa-edit mr-2"></i>
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {/* First Name */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <i className="fa-solid fa-user text-blue-600"></i>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm text-gray-500">First Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedFirstName}
                    onChange={(e) => setEditedFirstName(e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">
                    {user?.first_name || "N/A"}
                  </p>
                )}
              </div>
            </div>

            {/* Last Name */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <i className="fa-solid fa-user text-blue-600"></i>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm text-gray-500">Last Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLastName}
                    onChange={(e) => setEditedLastName(e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">
                    {user?.last_name || "N/A"}
                  </p>
                )}
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
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check mr-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fa-solid fa-key mr-2"></i>
                Change Password
              </button>
            )}
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

      {/* Change Password Modal */}
      <ChangePassword
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}
