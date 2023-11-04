export interface CkanResponse<T> {
  help: string;
  success: boolean;
  result: T;
}

export interface User {
  id?: string;
  name?: string;
  fullname?: string;
  created?: string;
  about?: null;
  activity_streams_email_notifications?: boolean;
  sysadmin?: boolean;
  state?: "active" | "inactive" | "deleted";
  image_url?: string;
  display_name?: string;
  email_hash?: string;
  number_created_packages?: number;
  apikey?: string;
  email?: string;
  image_display_url?: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  user_id: string;
  object_id?: string;
  activity_type: string;
  user_data?: User;
  data: Record<string, { title?: string }>;
}

export interface ActivityDisplay {
  description: string,
  time: string,
  icon: string
}