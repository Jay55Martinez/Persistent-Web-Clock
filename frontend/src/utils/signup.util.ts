// Utility function for signing up for an account

// Function to check if the password meets the requirements
export const checkIfValidPassword = (password: string) => {
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
};

// Check for valid email format
export const isValidEmail = (email: string) => {
  email = email.trim();

  const regex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  // Basic syntax check
  if (!regex.test(email)) return false;

  // Additional check: Domain must not start or end with a dash
  const domain = email.split("@")[1];
  if (!domain || domain.startsWith("-") || domain.endsWith("-")) return false;

  // Ensure there are no double dots ".."
  if (email.includes("..")) return false;

  return true;
};
