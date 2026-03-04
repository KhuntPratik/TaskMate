'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push('/Home'); 
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      <hr />

      {/* ✅ Google Login Button */}
      <button onClick={() => signIn("google", { callbackUrl: "/Home" })}>
        Login with Google (Calendar Access)
      </button>
    </div>
  );
}

