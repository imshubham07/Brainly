import express from "express";
import bcrypt from "bcrypt";
import z from "zod";
import { ContentModel, LinkModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./util";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors()); // Middleware to allow cross-origin requests.

const signupValid = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 character")
    .regex(/^[a-z0-9_]+$/, "Only LowerCase, Number and UnderScore allowed"),
  password: z.string().min(8, "password must be 8"),
});

const signinValid = z.object({
  username: z.string().min(4, "Username must be at least 4 character"),
  password: z.string().min(8, "Password must be at least 8 "),
});

app.post("/api/v1/signup", async (req, res) => {
  try {
    const { username, password } = signupValid.parse(req.body);
    const hasedPassword = await bcrypt.hash(password, 8);

    await UserModel.create({
      username: username,
      password: hasedPassword,
    });

    res.status(200).json({
      message: "User signed up",
    });
  } catch (error) {
    res.status(411).json({
      message: "user already exist",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  try {
    const { username, password } = signinValid.parse(req.body);
    const existingUser = await UserModel.findOne({
      username,
    });
    if (!existingUser || !existingUser.password) {
      res.status(403).json({
        message: "invalid username or password",
      });
    } else {
      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (existingUser && passwordMatch) {
        const token = jwt.sign(
          {
            id: existingUser._id,
          },
          JWT_PASSWORD
        );

        res.json({
          token,
        });
      } else {
        res.status(403).json({
          message: "invaild Credential",
        });
      }
    }
  } catch (error) {
    res.json({
      message: error,
    });
  }
});

app.post("/api/v1/content", userMiddleware, (req, res) => {
  try {
    const { link, type } = req.body;

    ContentModel.create({
      link,
      type,
      userId: req.userId,
      tag: [],
    });
    res.json({
      message: "Content Added",
    });
  } catch (e) {
    res.json({
      message: "somthing went wrong",
      error: e,
    });
  }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
      userId,
    }).populate("userId", "username");
    res.json({
      content,
    });
  } catch (error) {
    res.json({
      message: error,
    });
  }
});

app.delete("/api/v1/content/:id", userMiddleware, async (req, res) => {
  try {
    const contentId = req.params.id;

    const result = await ContentModel.findOneAndDelete({
      _id: contentId,
      userId: req.userId,
    });
    
    if (!result) {
      res.status(404).json({ message: "Content not found or you don't have permission to delete it" });
      return;
    }
    
    res.json({
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ message: "Failed to delete content" });
  }
});

// Share Brain Endpoints

// Endpoint to create or remove a share link
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  try {
    const share = req.body.share;
    if (share) {
      const existingLink = await LinkModel.findOne({
        userId: req.userId,
      });
      if (existingLink) {
        res.json({
          hash: existingLink.hash,
        });
        return;
      }
      const hash = random(12);
      await LinkModel.create({
        userId: req.userId,
        hash: hash,
      });
      res.json({
        msg: "updated shared successfully",
        hash,
      });
    } else {
      await LinkModel.deleteOne({
        userId: req.userId,
      });
      res.json({
        msg: "removed Link",
      });
    }
  } catch (error) {
    res.status(500).json({
      msg: "something went wrong",
    });
  }
});

// Add this new endpoint to match the frontend expectation
app.get("/api/v1/brain/share/:hash", async (req, res) => {
  try {
    const hash = req.params.hash;
    const link = await LinkModel.findOne({
      hash,
    });
    if (!link) {
      res.status(404).json({
        message: "Share link not found or expired",
      });
      return;
    }
    const contents = await ContentModel.find({
      userId: link.userId,
    });
    const user = await UserModel.findOne({
      _id: link.userId,
    });
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    res.json({
      username: user?.username,
      contents: contents, // Changed to "contents" to match frontend expectation
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// Keep the original endpoint for backward compatibility
app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({
      hash,
    });
    if (!link) {
      res.status(411).json({
        message: "Sorry Incorrect input",
      });
      return;
    }
    const content = await ContentModel.find({
      userId: link.userId,
    });
    const user = await UserModel.findOne({
      _id: link.userId,
    });
    if (!user) {
      res.status(411).json({
        message: "user not Found, error should ideally not",
      });
      return;
    }
    res.json({
      username: user?.username,
      content: content,
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

// Add this new endpoint to check if a brain is currently shared
app.get("/api/v1/brain/share/status", userMiddleware, async (req, res) => {
  try {
    const existingLink = await LinkModel.findOne({
      userId: req.userId,
    });
    
    if (existingLink) {
      res.json({
        isShared: true,
        hash: existingLink.hash
      });
    } else {
      res.json({
        isShared: false
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      isShared: false
    });
  }
});

app.listen(3000);
