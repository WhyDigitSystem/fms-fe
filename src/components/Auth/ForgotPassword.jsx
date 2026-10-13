import Lottie from "lottie-react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api/authAPI";
import truckAnimation from "../../assets/lottieflow-ecommerce.json";
import { loginStart, stopLoading } from "../../store/slices/authSlice";
import { encryptPassword } from "../../utils/PasswordEnc";

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState("email"); // 'email', 'verify', 'reset', 'success'
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    dispatch(loginStart());
    try {
      await authAPI.forgotPassword({ email: formData.email });
      setStep("verify");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP");
      return;
    }

    dispatch(loginStart());
    try {
      await authAPI.verifyResetOtp({
        email: formData.email,
        otp: formData.otp,
      });
      setStep("reset");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.newPassword || !formData.confirmNewPassword) {
      setErrorMessage("Please enter and confirm your new password");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    dispatch(loginStart());
    try {
      await authAPI.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: encryptPassword(formData.newPassword),
      });
      setStep("success");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleBackToLogin = () => {
    onBackToLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 bg-white dark:bg-gray-900">
        <div className="mx-auto w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Efit WMS
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Password Recovery
                </p>
              </div>
            </div>

            {/* Dynamic Headings */}
            {step === "email" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Reset Your Password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email to receive a verification code
                </p>
              </>
            )}
            {step === "verify" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Verify Your Email
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter the OTP sent to {formData.email}
                </p>
              </>
            )}
            {step === "reset" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Create New Password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your new password below
                </p>
              </>
            )}
            {step === "success" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Password Reset Successful!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your password has been updated successfully
                </p>
              </>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          {/* Forms */}
          {step === "email" && (
            <form className="space-y-5" onSubmit={handleSendResetOtp}>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {step === "verify" && (
            <form className="space-y-5" onSubmit={handleVerifyResetOtp}>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We sent a verification OTP to your email address
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  className="w-full text-center text-2xl font-mono tracking-widest px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || formData.otp.length !== 6}
                className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Password Updated!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your password has been reset successfully. You can now login
                  with your new password.
                </p>
              </div>
              <button
                onClick={handleBackToLogin}
                className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2 text-xs mt-4">
              <Shield className="h-4 w-4" />
              <span>Your data is securely encrypted</span>
            </div>
            <p className="mt-3 text-xs">
              © 2025 Why Digit System Private Limited · Made with ❤️ in India
            </p>
          </div>
        </div>
      </div>

      {/* Right: Animation Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/10 p-4 shadow-xl">
                <Lottie
                  animationData={truckAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                Secure Account Recovery
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Protected & Encrypted
                </span>
              </h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold text-base">
                      Secure Recovery
                    </h4>
                    <p className="text-blue-100/80 text-xs">
                      OTP verified process
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold text-base">
                      Encrypted
                    </h4>
                    <p className="text-blue-100/80 text-xs">
                      End-to-end protection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { ArrowLeft, Lock, Mail, Shield, Truck, Eye, EyeOff } from "lucide-react";
// import Lottie from "lottie-react";
// import truckAnimation from "../../assets/lottieflow-ecommerce.json";
// import { loginStart, stopLoading } from "../../store/slices/authSlice";
// import { encryptPassword } from "../../utils/PasswordEnc";

// const ForgotPassword = ({ onBackToLogin }) => {
//   const [step, setStep] = useState("email"); // 'email', 'verify', 'reset', 'success'
//   const [formData, setFormData] = useState({
//     email: "",
//     otp: "",
//     newPassword: "",
//     confirmNewPassword: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [generatedOtp, setGeneratedOtp] = useState("");
//   const { loading } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   // Mock API functions
//   const mockForgotPassword = (email) => {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         // Generate random 6-digit OTP
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         setGeneratedOtp(otp);

//         console.log("Mock: OTP sent to", email, "->", otp);

//         // Simulate API call
//         if (email) {
//           resolve({ success: true, message: "OTP sent successfully" });
//         } else {
//           reject({ message: "Email is required" });
//         }
//       }, 1500);
//     });
//   };

//   const mockVerifyResetOtp = (email, otp) => {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         console.log("Mock: Verifying OTP", otp, "against", generatedOtp);

//         if (otp === generatedOtp) {
//           resolve({ success: true, message: "OTP verified successfully" });
//         } else {
//           reject({ message: "Invalid OTP. Please try again." });
//         }
//       }, 1000);
//     });
//   };

//   const mockResetPassword = (email, otp, newPassword) => {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         console.log("Mock: Resetting password for", email);
//         console.log("Mock: New password (encrypted):", encryptPassword(newPassword));

//         if (otp === generatedOtp) {
//           resolve({ success: true, message: "Password reset successfully" });
//         } else {
//           reject({ message: "Invalid OTP" });
//         }
//       }, 1000);
//     });
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//     if (errorMessage) setErrorMessage("");
//   };

//   const handleSendResetOtp = async (e) => {
//     e.preventDefault();
//     if (!formData.email) {
//       setErrorMessage("Please enter your email address");
//       return;
//     }

//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       setErrorMessage("Please enter a valid email address");
//       return;
//     }

//     dispatch(loginStart());
//     try {
//       await mockForgotPassword(formData.email);
//       setStep("verify");
//       setErrorMessage("");
//     } catch (error) {
//       setErrorMessage(error?.message || "Failed to send OTP. Please try again.");
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleVerifyResetOtp = async (e) => {
//     e.preventDefault();
//     if (!formData.otp || formData.otp.length !== 6) {
//       setErrorMessage("Please enter a valid 6-digit OTP");
//       return;
//     }

//     dispatch(loginStart());
//     try {
//       await mockVerifyResetOtp(formData.email, formData.otp);
//       setStep("reset");
//       setErrorMessage("");
//     } catch (error) {
//       setErrorMessage(error?.message || "Invalid OTP. Please try again.");
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.newPassword || !formData.confirmNewPassword) {
//       setErrorMessage("Please enter and confirm your new password");
//       return;
//     }

//     if (formData.newPassword.length < 6) {
//       setErrorMessage("Password must be at least 6 characters long");
//       return;
//     }

//     if (formData.newPassword !== formData.confirmNewPassword) {
//       setErrorMessage("Passwords do not match");
//       return;
//     }

//     dispatch(loginStart());
//     try {
//       await mockResetPassword(formData.email, formData.otp, formData.newPassword);
//       setStep("success");
//       setErrorMessage("");
//     } catch (error) {
//       setErrorMessage(error?.message || "Failed to reset password. Please try again.");
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleBackToLogin = () => {
//     onBackToLogin();
//   };

//   const resendOtp = async () => {
//     if (!formData.email) {
//       setErrorMessage("Email is required to resend OTP");
//       return;
//     }

//     dispatch(loginStart());
//     try {
//       await mockForgotPassword(formData.email);
//       setErrorMessage("");
//       alert("New OTP sent to your email!");
//     } catch (error) {
//       setErrorMessage(error?.message || "Failed to resend OTP. Please try again.");
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   return (
//     <div className="min-h-screen flex">
//       {/* Left: Form Section */}
//       <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 bg-white dark:bg-gray-900">
//         <div className="mx-auto w-full max-w-md">
//           {/* Back Button */}
//           <button
//             onClick={handleBackToLogin}
//             className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Back to Login
//           </button>

//           {/* Logo */}
//           <div className="text-center mb-8">
//             <div className="flex items-center justify-center gap-3 mb-4">
//               <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//                 <Truck className="h-6 w-6 text-white" />
//               </div>
//               <div className="text-left">
//                 <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   Efit Transport
//                 </h1>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Password Recovery
//                 </p>
//               </div>
//             </div>

//             {/* Dynamic Headings */}
//             {step === "email" && (
//               <>
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
//                   Reset Your Password
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Enter your email to receive a verification code
//                 </p>
//               </>
//             )}
//             {step === "verify" && (
//               <>
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
//                   Verify Your Email
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Enter the OTP sent to {formData.email}
//                 </p>
//                 {/* Development helper - show OTP in development */}
//                 {process.env.NODE_ENV === 'development' && generatedOtp && (
//                   <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded-lg">
//                     <p className="text-xs text-yellow-800">
//                       <strong>Development:</strong> OTP is {generatedOtp}
//                     </p>
//                   </div>
//                 )}
//               </>
//             )}
//             {step === "reset" && (
//               <>
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
//                   Create New Password
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Enter your new password below
//                 </p>
//               </>
//             )}
//             {step === "success" && (
//               <>
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
//                   Password Reset Successful!
//                 </h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Your password has been updated successfully
//                 </p>
//               </>
//             )}
//           </div>

//           {/* Error Message */}
//           {errorMessage && (
//             <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
//               {errorMessage}
//             </div>
//           )}

//           {/* Forms */}
//           {step === "email" && (
//             <form className="space-y-5" onSubmit={handleSendResetOtp}>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Enter your email address"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="w-full pl-10 pr-3 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? "Sending OTP..." : "Send Verification Code"}
//               </button>
//             </form>
//           )}

//           {step === "verify" && (
//             <form className="space-y-5" onSubmit={handleVerifyResetOtp}>
//               <div className="text-center mb-6">
//                 <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Mail className="h-8 w-8 text-white" />
//                 </div>
//                 <p className="text-gray-600 dark:text-gray-400 text-sm">
//                   We sent a verification OTP to your email address
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 <div className="relative">
//                   <input
//                     type="text"
//                     name="otp"
//                     placeholder="Enter 6-digit OTP"
//                     value={formData.otp}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/g, "").slice(0, 6);
//                       setFormData(prev => ({ ...prev, otp: value }));
//                       if (errorMessage) setErrorMessage("");
//                     }}
//                     required
//                     maxLength={6}
//                     className="w-full text-center text-2xl font-mono tracking-widest px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={resendOtp}
//                   disabled={loading}
//                   className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
//                 >
//                   {loading ? "Sending..." : "Didn't receive OTP? Resend"}
//                 </button>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading || formData.otp.length !== 6}
//                 className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? "Verifying..." : "Verify OTP"}
//               </button>
//             </form>
//           )}

//           {step === "reset" && (
//             <form className="space-y-5" onSubmit={handleResetPassword}>
//               <div className="space-y-4">
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="newPassword"
//                     placeholder="New Password"
//                     value={formData.newPassword}
//                     onChange={handleChange}
//                     required
//                     minLength={6}
//                     className="w-full pl-10 pr-10 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
//                   />
//                 </div>

//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="confirmNewPassword"
//                     placeholder="Confirm New Password"
//                     value={formData.confirmNewPassword}
//                     onChange={handleChange}
//                     required
//                     minLength={6}
//                     className="w-full pl-10 pr-10 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5" />
//                     ) : (
//                       <Eye className="h-5 w-5" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? "Resetting Password..." : "Reset Password"}
//               </button>
//             </form>
//           )}

//           {step === "success" && (
//             <div className="text-center space-y-6">
//               <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
//                 <svg
//                   className="w-12 h-12 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//               </div>
//               <div className="space-y-2">
//                 <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
//                   Password Updated!
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Your password has been reset successfully. You can now login with your new password.
//                 </p>
//               </div>
//               <button
//                 onClick={handleBackToLogin}
//                 className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
//               >
//                 Back to Login
//               </button>
//             </div>
//           )}

//           {/* Footer */}
//           <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
//             <div className="flex items-center justify-center gap-2 text-xs mt-4">
//               <Shield className="h-4 w-4" />
//               <span>Your data is securely encrypted</span>
//             </div>
//             <p className="mt-3 text-xs">
//               © 2025 Why Digit System Private Limited · Made with ❤️ in India
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right: Animation Section */}
//       <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
//         <div className="flex-1 flex items-center justify-center p-8">
//           <div className="max-w-md w-full">
//             <div className="text-center mb-8">
//               <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/10 p-4 shadow-xl">
//                 <Lottie
//                   animationData={truckAnimation}
//                   loop={true}
//                   autoplay={true}
//                   style={{ width: "100%", height: "100%" }}
//                 />
//               </div>
//               <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
//                 Secure Account Recovery
//                 <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                   Protected & Encrypted
//                 </span>
//               </h3>
//             </div>

//             <div className="space-y-3">
//               <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
//                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                     </svg>
//                   </div>
//                   <div className="text-left">
//                     <h4 className="text-white font-semibold text-base">Secure Recovery</h4>
//                     <p className="text-blue-100/80 text-xs">OTP verified process</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
//                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                     </svg>
//                   </div>
//                   <div className="text-left">
//                     <h4 className="text-white font-semibold text-base">Encrypted</h4>
//                     <p className="text-blue-100/80 text-xs">End-to-end protection</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;
