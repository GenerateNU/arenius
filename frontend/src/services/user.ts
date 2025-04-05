import { UpdateUserProfileRequest, User } from "../types";
import apiClient from "./apiClient";

export async function fetchUser(userId: string): Promise<User | null> {
  try {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  req: UpdateUserProfileRequest
): Promise<User | null> {
  try {
    const response = await apiClient.patch(`/user/${userId}`, req);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile", error);
    return null;
  }
}
