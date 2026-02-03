import { authRepository } from "./auth.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (data) => {
  const { username, email, phoneNumber, password, confirmPassword, role } = data;

  if (!username || !email || !phoneNumber || !password || !confirmPassword) {
    throw new Error("All fields required");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const exists = await authRepository.findByEmail(email);
  if (exists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await authRepository.create({
    username,
    email,
    phoneNumber,
    password: hashed,
    role: role === "admin" ? "admin" : "user",
  });

  user.password = undefined;
  return user;
};

export const login = async ({ email, password }) => {
  if (!email || !password) throw new Error("Missing credentials");

  const user = await authRepository.findByEmailWithPassword(email);
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token };
};

export const getProfile = async (id) => {
  const user = await authRepository.findById(id);
  if (!user) throw new Error("User not found");
  user.password = undefined;
  return user;
};

export const updateProfile = async (id, data) => {
  if (data.password) {
    if (data.password !== data.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    data.password = await bcrypt.hash(data.password, 10);
    delete data.confirmPassword;
  }

  const user = await authRepository.update(id, data);
  if (!user) throw new Error("User not found");
  user.password = undefined;
  return user;
};

export const uploadProfileImage = async (id, url) => {
  const user = await authRepository.updateProfileImage(id, url);
  if (!user) throw new Error("User not found");
  user.password = undefined;
  return user;
};
