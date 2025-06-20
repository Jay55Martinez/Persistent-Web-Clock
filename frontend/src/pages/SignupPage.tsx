import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await signupUser(email, password);
      localStorage.setItem('token', data.token); // optional if your backend returns it
      login(); // update auth context
      navigate('/timer');
    } catch (err) {
      alert('Signup failed. Try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
      <h1>Sign Up</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button type="submit">Create Account</button>
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </form>
  );
};

export default SignupPage;
