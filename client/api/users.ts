// client/api/users.ts
import api from "./api";

export type UserRole = "user" | "agent" | "manager" | "admin";
export type UserStatus = "available" | "busy" | "offline";

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status?: UserStatus;
  phone?: string;
  expertise?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** Payload used by POST /api/users */
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  status?: UserStatus;
  phone?: string;
  expertise?: string[];
}

/** Payload used by PUT /api/users/:id */
export type UpdateUserPayload = {
  name?: string;
  role?: UserRole;
  department?: string;
  status?: UserStatus;
  phone?: string;
  expertise?: string[];
};

/* =========================
   Helpers
========================= */

// Support multiple API response shapes:
// - [users]
// - { users: [...] }
// - { data: [...] }
// - { results: [...] }
function unwrapUsers(data: any): UserDTO[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

/* =========================
   API Functions
========================= */

export async function getUsers(params?: Record<string, any>): Promise<UserDTO[]> {
  const res = await api.get("/api/users", { params });
  return unwrapUsers(res.data);
}

export async function getUserById(id: string): Promise<UserDTO> {
  const res = await api.get(`/api/users/${id}`);
  return res.data as UserDTO;
}

export async function createUser(payload: CreateUserPayload): Promise<UserDTO> {
  const res = await api.post("/api/users", payload);
  return res.data as UserDTO;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserDTO> {
  const res = await api.put(`/api/users/${id}`, payload);
  return res.data as UserDTO;
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  const res = await api.delete(`/api/users/${id}`);
  return res.data as { message: string };
}
export async function getMyProfile(id: string): Promise<UserDTO> {
  const res = await api.get<UserDTO>(`/api/users/${id}`);
  return res.data;
}
