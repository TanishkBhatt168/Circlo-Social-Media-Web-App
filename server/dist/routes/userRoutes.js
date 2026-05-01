"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
router.get('/search', userController_1.searchUsers); // Public or Protected? Let's keep public for now or protected
router.get('/:id', userController_1.getUserProfile);
router.post('/:id/follow', authMiddleware_1.protect, userController_1.followUser);
router.post('/:id/unfollow', authMiddleware_1.protect, userController_1.unfollowUser);
router.put('/:id/avatar', authMiddleware_1.protect, uploadMiddleware_1.upload.single('avatar'), userController_1.updateProfilePhoto);
exports.default = router;
