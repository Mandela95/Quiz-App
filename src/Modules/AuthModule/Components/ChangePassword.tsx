import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getBaseUrl } from "../../../Utils/Utils";
import { passwordValidation } from "../../../Utils/InputValidations";

interface ChangePasswordForm {
  password: string;
  password_new: string;
  password_new_confirm: string;
}

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePassword({ isOpen, onClose }: ChangePasswordProps) {
  const { token } = useSelector(
    (state: { user: { token: string } }) => state.user
  );

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>();

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      const response = await axios.post(
        `${getBaseUrl()}/api/auth/change-password`,
        {
          password: data.password,
          password_new: data.password_new,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message || "Password changed successfully!");
      reset(); // Reset form
      onClose(); // Close modal
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to change password");
      }
    }
  };

  const handleModalClose = () => {
    reset(); // Reset form when closing
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleModalClose}
    >
      <div 
        className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                <i className="fa-solid fa-key text-blue-600 text-xl"></i>
              </div>
              <div>
                <h1 className="text-white text-lg font-bold">Change Password</h1>
                <p className="text-blue-100 text-sm">Update your account password</p>
              </div>
            </div>
            <button
              onClick={handleModalClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6">
          {/* Current Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="password"
                {...register("password", { required: "Current password is required" })}
                className={`w-full px-4 py-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter current password"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <i className="fa-solid fa-lock"></i>
              </div>
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <i className={`fa-solid ${showCurrentPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label
              htmlFor="password_new"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="password_new"
                {...register("password_new", passwordValidation)}
                className={`w-full px-4 py-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password_new ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter new password"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <i className="fa-solid fa-key"></i>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <i className={`fa-solid ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.password_new && (
              <p className="text-red-500 text-sm mt-1">{errors.password_new.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="mb-4">
            <label
              htmlFor="password_new_confirm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="password_new_confirm"
                {...register("password_new_confirm", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === watch("password_new") || "Passwords do not match",
                })}
                className={`w-full px-4 py-2 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password_new_confirm ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirm new password"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <i className="fa-solid fa-check-double"></i>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.password_new_confirm && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password_new_confirm.message}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Password Requirements:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><i className="fa-solid fa-check text-green-500 mr-1"></i>At least 6 characters</li>
                <li><i className="fa-solid fa-check text-green-500 mr-1"></i>One uppercase letter</li>
                <li><i className="fa-solid fa-check text-green-500 mr-1"></i>One lowercase letter</li>
                <li><i className="fa-solid fa-check text-green-500 mr-1"></i>One number</li>
                <li><i className="fa-solid fa-check text-green-500 mr-1"></i>One special character</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Changing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check mr-2"></i>
                  Change Password
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleModalClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              <i className="fa-solid fa-times mr-2"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
