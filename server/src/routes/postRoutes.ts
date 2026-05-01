import { Router } from 'express';
import { createPost, getPosts, getPost, likePost, addComment, deleteComment, deletePost } from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.route('/')
    .get(protect, getPosts)
    .post(protect, upload.single('image'), createPost);

router.route('/:id')
    .get(getPost)
    .delete(protect, deletePost);

router.route('/:id/like').put(protect, likePost);
router.route('/:id/comment').post(protect, addComment);
router.route('/:id/comment/:commentId').delete(protect, deleteComment);

export default router;
