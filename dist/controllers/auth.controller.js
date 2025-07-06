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
exports.logout = exports.loginUser = exports.registerUser = void 0;
const zod_1 = require("../utils/zod");
const formatZodError_1 = require("../utils/formatZodError");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = zod_1.registerSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ errors: (0, formatZodError_1.formatZodError)(validation.error) });
            return;
        }
        const { username, fullName, email, password } = validation.data;
        const existingUser = yield prisma.user.findFirst({
            where: {
                email,
            },
        });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 9);
        const user = yield prisma.user.create({
            data: {
                username,
                fullName,
                email,
                password: hashedPassword,
            },
        });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
        yield prisma.userVerification.create({
            data: {
                verifyCode,
                verifyCodeExpiry,
                user: {
                    connect: { id: user.id },
                },
            },
        });
        yield (0, email_1.sendVerificationEmail)(email, verifyCode, username);
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {});
        res
            .status(200)
            .cookie("authToken", token, {
            httpOnly: true,
        })
            .json({
            message: "user created successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            error: "An error occurred during registration",
        });
        console.error(error);
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = zod_1.loginSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ errors: (0, formatZodError_1.formatZodError)(validation.error) });
            return;
        }
        const { email, password } = validation.data;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET);
        res
            .status(200)
            .cookie("authToken", token, { httpOnly: true })
            .json({
            message: "sign in successful",
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during sign in" });
    }
});
exports.loginUser = loginUser;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("authToken", { httpOnly: true });
        res.status(200).json({ message: "Sign out successful" });
    }
    catch (error) {
        console.error("Error during signout:", error);
        res.status(500).json({ error: "An error occurred during signout" });
    }
});
exports.logout = logout;
