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
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = __importDefault(require("zod"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const util_1 = require("./util");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)()); // Middleware to allow cross-origin requests.
const signupValid = zod_1.default.object({
    username: zod_1.default
        .string()
        .min(4, "Username must be at least 4 character")
        .regex(/^[a-z0-9_]+$/, "Only LowerCase, Number and UnderScore allowed"),
    password: zod_1.default.string().min(8, "password must be 8"),
});
const signinValid = zod_1.default.object({
    username: zod_1.default.string().min(4, "Username must be at least 4 character"),
    password: zod_1.default.string().min(8, "Password must be at least 8 "),
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = signupValid.parse(req.body);
        const hasedPassword = yield bcrypt_1.default.hash(password, 8);
        yield db_1.UserModel.create({
            username: username,
            password: hasedPassword,
        });
        res.status(200).json({
            message: "User signed up",
        });
    }
    catch (error) {
        res.status(411).json({
            message: "user already exist",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = signinValid.parse(req.body);
        const existingUser = yield db_1.UserModel.findOne({
            username,
        });
        if (!existingUser || !existingUser.password) {
            res.status(403).json({
                message: "invalid username or password",
            });
        }
        else {
            const passwordMatch = yield bcrypt_1.default.compare(password, existingUser.password);
            if (existingUser && passwordMatch) {
                const token = jsonwebtoken_1.default.sign({
                    id: existingUser._id,
                }, config_1.JWT_PASSWORD);
                res.json({
                    token,
                });
            }
            else {
                res.status(403).json({
                    message: "invaild Credential",
                });
            }
        }
    }
    catch (error) {
        res.json({
            message: error,
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => {
    try {
        const { link, type } = req.body;
        db_1.ContentModel.create({
            link,
            type,
            userId: req.userId,
            tag: [],
        });
        res.json({
            message: "Content Added",
        });
    }
    catch (e) {
        res.json({
            message: "somthing went wrong",
            error: e,
        });
    }
});
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const content = yield db_1.ContentModel.find({
            userId,
        }).populate("userId", "username");
        res.json({
            content,
        });
    }
    catch (error) {
        res.json({
            message: error,
        });
    }
}));
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentId = req.body.contentId;
        yield db_1.ContentModel.deleteMany({
            contentId,
            userId: req.userId,
        });
        res.json({
            message: "Content deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting content:", error);
        res.status(500).json({ message: "Failed to delete content" });
    }
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const share = req.body.share;
        if (share) {
            const existingLInk = yield db_1.LinkModel.findOne({
                userId: req.userId,
            });
            if (existingLInk) {
                res.json({
                    hash: existingLInk.hash,
                });
                return;
            }
            const hash = (0, util_1.random)(12);
            yield db_1.LinkModel.create({
                userId: req.userId,
                hash: hash,
            });
            res.json({
                msg: "updated shared sucessfully",
                hash,
            });
        }
        else {
            yield db_1.LinkModel.deleteOne({
                userId: req.userId,
            });
            res.json({
                msg: "removed Link",
            });
        }
    }
    catch (error) {
        res.json({
            msg: "somthing went wrong",
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        const link = yield db_1.LinkModel.findOne({
            hash,
        });
        if (!link) {
            res.status(411).json({
                message: "Sorry Incorect input",
            });
            return;
        }
        const content = yield db_1.ContentModel.find({
            userId: link.userId,
        });
        const user = yield db_1.UserModel.findOne({
            _id: link.userId,
        });
        if (!user) {
            res.status(411).json({
                message: "user not Found, error  should ideally not",
            });
            return;
        }
        res.json({
            username: user === null || user === void 0 ? void 0 : user.username,
            content: content,
        });
    }
    catch (error) {
        res.json({
            message: "something went wrong",
        });
    }
}));
app.listen(3000);
