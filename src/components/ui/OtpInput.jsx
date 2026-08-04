import React, { useRef, useEffect } from 'react';

/*
 * Six-box OTP entry with auto-advance, backspace-to-previous and paste support.
 * `value` is the plain string (e.g. "0413"); the boxes are a presentation
 * detail, so the parent never deals with per-digit state.
 */
const OtpInput = ({
  value = '',
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  hasError = false,
  autoFocus = true,
}) => {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const push = (next) => {
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
  };

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    const next = (value.slice(0, index) + digit + value.slice(index + 1)).slice(0, length);
    push(next);

    if (index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        push(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        push(value.slice(0, index - 1) + value.slice(index));
        inputsRef.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    push(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div
      className={`flex justify-between gap-2 sm:gap-3 ${hasError ? 'animate-shake' : ''}`}
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className={`h-14 w-full rounded-xl border-2 bg-white text-center font-sans text-xl font-semibold text-sand-900 caret-brand-500 outline-none transition-all duration-200 disabled:opacity-50
            ${
              hasError
                ? 'border-brand-400 bg-brand-50'
                : digit
                  ? 'border-sand-900'
                  : 'border-sand-300 hover:border-sand-400'
            }
            focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
