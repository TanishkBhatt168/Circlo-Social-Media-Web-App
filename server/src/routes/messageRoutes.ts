import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessage);

export default router;
