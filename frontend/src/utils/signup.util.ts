// Utility function for signing up for an account

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

export default checkIfValidPassword;
