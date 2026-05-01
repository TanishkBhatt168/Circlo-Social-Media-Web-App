import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { login } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { email, password } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(formData);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
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
                    <h1 className="text-4xl font-bold italic mb-10 text-gray-900 tracking-tighter">Circlo</h1>
                    
                    {error && <p className="text-red-500 text-sm text-center mb-4 w-full">{error}</p>}
                    
                    <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
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
                        <button
                            type="submit"
                            className="w-full bg-instagram-blue text-white font-semibold py-1.5 rounded-lg mt-2 hover:bg-instagram-blueHover transition duration-300 disabled:opacity-70"
                        >
                            Log In
                        </button>
                    </form>
                    
                    <div className="flex items-center w-full my-5 gap-4">
                        <div className="h-px bg-instagram-border flex-1"></div>
                        <span className="text-gray-400 text-sm font-semibold uppercase">or</span>
                        <div className="h-px bg-instagram-border flex-1"></div>
                    </div>

                    <a href="#" className="text-instagram-blue text-sm font-semibold flex items-center gap-2 mb-4">
                        <svg viewBox="0 0 24 24" fill="currentColor" height="16" width="16"><path d="M12 2.04c-5.5 0-10 4.48-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.54-4.5-10.02-10-10.02Z"></path></svg>
                        Log in with Facebook
                    </a>
                    
                    <a href="#" className="text-xs text-blue-900 cursor-pointer">Forgot password?</a>
                </div>

                <div className="bg-white border border-instagram-border p-5 mt-4 text-center">
                    <p className="text-sm text-gray-900">
                        Don't have an account? <Link to="/register" className="text-instagram-blue font-semibold hover:underline">Sign up</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
