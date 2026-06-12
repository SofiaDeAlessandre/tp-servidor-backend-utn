import { User } from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  try {
    const { body } = req;
    const { password, username, email } = body;

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      return res
        .status(409)
        .json({ success: false, error: "Conflict, user already exists" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format.",
      });
    }

    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/;
    if (!regex.test(password)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid password. It must contain at least 8 characters, one uppercase letter, one number, and one special character.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
    });

    const publicDataUser = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
    res.json({
      success: true,
      data: publicDataUser,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error registering user" });
  }
};

const login = async (req, res) => {
  try {
    const { body } = req;

    const { email, password } = body;

    if (!email || !password) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const isValid = await bcrypt.compare(password, foundUser.password);

    if (!isValid) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // TOKEN JWT → Json Web Token

    const payload = {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
    };
    const secretKey = process.env.JWT_SECRET;

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    res.json({ success: true, data: { token }, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error logging in" });
  }
};

export { register, login };
