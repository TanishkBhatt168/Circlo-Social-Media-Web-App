import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, User, LogOut, Search, PlusSquare, Compass, Heart, Aperture } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useContext(AuthContext)!;
    const location = useLocation();

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (isAuthPage) {
        return <div className="min-h-screen bg-instagram-light flex items-center justify-center">{children}</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-instagram-light">
                <nav className="bg-white border-b border-instagram-border h-16 fixed top-0 w-full z-50">
                    <div className="max-w-5xl mx-auto h-full px-4 flex justify-between items-center">
                        <Link to="/" className="text-2xl font-bold tracking-tight">Circlo</Link>
                        <div className="flex gap-4">
                            <Link to="/login" className="px-4 py-1.5 bg-instagram-blue text-white rounded-lg font-semibold hover:bg-instagram-blueHover transition">Log In</Link>
                            <Link to="/register" className="px-4 py-1.5 text-instagram-blue font-semibold hover:text-instagram-blueHover transition">Sign Up</Link>
                        </div>
                    </div>
                </nav>
                <main className="pt-16 max-w-5xl mx-auto">{children}</main>
            </div>
        );
    }

    // Sidebar for authenticated users
    return (
        <div className="min-h-screen bg-instagram-light flex">
            {/* Sidebar Navigation */}
            <nav className="w-24 fixed h-screen border-r border-instagram-border bg-white py-8 flex flex-col items-center hidden md:flex">
                <Link to="/" className="text-3xl font-bold italic mb-10 text-center flex justify-center w-full group">
                    <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Aperture size={24} />
                    </div>
                </Link>
                
                <div className="flex-1 flex flex-col gap-4 w-full px-4">
                    <Link to="/" title="Home" className={`flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition ${location.pathname === '/' ? 'text-black' : ''}`}>
                        <Home size={28} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                    </Link>
                    <div title="Search" className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                        <Search size={28} />
                    </div>
                    <div title="Explore" className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                        <Compass size={28} />
                    </div>
                    <Link title="Messages" to="/chat" className={`flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition ${location.pathname.startsWith('/chat') ? 'text-black' : ''}`}>
                        <MessageCircle size={28} strokeWidth={location.pathname.startsWith('/chat') ? 2.5 : 2} />
                    </Link>
                    <div title="Notifications" className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                        <Heart size={28} />
                    </div>
                    <div title="Create" className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                        <PlusSquare size={28} />
                    </div>
                    <Link title="Profile" to={`/profile/${user.id}`} className={`flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition ${location.pathname.includes('/profile') ? 'text-black' : ''}`}>
                        <User size={28} strokeWidth={location.pathname.includes('/profile') ? 2.5 : 2} />
                    </Link>
                </div>

                <div className="mt-auto w-full px-4">
                    <button title="Log out" onClick={logout} className="flex items-center justify-center p-3 rounded-lg hover:bg-red-50 text-red-500 transition w-full">
                        <LogOut size={28} />
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-24 w-full">
                {children}
            </main>

            {/* Mobile Bottom Bar (placeholder for actual implementation) */}
            <div className="md:hidden fixed bottom-0 w-full h-14 bg-white border-t border-instagram-border flex justify-around items-center z-50">
                <Link to="/"><Home size={24} /></Link>
                <Search size={24} />
                <PlusSquare size={24} />
                <Link to="/chat"><MessageCircle size={24} /></Link>
                <Link to={`/profile/${user.id}`}><User size={24} /></Link>
            </div>
        </div>
    );
};

export default Layout;
