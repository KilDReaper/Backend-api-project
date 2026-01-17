import { authRepository } from "./auth.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async ({ email, password, confirmPassword }) => {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) throw new Error("User already exists");

  if (password !== confirmPassword) throw new Error("Passwords don't match");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await authRepository.create({ email, password: hashedPassword });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });
  return { token };
};