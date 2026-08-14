import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./config";

export const loginAdmin = async (email, password) => {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const logoutAdmin = async () => {
  return await signOut(auth);
};