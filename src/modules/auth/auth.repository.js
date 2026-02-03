import User from "../../models/user.model.js";

export const authRepository = {
  create: (data) => User.create(data),

  findByEmail: (email) => User.findOne({ email }),

  findByEmailWithPassword: (email) =>
    User.findOne({ email }).select("+password"),

  findById: (id) => User.findById(id),

  update: (id, data) =>
    User.findByIdAndUpdate(id, data, { new: true }),

  updateProfileImage: (id, avatarUrl) =>
    User.findByIdAndUpdate(id, { avatarUrl }, { new: true }),
};
