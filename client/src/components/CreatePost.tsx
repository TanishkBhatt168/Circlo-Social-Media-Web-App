import { useState, useRef, useContext } from 'react';
import axios from 'axios';
import { Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }: { onPostCreated: () => void }) => {
    const { user } = useContext(AuthContext)!;
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIsFocused(true);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !selectedFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            if (content.trim()) formData.append('content', content);
            if (selectedFile) formData.append('image', selectedFile);

            await axios.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setContent('');
            clearSelectedFile();
            setIsFocused(false);
            onPostCreated();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            layout
            className="bg-white border border-instagram-border rounded-lg p-4"
        >
            <form onSubmit={handleSubmit}>
                <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden border border-gray-100">
                        {user?.avatar ? (
                            <img src={`http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                        ) : null}
                    </div>
                    <div className="flex-1">
                        <textarea
                            className="w-full mt-2 text-sm resize-none focus:outline-none placeholder-gray-500 bg-transparent"
                            rows={isFocused || content || previewUrl ? 3 : 1}
                            placeholder="Share something..."
                            value={content}
                            onFocus={() => setIsFocused(true)}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        
                        {/* Image Preview Area */}
                        <AnimatePresence>
                            {previewUrl && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="relative rounded-lg overflow-hidden border border-gray-200"
                                >
                                    <button 
                                        type="button"
                                        onClick={clearSelectedFile}
                                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black transition z-10"
                                    >
                                        <X size={16} />
                                    </button>
                                    <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-cover" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {(isFocused || content || previewUrl) && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100"
                    >
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-400 hover:text-instagram-blue transition p-1"
                            title="Add photo"
                        >
                            <ImageIcon size={20} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <button
                            type="submit"
                            disabled={loading || (!content.trim() && !selectedFile)}
                            className="px-4 py-1.5 bg-instagram-blue text-white text-sm font-semibold rounded-lg hover:bg-instagram-blueHover transition disabled:opacity-50"
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </motion.div>
                )}
            </form>
        </motion.div>
    );
};

export default CreatePost;
