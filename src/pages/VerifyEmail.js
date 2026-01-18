import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { RxCountdownTimer } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, signUp } from "../services/operations/authAPI";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otpCreatedTime, setOtpCreatedTime] = useState(null);
    const {loading, signupData} = useSelector((state)=> state.auth);
    const dispatch= useDispatch();
    const navigate = useNavigate();
    
    useEffect(() => {
      if(!signupData) navigate('/signup')
      // Set OTP creation time when component mounts (OTP was just sent)
      setOtpCreatedTime(Date.now());
      // Start cooldown timer for initial OTP send
      setResendCooldown(60); // Disable resend for 60 seconds initially
    }, [])

    // Countdown timer for resend OTP
    useEffect(() => {
      if (resendCooldown > 0) {
        const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [resendCooldown]);
    
    const handleVerifyAndSignup = (e) => {
        e.preventDefault();
        
        // Check if OTP has expired (older than 10 minutes)
        if (otpCreatedTime) {
          const timeDiff = (Date.now() - otpCreatedTime) / 1000 / 60; // in minutes
          if (timeDiff > 10) {
            toast.error("OTP has expired. Please request a new one.");
            return;
          }
        }
        
        const {
            accountType,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = signupData
        dispatch(signUp(accountType,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            otp, navigate))
    }

    const handleResendOtp = () => {
      if (resendCooldown === 0) {
        // Don't pass navigate on resend - we're already on verify-email page
        dispatch(sendOtp(signupData.email));
        setResendCooldown(60); // 1 minute cooldown
        setOtpCreatedTime(Date.now()); // Reset OTP creation time
      }
    }

    // Calculate OTP expiry time
    const getOtpExpiryTime = () => {
      if (otpCreatedTime) {
        const timeDiff = (Date.now() - otpCreatedTime) / 1000 / 60; // in minutes
        if (timeDiff > 10) {
          return "Expired";
        }
        return `${Math.ceil(10 - timeDiff)}m`;
      }
      return "10m";
    }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center">
      {loading ? (
        <div>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8">
          <h1 className="text-richblack-5 font-semibold text-[1.875rem] leading-[2.375rem]">
            Verify Email
          </h1>
          <p className="text-[1.125rem] leading-[1.625rem] my-4 text-richblack-100">
            A verification code has been sent to you. Enter the code below
          </p>
          <p className="text-sm text-richblack-400 mb-4">
            OTP expires in: <span className="text-yellow-50 font-semibold">{getOtpExpiryTime()}</span>
          </p>
          <form onSubmit={handleVerifyAndSignup}>
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderInput={(props) => (
                <input
                  {...props}
                  placeholder="-"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-[48px] lg:w-[60px] border-0 bg-richblack-800 rounded-[0.5rem] text-richblack-5 aspect-square text-center focus:border-0 focus:outline-2 focus:outline-yellow-50"
                />
              )}
              containerStyle={{
                justifyContent: "space-between",
                gap: "0 6px",
              }}
            />
            <button
              type="submit"
              className="w-full bg-yellow-50 py-[12px] px-[12px] rounded-[8px] mt-6 font-medium text-richblack-900"
            >
              Verify Email
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between">
            <Link to="/signup">
              <p className="text-richblack-5 flex items-center gap-x-2">
                <BiArrowBack /> Back To Signup
              </p>
            </Link>
            <button
              disabled={resendCooldown > 0}
              className={`flex items-center gap-x-2 ${
                resendCooldown > 0 
                  ? 'text-richblack-400 cursor-not-allowed' 
                  : 'text-blue-100 cursor-pointer hover:text-blue-200'
              }`}
              onClick={handleResendOtp}
            >
              <RxCountdownTimer />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend it"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifyEmail