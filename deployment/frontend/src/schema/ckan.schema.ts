import type { Dataset, Group, Organization, User as CkanUser } from "@portaljs/ckan";
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

export interface WriDataset extends Dataset {
  summary?: string;
  technical_notes?: string;
  temporal_coverage?: string;
  update_frequency?: string;
  visibility_type?: string;
  short_description?: string;
  projects?: string[];
  reason_for_adding?: string;
  featured_dataset?: boolean;
  application?: string;
  cautions?: string;
  citation?: string;
  function?: string;
  isopen?: boolean;
  learn_more?: string;
  restrictions?: string;
}

export interface WriOrganization extends Organization {
  groups?: Group[];
  users?: WriUser[];
}

export interface WriUser extends CkanUser {
  capacity?: string;
}