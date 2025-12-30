import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async(req,res)=>{
  const {name,email,password} = req.body;
  let u = new User({name,email});
  await u.setPassword(password);
  await u.save();
  const token = jwt.sign({id:u._id}, process.env.JWT_SECRET);
  res.json({user:u,token});
};

export const login = async(req,res)=>{
  const {email,password} = req.body;
  const u = await User.findOne({email});
  if(!u) return res.status(400).json({message:"Invalid"});
  const ok = await u.comparePassword(password);
  if(!ok) return res.status(400).json({message:"Invalid"});
  const token = jwt.sign({id:u._id}, process.env.JWT_SECRET);
  res.json({user:u,token});
};