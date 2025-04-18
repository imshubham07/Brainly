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

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
      contentId,
      userId: req.userId,
    });
    res.json({
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ message: "Failed to delete content" });
  }
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  try {
    const share = req.body.share;
    if (share) {
      const existingLInk = await LinkModel.findOne({
        userId: req.userId,
      });
      if (existingLInk) {
        res.json({
          hash: existingLInk.hash,
        });
        return;
      }
      const hash = random(12);
      await LinkModel.create({
        userId: req.userId,
        hash: hash,
      });
      res.json({
        msg: "updated shared sucessfully",
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
    res.json({
      msg: "somthing went wrong",
    });
  }
});


app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
      hash,
    });

    if (!link) {
      res.status(411).json({
        message: "Sorry Incorect input",
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
        message: "user not Found, error  should ideally not",
      });
      return;
    }
    res.json({
      username: user?.username,
      content: content,
    });
  } catch (error) {
    res.json({
      message: "something went wrong",
    });
  }
});

app.listen(3000);
