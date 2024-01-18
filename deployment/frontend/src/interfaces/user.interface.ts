export interface User {
  id?: string;
  name?: string;
  fullname?: string;
  created?: string;
  about?: string;
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
  capacity?: string;
}

