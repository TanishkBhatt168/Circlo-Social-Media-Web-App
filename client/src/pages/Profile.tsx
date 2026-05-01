import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { User, Settings, Grid, Bookmark as BookmarkIcon, Camera, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
    id: string;
    username: string;
    bio: string | null;
    avatar: string | null;
    createdAt: string;
    _count: {
        posts: number;
        followers: number;
        following: number;
    };
    posts: any[];
}

const Profile = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useContext(AuthContext)!;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/users/${id}`);
                setProfile(res.data);
                
                // Initialize follow state correctly
                if (res.data.followers && currentUser) {
                    const isFollower = res.data.followers.some((f: any) => f.followerId === currentUser.id);
                    setIsFollowing(isFollower);
                } else {
                    setIsFollowing(false);
                }

                // Initialize block state correctly
                if (res.data.blockedBy && currentUser) {
                    const blocked = res.data.blockedBy.some((b: any) => b.blockerId === currentUser.id);
                    setIsBlocked(blocked);
                } else {
                    setIsBlocked(false);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id, currentUser]);

    const handlePostDeleted = (postId: string) => {
        setProfile(prev => prev ? {
            ...prev,
            posts: prev.posts.filter(p => p.id !== postId),
            _count: {
                ...prev._count,
                posts: prev._count.posts - 1
            }
        } : null);
    };

    const handleFollow = async () => {
        if (!currentUser || currentUser.id === id) return;
        try {
            if (isFollowing) {
                await axios.post(`/users/${id}/unfollow`);
                setIsFollowing(false);
                setProfile(prev => prev ? { ...prev, _count: { ...prev._count, followers: Math.max(0, prev._count.followers - 1) } } : null);
            } else {
                await axios.post(`/users/${id}/follow`);
                setIsFollowing(true);
                setProfile(prev => prev ? { ...prev, _count: { ...prev._count, followers: prev._count.followers + 1 } } : null);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleBlock = async () => {
        try {
            if (isBlocked) {
                await axios.post(`/users/${id}/unblock`);
                setIsBlocked(false);
            } else {
                if (!confirm(`Are you sure you want to block ${profile?.username}?`)) return;
                await axios.post(`/users/${id}/block`);
                setIsBlocked(true);
                setIsFollowing(false); // Blocking unfollows them automatically
                setProfile(prev => prev ? { ...prev, _count: { ...prev._count, followers: Math.max(0, prev._count.followers - 1) } } : null);
            }
        } catch (error) {
            console.error('Error toggling block:', error);
        }
    };

    const handlePhotoUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser || id !== currentUser.id) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await axios.put(`/users/${id}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(prev => prev ? { ...prev, avatar: res.data.avatar } : null);
            setIsEditingPhoto(false);
        } catch (error) {
            console.error('Error updating profile photo:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center pt-20">
                <Loader className="animate-spin text-gray-500 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
        );
    }
    
    if (!profile) return <div className="text-center mt-10">User not found.</div>;

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-20 px-4 md:px-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12">
                <div className="relative group cursor-pointer" onClick={() => profile.avatar && setIsPhotoModalOpen(true)}>
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 border-2 border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {profile.avatar ? (
                            <img src={`http://localhost:5000${profile.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-6xl font-bold text-gray-400">{profile.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
                        <h2 className="text-xl text-gray-900">{profile.username}</h2>
                        {isOwnProfile ? (
                            <div className="flex gap-2">
                                <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition" onClick={() => fileInputRef.current?.click()}>
                                    Edit Profile
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpdate} />
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-900"><Settings size={20} /></button>
                            </div>
                        ) : currentUser ? (
                            <div className="flex gap-2">
                                {!isBlocked && (
                                    <>
                                        <button
                                            onClick={handleFollow}
                                            className={`px-6 py-1.5 rounded-lg text-sm font-semibold transition ${isFollowing ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'bg-instagram-blue text-white hover:bg-instagram-blueHover'}`}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                        {isFollowing && (
                                            <Link 
                                                to="/chat" 
                                                state={{ selectedUser: { id: profile.id, username: profile.username, avatar: profile.avatar } }}
                                                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition"
                                            >
                                                Message
                                            </Link>
                                        )}
                                    </>
                                )}
                                <button
                                    onClick={handleBlock}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${isBlocked ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                >
                                    {isBlocked ? 'Unblock' : 'Block'}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex gap-8 mb-4">
                        <p><span className="font-semibold text-gray-900">{profile._count.posts}</span> posts</p>
                        <p className="cursor-pointer"><span className="font-semibold text-gray-900">{profile._count.followers}</span> followers</p>
                        <p className="cursor-pointer"><span className="font-semibold text-gray-900">{profile._count.following}</span> following</p>
                    </div>

                    <div className="text-sm">
                        <p className="font-semibold text-gray-900 mb-1">{profile.username}</p>
                        {profile.bio && <p className="text-gray-900 whitespace-pre-wrap">{profile.bio}</p>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-12 mb-6">
                <button className="flex items-center gap-2 border-t-[1px] border-gray-900 pt-3 text-xs font-semibold tracking-widest text-gray-900 uppercase">
                    <Grid size={12} /> Posts
                </button>
                {isOwnProfile && (
                    <button className="flex items-center gap-2 pt-3 text-xs font-semibold tracking-widest text-gray-400 uppercase hover:text-gray-900 transition">
                        <BookmarkIcon size={12} /> Saved
                    </button>
                )}
            </div>

            {/* Posts Feed */}
            <div className="max-w-xl mx-auto">
                {profile.posts.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                        className="flex flex-col gap-6"
                    >
                        {profile.posts.map((post) => (
                            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <PostCard post={post} currentUser={currentUser} onDelete={handlePostDeleted} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 border-2 border-gray-900 rounded-full flex items-center justify-center mb-4">
                            <Grid size={32} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">No Posts Yet</h2>
                    </div>
                )}
            </div>

            {/* Profile Photo Modal */}
            <AnimatePresence>
                {isPhotoModalOpen && profile.avatar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsPhotoModalOpen(false)}
                    >
                        <button 
                            className="absolute top-6 right-6 text-white hover:text-gray-300 transition"
                            onClick={() => setIsPhotoModalOpen(false)}
                        >
                            <X size={32} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            src={`http://localhost:5000${profile.avatar}`}
                            alt={profile.username}
                            className="max-w-[90%] max-h-[90vh] rounded-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
