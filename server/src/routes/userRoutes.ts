import { Router } from 'express';
import { getUserProfile, followUser, unfollowUser, searchUsers, updateProfilePhoto, blockUser, unblockUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.get('/search', searchUsers); // Public or Protected? Let's keep public for now or protected
router.get('/:id', getUserProfile);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);
router.post('/:id/block', protect, blockUser);
router.post('/:id/unblock', protect, unblockUser);
router.put('/:id/avatar', protect, upload.single('avatar'), updateProfilePhoto);

export default router;
