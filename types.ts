export type Priority = 'Urgent' | 'High' | 'Normal' | 'Low';
export type Status = 'New' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
export type IssueType = 'Hardware' | 'Software' | 'Network' | 'Access' | 'Other' | 'Printer' | 'Email';

export interface Ticket {
  id: string;
  ticket_number: string;
  user_name: string;
  user_email: string;
  department: string;
  computer_name: string;
  company_name?: string;
  issue_type: IssueType;
  priority: Priority;
  status: Status;
  description: string;
  created_at: string;
  remote_tool?: 'TeamViewer';
  remote_id?: string;
  remote_password?: string;
  comments: TicketComment[];
  attachment_url?: string;
}

export interface TicketComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Solution {
  id: string;
  title: string;
  issue_type: IssueType;
  symptoms: string;
  steps: string[];
  times_used: number;
  success_rate: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

// --- Asset Management Types ---

export interface Company {
  id: string;
  company_name: string;
  company_code?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  status: 'Active' | 'Inactive' | 'Client';
  relationship?: string;
  notes?: string;
  assets_count: number;
  email_accounts_count: number;
  domains_count: number;
  hosting_accounts_count: number;
  created_at?: string;
}

export interface Asset {
  id: string;
  asset_tag: string;
  asset_type: string;
  category: string;
  brand?: string;
  model?: string;
  serial_number?: string;

  assigned_to_name?: string;
  assigned_to_email?: string;
  assigned_to_department?: string;
  location?: string;
  status: string;

  purchase_date?: string;
  purchase_price?: number;
  supplier?: string;
  invoice_number?: string;
  warranty_expiry?: string;

  specifications?: any;
  software_licenses?: any[];
  network_info?: any;

  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_notes?: string;

  expected_lifespan_years?: number;
  replacement_due_date?: string;

  related_tickets?: string[];
  parent_asset_id?: string;

  photos?: string[];
  documents?: string[];

  created_by?: string;
  created_at: string;
  updated_at?: string;
  disposed_at?: string;
  disposed_reason?: string;
}

export interface EmailAccount {
  id: string;
  email_address: string;
  email_type: 'M365' | 'cPanel';
  user_name: string;
  user_department?: string;
  user_job_title?: string;
  company_name: string;
  company_id?: string;
  status: string;

  m365_license_type?: string;
  m365_user_principal_name?: string;
  m365_object_id?: string;

  cpanel_domain?: string;
  cpanel_quota_mb?: number;
  cpanel_usage_mb?: number;

  mailbox_size_mb?: number;
  created_date?: string;
  last_login_date?: string;
  password_last_changed?: string;

  mfa_enabled?: boolean;

  forwards_to?: string[];
  aliases?: string[];
  member_of_groups?: string[];

  monthly_cost?: number;
  notes?: string;
  scheduled_deletion_date?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Domain {
  id: string;
  domain_name: string;
  domain_type?: string;
  company_name: string;
  purpose?: string;

  registrar: string;
  registrar_account_email?: string;

  registration_date?: string;
  expiry_date: string;
  auto_renew: boolean;
  renewal_cost?: number;
  renewal_period_years?: number;

  nameservers?: string[];
  dns_provider?: string;

  hosting_provider?: string;
  hosting_plan?: string;
  hosting_account_id?: string;
  hosting_control_panel_url?: string;

  server_ip?: string;
  server_location?: string;

  ssl_provider?: string;
  ssl_expiry_date?: string;
  ssl_auto_renew?: boolean;

  status: string;

  email_hosted_here?: boolean;
  email_accounts_count?: number;
  website_hosted_here?: boolean;

  registrar_login_url?: string;
  registrar_username?: string;
  registrar_password_encrypted?: string;

  hosting_login_url?: string;
  hosting_username?: string;
  hosting_password_encrypted?: string;

  notes?: string;
  important_info?: string;

  alert_30_days_sent?: boolean;
  alert_15_days_sent?: boolean;
  alert_7_days_sent?: boolean;
  alert_1_day_sent?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface HostingAccount {
  id: string;
  provider_name: string;
  account_name: string;
  company_name: string;

  hosting_plan?: string;
  plan_name?: string;
  monthly_cost?: number;
  billing_cycle?: string;

  activation_date?: string;
  expiry_date?: string;
  auto_renew?: boolean;

  disk_space_gb?: number;
  disk_used_gb?: number;
  bandwidth_gb?: number;
  email_accounts_limit?: number;
  email_accounts_used?: number;
  databases_limit?: number;
  databases_used?: number;
  domains_limit?: number;
  domains_count?: number;

  control_panel_url?: string;
  control_panel_username?: string;
  control_panel_password_encrypted?: string;

  ssh_access?: boolean;
  ssh_host?: string;
  ssh_port?: number;
  ssh_username?: string;

  server_name?: string;
  server_ip?: string;
  server_location?: string;

  primary_domain?: string;
  addon_domains?: string[];

  ftp_host?: string;
  ftp_username?: string;
  ftp_password_encrypted?: string;

  db_host?: string;
  db_port?: number;
  db_admin_username?: string;
  db_admin_password_encrypted?: string;

  support_email?: string;
  support_phone?: string;
  support_url?: string;

  status: string;
  notes?: string;
  backup_info?: string;

  usage_alert_threshold?: number;
  expiry_alert_sent?: boolean;

  created_at?: string;
  updated_at?: string;
}
