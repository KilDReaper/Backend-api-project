import User from "../user.model.js";

export const authRepository = {
  findByEmail: async (email) => {
    return await User.findOne({ email });
  },

  create: async (data) => {
    return await User.create(data);
  },
};
