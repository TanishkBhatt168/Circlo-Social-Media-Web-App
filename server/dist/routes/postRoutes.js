"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.route('/')
    .get(postController_1.getPosts)
    .post(authMiddleware_1.protect, postController_1.createPost);
router.route('/:id')
    .get(postController_1.getPost);
router.route('/:id/like').put(authMiddleware_1.protect, postController_1.likePost);
router.route('/:id/comment').post(authMiddleware_1.protect, postController_1.addComment);
router.route('/:id/comment/:commentId').delete(authMiddleware_1.protect, postController_1.deleteComment);
exports.default = router;
