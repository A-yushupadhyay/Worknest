// /frontend/src/types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  columnId: string;
  projectId: string;
  assignee?: User;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  title: string;
}

export interface Project {
  _id: string;
  name: string;
  orgId: string;
  description?: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  _id: string;
  orgId: string;
  userId: User;
  role: 'org_admin' | 'member' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'comment' | 'assignment' | 'invite';

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  author: User;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocketJoinPayload {
  orgId: string;
  projectId: string;
}


export interface Org {
  _id: string;
  name: string;
  slug: string;
  owner: string;   // ✅ add this field
  createdAt?: string;
  updatedAt?: string;
};