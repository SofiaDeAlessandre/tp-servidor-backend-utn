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

    const hashPassword = await bcrypt.hash(password, 10);

    // El primer usuario registrado es admin, el resto son user
    const usersCount = await User.countDocuments();
    const role = usersCount === 0 ? "admin" : "user";

    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
      role,
    });

    const publicDataUser = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
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
      role: foundUser.role,
    };
    const secretKey = process.env.JWT_SECRET;

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    res.json({ success: true, data: { token }, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error logging in" });
  }
};

export { register, login };
