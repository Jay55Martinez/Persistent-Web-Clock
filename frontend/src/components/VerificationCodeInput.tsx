import React, { useMemo, useRef } from "react";

export type VerificationCodeInputProps = {
  value: string;
  onChange: (val: string) => void;
  length?: number; // default 6
  className?: string;
  inputClassName?: string;
  ariaLabelPrefix?: string; // e.g., "Digit"
  autoFocus?: boolean;
  gap?: string; // CSS gap between boxes
  shake?: boolean; // apply shake animation to inputs
};

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  length = 6,
  className,
  inputClassName,
  ariaLabelPrefix = "Digit",
  autoFocus = false,
  gap = "0.5rem",
  shake = false,
}) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const padded = useMemo(() => (value || "").slice(0, length), [value, length]);

  const setCharAt = (idx: number, ch: string) => {
    const arr = padded.split("");
    arr[idx] = ch;
    onChange(arr.join("").slice(0, length));
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text") || "";
    const digits = pasted.replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    onChange(digits);
    const focusIdx = Math.min(digits.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  const handleChange = (idx: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const ch = e.target.value.replace(/[^0-9]/g, "").slice(-1);
    setCharAt(idx, ch);
    if (ch && refs.current[idx + 1]) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number) => (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      setCharAt(idx, "");
      if (refs.current[idx - 1]) refs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowLeft") {
      refs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      refs.current[idx + 1]?.focus();
    }
  };

  return (
    <div
    className={className}
      style={{ display: "flex", justifyContent: "center", gap, margin: "0.5rem 0" }}
    >
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          aria-label={`${ariaLabelPrefix} ${idx + 1}`}
      className={`${inputClassName || "text-center form-control head-padding"} ${shake ? "shake" : ""}`}
          style={{ width: "2.5rem", height: "2.5rem", fontSize: "1.25rem" }}
          value={padded[idx] ?? ""}
          onPaste={handlePaste}
          onChange={handleChange(idx)}
          onKeyDown={handleKeyDown(idx)}
          autoFocus={autoFocus && idx === 0}
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;
