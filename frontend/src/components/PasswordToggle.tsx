import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export type PasswordToggleProps = {
  show: boolean;
  setShow: (v: boolean) => void;
  ariaLabelShow?: string;
  ariaLabelHide?: string;
  style?: React.CSSProperties;
  className?: string;
  iconColor?: string;
};

/**
 * Reusable password visibility toggle button.
 * - Press-and-hold reveals password (onMouseDown), release hides (onMouseUp/Leave)
 * - Accessible via aria-labels that switch based on state
 */
const PasswordToggle: React.FC<PasswordToggleProps> = ({
  show,
  setShow,
  ariaLabelShow = "Show password",
  ariaLabelHide = "Hide password",
  style,
  className,
  iconColor = "black",
}) => {
  return (
    <button
      type="button"
      onMouseDown={() => setShow(true)}
      onMouseUp={() => setShow(false)}
      onMouseLeave={() => setShow(false)}
      style={{
        position: "absolute",
        right: "0rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        ...(style || {}),
      }}
      className={className}
      aria-label={show ? ariaLabelHide : ariaLabelShow}
   >
      {show ? (
        <FaEyeSlash style={{ color: iconColor }} />
      ) : (
        <FaEye style={{ color: iconColor }} />
      )}
    </button>
  );
};

export default PasswordToggle;
