import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import apiClient from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';


function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const {jwt} = useAuth();
  

  useEffect(() => {
    if (!jwt) {
      setMessage('Invalid or expired reset token');
    }
  }, [jwt]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords don't match");
      return;
    }

    try {
      await apiClient.post('/auth/reset-password', { jwt, password });
      setMessage('Password reset successfully!');
      router.push('/landing'); // Redirect to login page after successful reset
    } catch (error) {
      setMessage('Error resetting password. Please try again.' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
