"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (res.ok) {
        const data = await res.json();
        console.log('Success:', data);

        localStorage.setItem('user', JSON.stringify(data));

        router.push('/');
    }
    else {
        console.error('Error:', await res.text());
    }
    };

    useEffect(() => {
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        if (user?.accessToken) {
        router.push('/');
        }
    }, []);


    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md border border-blue-200">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            {isLogin ? 'Login' : 'Register'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <input
                type="text"
                placeholder="Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                />
            )}
            <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-200 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
                {isLogin ? 'Login' : 'Register'}
            </button>
            </form>
            <p className="text-center mt-6 text-gray-700">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
                className="text-blue-600 hover:underline font-medium cursor-pointer"
                onClick={() => setIsLogin(!isLogin)}
            >
                {isLogin ? 'Register' : 'Login'}
            </button>
            </p>
        </div>
        </div>
    );
}
