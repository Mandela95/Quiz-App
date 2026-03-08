import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoginFormTypes } from "../../../../InterFaces/InterFaces";
import { setToken, setUser } from "../../../../Redux/UserSlice";
import {
  emailValidation,
  passwordValidation,
} from "../../../../Utils/InputValidations";
import { getBaseUrl } from "../../../../Utils/Utils";
import { FieldPassword, FieldText, SubmitBtn } from "../Input/InputField";

export default function Login() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormTypes>({
    defaultValues: {
      email: "mohamedelseady247@gmail.com",
      password: "Test@123",
  }});
  const dispatch = useDispatch();

  const onSubmit = async (data: LoginFormTypes) => {
    try {
      const response = await axios.post(
        `${getBaseUrl()}/api/auth/login`,
        data,
        {
          headers: {
            language: "ar",
          },
        }
      );

      toast.success(response.data.message);
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("userProfile", JSON.stringify(response.data.data.profile));
      dispatch(setToken(response.data.data.accessToken));
      dispatch(setUser(response.data.data.profile));

      response.data.data.profile.role === "Instructor"
        ? navigate("/dashboard")
        : navigate("/test");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to book");
      }
    }
  };
  return (
    <>
      <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
        <FieldText
          icon={
            <i
              className="fa-solid fa-envelope fa-lg"
              aria-label="email input"
            ></i>
          }
          label="Registered email address"
          name="email"
          validation={emailValidation}
          error={errors.email?.message}
          placeholder="Type your email"
          control={control}
        />
        <FieldPassword
          icon={
            <i
              className="fa-solid fa-key fa-lg"
              aria-label="password input"
            ></i>
          }
          label="Password"
          name="password"
          validation={passwordValidation}
          error={errors.password?.message}
          placeholder="Type your password"
          control={control}
        />
        <SubmitBtn name="Sign In" submitting={isSubmitting} />
      </form>
      <span className="text-white mt-56 flex justify-end me-8">
        Forgot password?
        <Link className="text-lime-300 ms-1" to={"/forget-password"}>
          click here
        </Link>
      </span>
    </>
  );
}
