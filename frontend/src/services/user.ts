import {
    User
} from "../types";
import apiClient from "./apiClient";
  
export async function fetchUser(
userId: string
): Promise<User | null> {
    try {
        const response = await apiClient.get(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }
}