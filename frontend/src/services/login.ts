import { LoginRequest } from "@/types";
import apiClient from "./apiClient";

export async function login(item: LoginRequest) {
    try {
        const response = await apiClient.post("/auth/login", item);
        return response; 
    } catch (error) {
        console.error("Error logging into user account", error);
        throw error; 
    }
}

