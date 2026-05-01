"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../app");
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ message: 'Please add all fields' });
            return;
        }
        const userExists = yield app_1.prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield app_1.prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Please add all fields' });
            return;
        }
        const user = yield app_1.prisma.user.findUnique({
            where: { email },
        });
        if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        }
        else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.login = login;
