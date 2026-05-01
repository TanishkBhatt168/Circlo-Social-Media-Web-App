import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { motion } from 'framer-motion';

interface Post {
    id: string;
    content: string | null;
    image: string | null;
    createdAt: string;
    author: {
        id: string;
        username: string;
        avatar: string | null;
    };
    likes: { userId: string }[];
    _count: {
        likes: number;
        comments: number;
    };
}

const Home = () => {
    const { user } = useContext(AuthContext)!;
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user]);

    const handlePostDeleted = (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center pt-20">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Circlo</h2>
                <p className="text-lg text-gray-500 mb-8">Connect with friends, share photos, and stay inspired.</p>
                <div className="flex gap-4">
                    <Link to="/login" className="px-6 py-2.5 bg-instagram-blue text-white font-semibold rounded-lg hover:bg-instagram-blueHover transition shadow-sm">Log in</Link>
                    <Link to="/register" className="px-6 py-2.5 bg-white border border-instagram-border text-instagram-blue font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm">Sign up</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center max-w-4xl mx-auto pt-8 px-4 gap-8">
            {/* Feed Section */}
            <div className="w-full max-w-[470px]">
                <CreatePost onPostCreated={fetchPosts} />
                
                {loading ? (
                    <div className="mt-10 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                    </div>
                ) : (
                    <motion.div 
                        className="flex flex-col gap-5 mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                    >
                        {posts.map((post) => (
                            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <PostCard post={post} currentUser={user} onDelete={handlePostDeleted} />
                            </motion.div>
                        ))}
                        {posts.length === 0 && (
                            <div className="bg-white border border-instagram-border rounded-lg p-10 text-center">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">No posts yet</h3>
                                <p className="text-gray-500 text-sm">Follow some people or create a new post to get started.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Suggestions/Profile Section (hidden on smaller screens) */}
            <div className="hidden lg:block w-[320px] pt-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div>
                        <Link to={`/profile/${user.id}`} className="font-semibold text-sm hover:text-gray-500 transition">{user.username}</Link>
                        <p className="text-sm text-gray-500">{user.username}</p>
                    </div>
                    <button className="ml-auto text-xs font-semibold text-instagram-blue">Switch</button>
                </div>

                <div className="flex justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-500">Suggested for you</span>
                    <button className="text-xs font-semibold text-gray-900">See All</button>
                </div>

                {/* Dummy Suggestions */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">user_{i}</p>
                            <p className="text-xs text-gray-500">Suggested for you</p>
                        </div>
                        <button className="text-xs font-semibold text-instagram-blue">Follow</button>
                    </div>
                ))}

                <div className="mt-8 text-xs text-gray-400 leading-relaxed">
                    <p>About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language</p>
                    <p className="mt-4">© 2026 CIRCLO FROM METASPHERE</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
