import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { isProfileComplete } from '../utils/profileStatus';
import { useNavigate, Link } from 'react-router-dom';
import { analytics, logEvent, auth, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase';
import axios from 'axios';
import { useAuthContext } from '../utils/AuthContext';
import { requestFCMToken } from '../utils/pushNotifications';
import AuthLayout from '../components/ui/AuthLayout';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import OtpInput from '../components/ui/OtpInput';

const RESEND_SECONDS = 30;

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const { setUser } = useAuthContext();

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const normalizePhone = (inputPhone) => {
    const trimmed = inputPhone.trim().replace(/\s|-/g, '');
    return trimmed.startsWith('+91') ? trimmed : `+91${trimmed}`;
  };

  const isValidIndianPhone = (p) => /^\+91\d{10}$/.test(p);

  // Self-cancelling countdown. The previous version started a bare
  // setInterval inside sendOtp that was never cleared on unmount.
  useEffect(() => {
    if (step !== 2) return undefined;
    if (timer <= 0) {
      setCanResend(true);
      return undefined;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [step, timer]);

  const setupRecaptcha = () => {
    // Reset recaptcha if it already exists
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => console.log('reCAPTCHA verified'),
    });
  };

  const sendOtp = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!isValidIndianPhone(normalizedPhone)) {
      toast.error('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    try {
      setIsLoading(true);

      // Optional: check if phone exists in your DB
      await axios.post(`${API}/api/users/check-phone?for=login`, { phone: normalizedPhone });

      setupRecaptcha(); // reset or create recaptcha
      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(auth, normalizedPhone, appVerifier);
      setConfirmationResult(result);
      setStep(2);
      setOtp('');
      setOtpError(false);

      toast.success('OTP sent!');
      setTimer(RESEND_SECONDS);
      setCanResend(false);
    } catch (err) {
      console.error('Error sending OTP:', err);
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (providedOtp) => {
    const otpToVerify = providedOtp || otp;
    if (!confirmationResult) {
      toast.error('No OTP request found.');
      return;
    }

    try {
      setIsVerifying(true);
      setOtpError(false);
      const res = await confirmationResult.confirm(otpToVerify);
      const user = res.user;

      const idToken = await user.getIdToken();
      await axios.post(`${API}/api/users/firebase-login`, { idToken }, { withCredentials: true });
      const me = await axios.get(`${API}/api/users/me`, {
        withCredentials: true,
      });

      setUser(me.data.user);

      const token = await requestFCMToken();
      if (token) {
        await axios.post(
          `${API}/api/users/save-fcm-token`,
          { fcmToken: token },
          { withCredentials: true }
        );
      }

      if (analytics) logEvent(analytics, 'login_success', { method: 'phone' });
      toast.success('Phone verified successfully!');

      // An account is created the moment the phone is verified, so being
      // signed in is not the same as being set up. Without this a new customer
      // landed on the home page with no name and no email, and had to find the
      // registration link unaided.
      navigate(isProfileComplete(me.data.user) ? '/' : '/register');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setOtpError(true);
      setOtp('');
      toast.error('Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const prettyPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`.trim();

  return (
    <AuthLayout
      headline="Not just food, but a feast of flavors."
      sub="Crafted with love, served with tradition — for weddings, gatherings and everything in between."
      backLabel={step === 2 ? 'Change number' : 'Back to home'}
      onBack={() => (step === 2 ? setStep(1) : navigate('/'))}
    >
      <div id="recaptcha-container" />

      {step === 1 ? (
        <form
          className="animate-fade-up"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            sendOtp();
          }}
        >
          <h1 className="font-display text-4xl text-sand-900">Welcome back</h1>
          <p className="mt-2 text-[0.9375rem] text-sand-600">
            Enter your phone number and we'll text you a code to sign in.
          </p>

          <Field
            id="phone"
            label="Phone number"
            className="mt-9"
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
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 10) setPhone(val);
            }}
          />

          <Button
            type="submit"
            className="mt-6"
            loading={isLoading}
            loadingText="Sending OTP…"
            disabled={phone.length !== 10}
          >
            Send OTP
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
            New here?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </form>
      ) : (
        <form
          className="animate-fade-up"
          onSubmit={(e) => {
            e.preventDefault();
            verifyOtp();
          }}
        >
          <h1 className="font-display text-4xl text-sand-900">Verify your number</h1>
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
              onComplete={(code) => verifyOtp(code)}
              disabled={isVerifying}
              hasError={otpError}
            />
          </div>

          <Button
            type="submit"
            className="mt-6"
            loading={isVerifying}
            loadingText="Verifying…"
            disabled={otp.length !== 6}
          >
            Verify &amp; Login
          </Button>

          <div className="mt-6 text-center text-[0.9375rem] text-sand-600">
            {canResend ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={isLoading}
                className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline disabled:opacity-60"
              >
                {isLoading ? 'Sending…' : 'Resend OTP'}
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

export default LoginPage;
