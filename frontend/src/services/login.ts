import { LoginRequest } from "@/types";
import apiClient from "./apiClient";

export async function login(item: LoginRequest) {
    const response = await apiClient.post("/auth/login", item);
    return response; 
}