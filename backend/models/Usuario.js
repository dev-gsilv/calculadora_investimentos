import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    nome: String,
    email: {
      type: String,
      match: /^[a-z0-9.!#$%&'*+\-/=?^_`{|]+@[a-z0-9-]+\.[a-z]+(?:\.[a-z]+)*$/gi,
    },
    senha: { type: String },
    role: {
      type: String,
      default: "usuario",
    },
  },
  { timestamps: true },
);

const Usuario = mongoose.model("Usuario", userSchema);

export default Usuario;
