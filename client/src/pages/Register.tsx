import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { register } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { username, email, password, confirmPassword } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await register({ username, email, password });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-instagram-light">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[350px]"
            >
                <div className="bg-white border border-instagram-border p-10 flex flex-col items-center">
                    <h1 className="text-4xl font-bold italic mb-4 text-gray-900 tracking-tighter">Circlo</h1>
                    <p className="text-gray-500 font-semibold text-center mb-6 leading-tight">
                        Sign up to see photos and videos from your friends.
                    </p>
                    
                    {error && <p className="text-red-500 text-sm text-center mb-4 w-full">{error}</p>}
                    
                    <form onSubmit={onSubmit} className="w-full flex flex-col gap-2">
                        <div>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={onChange}
                                placeholder="Username"
                                className="w-full px-2 py-2.5 bg-[#fafafa] border border-instagram-border rounded text-sm focus:outline-none focus:border-gray-400"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="Email address"
                                className="w-full px-2 py-2.5 bg-[#fafafa] border border-instagram-border rounded text-sm focus:outline-none focus:border-gray-400"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Password"
                                className="w-full px-2 py-2.5 bg-[#fafafa] border border-instagram-border rounded text-sm focus:outline-none focus:border-gray-400"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                placeholder="Confirm Password"
                                className="w-full px-2 py-2.5 bg-[#fafafa] border border-instagram-border rounded text-sm focus:outline-none focus:border-gray-400"
                                required
                            />
                        </div>

                        <p className="text-xs text-center text-gray-500 my-3">
                            By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                        </p>

                        <button
                            type="submit"
                            className="w-full bg-instagram-blue text-white font-semibold py-1.5 rounded-lg hover:bg-instagram-blueHover transition duration-300 disabled:opacity-70"
                        >
                            Sign Up
                        </button>
                    </form>
                </div>

                <div className="bg-white border border-instagram-border p-5 mt-4 text-center">
                    <p className="text-sm text-gray-900">
                        Have an account? <Link to="/login" className="text-instagram-blue font-semibold hover:underline">Log in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
