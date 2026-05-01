import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, MessageCircle, Send, Trash2, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        avatar: string | null;
    };
}

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
    comments?: Comment[];
}

interface PostCardProps {
    post: Post;
    currentUser: any;
    onDelete?: (postId: string) => void;
}

const PostCard = ({ post, currentUser, onDelete }: PostCardProps) => {
    const [liked, setLiked] = useState(post.likes?.some(like => like.userId === currentUser?.id) || false);
    const [likeCount, setLikeCount] = useState(post._count?.likes || 0);

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeletePost = async () => {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/posts/${post.id}`);
            if (onDelete) onDelete(post.id);
        } catch (error) {
            console.error('Error deleting post:', error);
            setIsDeleting(false);
        }
    };

    const handleLike = async () => {
        const isLiked = liked;
        setLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

        try {
            await axios.put(`/posts/${post.id}/like`);
        } catch (error) {
            console.error('Error liking post:', error);
            setLiked(isLiked);
            setLikeCount(isLiked ? likeCount : likeCount);
        }
    };

    const fetchComments = async () => {
        if (!showComments) {
            setLoadingComments(true);
            try {
                const res = await axios.get(`/posts/${post.id}`);
                setComments(res.data.comments || []);
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const res = await axios.post(`/posts/${post.id}/comment`, { content: commentText });
            setComments([res.data, ...comments]);
            setCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await axios.delete(`/posts/${post.id}/comment/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="bg-white border border-instagram-border rounded-lg mb-4">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.author.id}`} className="block">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border border-white">
                                {post.author.avatar ? (
                                    <img src={`http://localhost:5000${post.author.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold text-gray-500">{post.author.username[0].toUpperCase()}</span>
                                )}
                            </div>
                        </div>
                    </Link>
                    <Link to={`/profile/${post.author.id}`} className="font-semibold text-sm text-gray-900 hover:text-gray-500 transition">
                        {post.author.username}
                    </Link>
                    <span className="text-gray-400 text-xs">• {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    {currentUser?.id === post.author.id && (
                        <button 
                            onClick={handleDeletePost} 
                            disabled={isDeleting}
                            className={`text-red-500 hover:text-red-700 transition ${isDeleting ? 'opacity-50' : ''}`}
                            title="Delete Post"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button className="text-gray-900 hover:text-gray-500 transition"><MoreHorizontal size={20} /></button>
                </div>
            </div>

            {/* Image/Content */}
            {post.image ? (
                <div className="w-full bg-gray-100 flex justify-center items-center overflow-hidden aspect-square">
                    <img src={`http://localhost:5000${post.image}`} alt="Post content" className="w-full h-full object-cover" />
                </div>
            ) : post.content ? (
                <div className="w-full min-h-[250px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-8">
                    <p className="text-white text-xl font-medium text-center whitespace-pre-wrap">{post.content}</p>
                </div>
            ) : null}

            {/* Actions */}
            <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleLike}
                            className={`transition-colors ${liked ? 'text-red-500' : 'text-gray-900 hover:text-gray-500'}`}
                        >
                            <Heart size={24} className={liked ? 'fill-current' : ''} />
                        </motion.button>
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            onClick={fetchComments}
                            className="text-gray-900 hover:text-gray-500 transition-colors"
                        >
                            <MessageCircle size={24} />
                        </motion.button>
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            className="text-gray-900 hover:text-gray-500 transition-colors"
                        >
                            <Send size={24} />
                        </motion.button>
                    </div>
                    <motion.button whileTap={{ scale: 0.8 }} className="text-gray-900 hover:text-gray-500 transition-colors">
                        <Bookmark size={24} />
                    </motion.button>
                </div>

                <p className="font-semibold text-sm text-gray-900 mb-1">{likeCount} likes</p>
                
                {post.image && post.content && (
                    <div className="mb-1 text-sm">
                        <Link to={`/profile/${post.author.id}`} className="font-semibold mr-2">{post.author.username}</Link>
                        <span>{post.content}</span>
                    </div>
                )}

                <button onClick={fetchComments} className="text-sm text-gray-500 mb-2 hover:underline">
                    View all {post._count?.comments || 0} comments
                </button>

                {/* Comment Section (Inline toggle) */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="py-2 mb-2 max-h-48 overflow-y-auto pr-2">
                                {loadingComments ? (
                                    <p className="text-sm text-gray-400">Loading...</p>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {comments.map(comment => (
                                            <div key={comment.id} className="flex gap-2 group">
                                                <Link to={`/profile/${comment.author.id}`} className="font-semibold text-sm shrink-0">{comment.author.username}</Link>
                                                <span className="text-sm flex-1">{comment.content}</span>
                                                {currentUser?.id === comment.author.id && (
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="opacity-0 group-hover:opacity-100 text-red-500 transition shrink-0">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Comment Input */}
            <div className="border-t border-instagram-border px-3 py-2">
                <form onSubmit={handleCommentSubmit} className="flex items-center">
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 text-sm py-2 border-none focus:ring-0 outline-none placeholder-gray-500"
                    />
                    {commentText.trim() && (
                        <button type="submit" className="text-sm font-semibold text-instagram-blue">
                            Post
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PostCard;
