import { createContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: string;
    username: string;
    email: string;
    token: string;
    avatar?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Configure axios base URL
        axios.defaults.baseURL = '/api';

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            // Set default header for future requests
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            }
        }
        setLoading(false);

        // Add a response interceptor to handle 401s globally
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('user');
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const login = async (userData: any) => {
        const res = await axios.post('/auth/login', userData);
        if (res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }
    };

    const register = async (userData: any) => {
        const res = await axios.post('/auth/register', userData);
        if (res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
