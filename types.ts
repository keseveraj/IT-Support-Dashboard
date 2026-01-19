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
