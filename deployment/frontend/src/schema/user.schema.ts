import { z } from "zod";

export const UserFormSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  fullname: z.string().optional(),
  image_url: z.string().optional(),
  email: z.string().email("Email is invalid"),
  oldpassword: z.string().min(8).max(100).nullable().optional(),
  password: z.string().min(8).max(100).nullable().optional(),
  confirm: z.string().min(8).max(100).nullable().optional(),
});

export interface UserSchema {
  id?: string;
  name: string;
  fullname?: string;
  image_url?: string;
  email: string;
  password?: string;
}

export type UserFormInput = z.infer<typeof UserFormSchema>;