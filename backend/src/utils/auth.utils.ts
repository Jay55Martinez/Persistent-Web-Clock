// Util functions for authentication

// Function to check if the password meets the requirements
const checkIfValidPassword = (password: string) => {
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
};

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric string
};

export { checkIfValidPassword, generateVerificationCode };