import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  analytics,
  logEvent,
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../firebase";
import { requestFCMToken } from '../utils/pushNotifications';
import { useAuthContext } from '../utils/AuthContext';
import AuthLayout from "../components/ui/AuthLayout";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import OtpInput from "../components/ui/OtpInput";

const RESEND_SECONDS = 30;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const normalizePhone = (inputPhone) => {
    const trimmed = inputPhone.trim().replace(/\s|-/g, "");
    return trimmed.startsWith("+91") ? trimmed : `+91${trimmed}`;
  };

  const isValidIndianPhone = (p) => /^\+91\d{10}$/.test(p);

  // Resend countdown, self-cancelling so it can't outlive the step.
  useEffect(() => {
    if (!isOtpSent) return undefined;
    if (timer <= 0) {
      setCanResend(true);
      return undefined;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [isOtpSent, timer]);

  const setupRecaptcha = () => {
    // Always tear down first. Reusing a spent verifier makes every retry
    // after a failed send fail too.
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => console.log("reCAPTCHA verified"),
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (userData.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(userData.email.trim()))
      next.email = "Please enter a valid email address.";
    if (userData.phone.length !== 10)
      next.phone = "Enter a 10-digit mobile number.";
    if (userData.address.trim().length < 5)
      next.address = "Please enter your delivery address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendOtp = async ({ isResend = false } = {}) => {
    if (!isResend && !validate()) return;

    const normalizedPhone = normalizePhone(userData.phone);
    if (!isValidIndianPhone(normalizedPhone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setIsSending(true);

      // Rejects with 409 if the phone is already registered.
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/check-phone?for=register`, { phone: normalizedPhone });

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, normalizedPhone, appVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      setOtp("");
      setOtpError(false);
      setTimer(RESEND_SECONDS);
      setCanResend(false);
      toast.success("OTP sent to your phone!");
    } catch (err) {
      console.error("Error sending OTP:", err);

      // Firebase specific error handling
      let errorMessage = "Failed to send OTP. Please try again.";

      if (err.code) {
        switch (err.code) {
          case "auth/invalid-phone-number":
            errorMessage = "The phone number entered is invalid. Please check and try again.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many OTP requests. Please wait around 15 minutes before trying again.";
            break;
          case "auth/quota-exceeded":
            errorMessage = "OTP quota exceeded. Please try again later.";
            break;
          case "auth/user-disabled":
            errorMessage = "This phone number is blocked. Contact support.";
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      } else if (err.response?.data?.error) {
        // Backend errors (e.g., phone already registered)
        errorMessage = err.response.data.error;
      }

      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtpAndRegister = async (providedOtp) => {
    const otpToVerify = providedOtp || otp;
    if (!confirmationResult) {
      toast.error("No OTP request found. Please try registering again.");
      return;
    }

    try {
      setIsVerifying(true);
      setOtpError(false);
      const res = await confirmationResult.confirm(otpToVerify);
      const user = res.user;

      const idToken = await user.getIdToken();
      const fcmToken = await requestFCMToken();

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        { ...userData, idToken, fcmToken },
        { withCredentials: true }
      );

      setUser(response.data.user);

      toast.success("Registration successful!");
      if (analytics) logEvent(analytics, "registration_complete", { method: "phone" });

      navigate("/"); // Redirect to home or login
    } catch (err) {
      console.error("OTP verification or registration failed:", err);
      // Stay on the OTP step. Previously this reset to the details form and
      // silently threw away a valid OTP session on any error.
      setOtpError(true);
      setOtp("");
      toast.error(
        err.response?.data?.error ||
          "Invalid OTP or registration failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const prettyPhone = `+91 ${userData.phone.slice(0, 5)} ${userData.phone.slice(5)}`.trim();

  return (
    <AuthLayout
      wide
      headline="Good food begins with good company."
      sub="Create an account to order catering, browse meal boxes and track every delivery."
      backLabel={isOtpSent ? "Edit details" : "Back to home"}
      onBack={() => (isOtpSent ? setIsOtpSent(false) : navigate("/"))}
    >
      <div id="recaptcha-container" />

      {!isOtpSent ? (
        <form
          className="animate-fade-up"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            sendOtp();
          }}
        >
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            Step 1 of 2
          </p>
          <h1 className="mt-1 font-display text-4xl text-sand-900">Create your account</h1>
          <p className="mt-2 text-[0.9375rem] text-sand-600">
            We'll send a verification code to confirm your number.
          </p>

          <div className="mt-8 space-y-5">
            <Field
              id="name"
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={userData.name}
              onChange={handleInputChange}
              error={errors.name}
            />

            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={userData.email}
              onChange={handleInputChange}
              error={errors.email}
            />

            <Field
              id="phone"
              label="Phone number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              prefix={
                <>
                  <span aria-hidden="true">🇮🇳</span> +91
                </>
              }
              placeholder="98765 43210"
              value={userData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) {
                  setUserData((prev) => ({ ...prev, phone: val }));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              error={errors.phone}
            />

            <Field
              id="address"
              label="Delivery address"
              type="text"
              autoComplete="street-address"
              placeholder="House no, street, area, city"
              value={userData.address}
              onChange={handleInputChange}
              error={errors.address}
              hint="Used to check whether we deliver to your area."
            />
          </div>

          <Button type="submit" className="mt-7" loading={isSending} loadingText="Sending OTP…">
            Continue
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-disabled:translate-x-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10h11M10 5l5 5-5 5" />
            </svg>
          </Button>

          <p className="mt-7 text-center text-[0.9375rem] text-sand-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      ) : (
        <form
          className="animate-fade-up"
          onSubmit={(e) => {
            e.preventDefault();
            verifyOtpAndRegister();
          }}
        >
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            Step 2 of 2
          </p>
          <h1 className="mt-1 font-display text-4xl text-sand-900">Verify your number</h1>
          <p className="mt-2 text-[0.9375rem] text-sand-600">
            We sent a 6-digit code to{' '}
            <span className="font-semibold text-sand-900">{prettyPhone}</span>
          </p>

          <div className="mt-9">
            <label className="mb-2 block text-sm font-semibold text-sand-800">
              Enter code
            </label>
            <OtpInput
              value={otp}
              onChange={(next) => {
                setOtp(next);
                if (otpError) setOtpError(false);
              }}
              onComplete={(code) => verifyOtpAndRegister(code)}
              disabled={isVerifying}
              hasError={otpError}
            />
          </div>

          <Button
            type="submit"
            className="mt-6"
            loading={isVerifying}
            loadingText="Creating account…"
            disabled={otp.length !== 6}
          >
            Complete registration
          </Button>

          <div className="mt-6 text-center text-[0.9375rem] text-sand-600">
            {canResend ? (
              <button
                type="button"
                onClick={() => sendOtp({ isResend: true })}
                disabled={isSending}
                className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline disabled:opacity-60"
              >
                {isSending ? 'Sending…' : 'Resend OTP'}
              </button>
            ) : (
              <span>
                Didn't get it? Resend in{' '}
                <span className="font-semibold tabular-nums text-sand-900">{timer}s</span>
              </span>
            )}
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
