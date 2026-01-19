import { createClient } from '@supabase/supabase-js';
import { Ticket, Solution } from '../types';

// NOTE: In a real environment, these would come from process.env
// We handle safe access to process.env to avoid ReferenceError in browser-only environments.
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return '';
};

const SUPABASE_URL = getEnv('REACT_APP_SUPABASE_URL');
const SUPABASE_KEY = getEnv('REACT_APP_SUPABASE_ANON_KEY');

export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

// Mock Data Generators for Demo Purpose
const generateMockTickets = (): Ticket[] => {
  return Array.from({ length: 25 }).map((_, i) => ({
    id: `t-${i}`,
    ticket_number: `INC-${1000 + i}`,
    user_name: i % 2 === 0 ? 'Alice Johnson' : 'Bob Smith',
    user_email: i % 2 === 0 ? 'alice@company.com' : 'bob@company.com',
    department: ['HR', 'Finance', 'Engineering', 'Sales'][i % 4],
    computer_name: `PC-${['HR', 'FIN', 'ENG', 'SAL'][i % 4]}-0${i}`,
    issue_type: ['Network', 'Software', 'Printer', 'Access'][i % 4] as any,
    priority: ['Urgent', 'High', 'Normal', 'Low'][i % 4] as any,
    status: ['New', 'In Progress', 'Resolved', 'Closed'][i % 4] as any,
    description: 'User is reporting slow system performance and inability to access shared drive.',
    created_at: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(), // Random time last 3 days
    remote_tool: i % 3 === 0 ? 'AnyDesk' : 'TeamViewer',
    remote_id: `${Math.floor(Math.random() * 900000000) + 100000000}`,
    comments: [
      { id: 'c1', author: 'System', text: 'Ticket created', timestamp: new Date().toISOString() }
    ]
  }));
};

const MOCK_TICKETS = generateMockTickets();

const MOCK_SOLUTIONS: Solution[] = [
  {
    id: 's1',
    title: 'Printer Offline Fix',
    issue_type: 'Printer',
    symptoms: 'Printer shows offline status in Windows settings',
    steps: ['Restart Print Spooler service', 'Check physical connection', 'Reinstall driver'],
    times_used: 142,
    success_rate: 98
  },
  {
    id: 's2',
    title: 'VPN Connection Error 619',
    issue_type: 'Network',
    symptoms: 'User cannot connect to corporate VPN from home',
    steps: ['Check internet connection', 'Disable firewall temporarily', 'Update VPN client'],
    times_used: 89,
    success_rate: 85
  }
];

export const fetchTickets = async (): Promise<Ticket[]> => {
  if (supabase) {
    const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    if (!error && data) return data as Ticket[];
  }
  // Simulate delay
  await new Promise(r => setTimeout(r, 800));
  return MOCK_TICKETS;
};

export const fetchSolutions = async (): Promise<Solution[]> => {
  if (supabase) {
    const { data, error } = await supabase.from('solutions').select('*');
    if (!error && data) return data as Solution[];
  }
  return MOCK_SOLUTIONS;
};

export const updateTicketStatus = async (id: string, status: string): Promise<void> => {
  if (supabase) {
    await supabase.from('tickets').update({ status }).eq('id', id);
  } else {
    const t = MOCK_TICKETS.find(t => t.id === id);
    if (t) t.status = status as any;
  }
};
