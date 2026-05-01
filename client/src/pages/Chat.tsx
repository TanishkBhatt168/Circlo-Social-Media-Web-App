import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, Image as ImageIcon, Phone, Video, Info, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

const socket = io('http://localhost:5000');

interface User {
    id: string;
    username: string;
    avatar: string | null;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
}

const Chat = () => {
    const { user } = useContext(AuthContext)!;
    const location = useLocation();
    const navigate = useNavigate();
    
    const [conversations, setConversations] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            socket.emit('join_room', user.id);
        }
    }, [user]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axios.get('/messages/conversations');
                setConversations(res.data);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        fetchConversations();
    }, []);

    // Check for pre-selected user from navigation state (like clicking Message on a profile)
    useEffect(() => {
        if (location.state?.selectedUser) {
            const passedUser = location.state.selectedUser;
            setSelectedUser(passedUser);
            
            // Add to conversations list if not already there so they show up in the sidebar immediately
            setConversations((prev) => {
                if (!prev.find(c => c.id === passedUser.id)) {
                    return [passedUser, ...prev];
                }
                return prev;
            });
            
            // Clear the state so refreshing doesn't automatically re-select them
            navigate('/chat', { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                try {
                    const res = await axios.get(`/messages/${selectedUser.id}`);
                    setMessages(res.data);
                    scrollToBottom();
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        const handleReceiveMessage = (data: Message) => {
            if (
                selectedUser &&
                (data.senderId === selectedUser.id || data.receiverId === selectedUser.id)
            ) {
                setMessages((prev) => [...prev, data]);
                scrollToBottom();
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [selectedUser]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || !user) return;

        const messageData = {
            senderId: user.id,
            receiverId: selectedUser.id,
            content: newMessage,
        };

        socket.emit('send_message', messageData);

        const optimisticMessage: Message = {
            id: Date.now().toString(),
            content: newMessage,
            senderId: user.id,
            receiverId: selectedUser.id,
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage('');
        scrollToBottom();
    };

    return (
        <div className="h-screen pt-4 pb-4 px-4 max-w-5xl mx-auto flex items-center justify-center">
            <div className="w-full h-[calc(100vh-100px)] bg-white border border-instagram-border rounded-[4px] flex overflow-hidden">
                
                {/* Sidebar (Conversations) */}
                <div className="w-[350px] border-r border-instagram-border flex flex-col bg-white">
                    <div className="h-[60px] px-5 flex items-center justify-between border-b border-instagram-border">
                        <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                        <button className="text-gray-900"><Edit size={24} /></button>
                    </div>
                    
                    <div className="flex justify-between px-5 py-3">
                        <span className="font-bold text-gray-900">Messages</span>
                        <span className="font-semibold text-gray-400 text-sm">Requests</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedUser(c)}
                                className={`px-5 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?.id === c.id ? 'bg-gray-100' : ''}`}
                            >
                                <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {c.avatar ? <img src={c.avatar} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-gray-500">{c.username[0].toUpperCase()}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{c.username}</p>
                                    <p className="text-sm text-gray-500 truncate">Active today</p>
                                </div>
                            </div>
                        ))}
                        {conversations.length === 0 && (
                            <p className="p-4 text-center text-gray-500 text-sm">No messages found.</p>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-[60px] px-5 border-b border-instagram-border flex items-center justify-between bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                        {selectedUser.avatar ? <img src={selectedUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : <span className="font-bold text-gray-500">{selectedUser.username[0].toUpperCase()}</span>}
                                    </div>
                                    <span className="font-semibold text-gray-900">{selectedUser.username}</span>
                                </div>
                                <div className="flex gap-4 text-gray-900">
                                    <button><Phone size={24} /></button>
                                    <button><Video size={24} /></button>
                                    <button><Info size={24} /></button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-2">
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center overflow-hidden">
                                        {selectedUser.avatar ? <img src={selectedUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-gray-500">{selectedUser.username[0].toUpperCase()}</span>}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.username}</h3>
                                    <p className="text-sm text-gray-500">Circlo</p>
                                    <button className="mt-4 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg text-sm transition">View Profile</button>
                                </div>

                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <motion.div 
                                            key={msg.id} 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-3xl ${isMe ? 'bg-[#efefef] text-gray-900' : 'bg-transparent border border-[#efefef] text-gray-900'}`}>
                                                <p className="text-[15px]">{msg.content}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 bg-white">
                                    <button type="button" className="text-gray-900"><ImageIcon size={24} /></button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Message..."
                                        className="flex-1 bg-transparent focus:outline-none text-sm placeholder-gray-500"
                                    />
                                    {newMessage.trim() && (
                                        <button type="submit" className="text-instagram-blue font-semibold text-sm">Send</button>
                                    )}
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-24 h-24 border-2 border-gray-900 rounded-full flex items-center justify-center mb-4">
                                <Send size={48} className="ml-1 text-gray-900" />
                            </div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-2">Your Messages</h3>
                            <p className="text-gray-500 mb-6">Send private photos and messages to a friend or group.</p>
                            <button className="px-4 py-1.5 bg-instagram-blue text-white font-semibold rounded-lg hover:bg-instagram-blueHover transition">Send Message</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
