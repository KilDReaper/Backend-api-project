
import * as authService from "./auth.service.js"; 

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body); 
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, token: result.token });
  } catch (err) {
    next(err);
  }
};