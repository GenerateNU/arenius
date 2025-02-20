import { SignupRequest } from "@/types";
import apiClient from "./apiClient";

export async function signup(item: SignupRequest) {
    const response = await apiClient.post("/auth/signup", item);
    return response; 
}