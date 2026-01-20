/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Ticket, Solution, Asset, EmailAccount, Domain, HostingAccount } from '../types';

// NOTE: using import.meta.env for Vite
const getEnv = (key: string) => {
  return import.meta.env[key] || '';
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

// Supabase connection - now enabled with proper tables
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
    remote_tool: 'TeamViewer',
    remote_id: `${Math.floor(Math.random() * 900000000) + 100000000}`,
    remote_password: `${Math.random().toString(36).substring(2, 8)}`,
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
    try {
      const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Ticket[];
      console.warn('Supabase fetch failed or empty, falling back to mock data', error);
    } catch (e) {
      console.error('Supabase error:', e);
    }
  }
  // Simulate delay
  await new Promise(r => setTimeout(r, 800));
  return MOCK_TICKETS;
};

export const fetchSolutions = async (): Promise<Solution[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('solutions').select('*');
      if (!error && data) return data as Solution[];
    } catch (e) {
      console.error('Supabase error:', e);
    }
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

// Create a new ticket (for public submission form)
interface CreateTicketData {
  user_name: string;
  user_email: string;
  company_name?: string;
  department?: string;
  issue_type: string;
  priority?: string;
  description: string;
  remote_id?: string;
  remote_password?: string;
}

export const createTicket = async (ticketData: CreateTicketData): Promise<{ success: boolean; ticketNumber?: string; error?: string }> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          user_name: ticketData.user_name,
          user_email: ticketData.user_email,
          email: ticketData.user_email, // Also set email field for compatibility
          company_name: ticketData.company_name || null,
          department: ticketData.department || null,
          issue_type: ticketData.issue_type,
          priority: ticketData.priority || 'Normal',
          status: 'New',
          description: ticketData.description,
          remote_id: ticketData.remote_id || null,
          remote_password: ticketData.remote_password || null,
          remote_tool: 'TeamViewer',
          comments: JSON.stringify([{ id: 'c1', author: 'System', text: 'Ticket created via web form', timestamp: new Date().toISOString() }])
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create ticket:', error);
        return { success: false, error: error.message };
      }

      const ticketNumber = `INC-${data.id}`;

      // Update ticket_number field
      await supabase.from('tickets').update({ ticket_number: ticketNumber }).eq('id', data.id);

      return { success: true, ticketNumber };
    } catch (e) {
      console.error('Supabase error:', e);
      return { success: false, error: 'Failed to submit ticket' };
    }
  }

  // Mock fallback
  const mockId = Math.floor(Math.random() * 10000);
  return { success: true, ticketNumber: `INC-${mockId}` };
};

// Create a new solution for Knowledge Base
interface CreateSolutionData {
  title: string;
  issue_type: string;
  symptoms: string;
  steps: string[];
}

export const createSolution = async (solutionData: CreateSolutionData): Promise<{ success: boolean; error?: string }> => {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('solutions')
        .insert({
          problem: solutionData.title,
          title: solutionData.title,
          issue_type: solutionData.issue_type,
          symptoms: solutionData.symptoms,
          solution: solutionData.steps.join('\n'),
          steps: solutionData.steps,
          success_rate: 0,
          times_used: 0
        });

      if (error) {
        console.error('Failed to create solution:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e) {
      console.error('Supabase error:', e);
      return { success: false, error: 'Failed to add solution' };
    }
  }

  return { success: true };
};

export const addComment = async (ticketId: string, currentComments: any, newCommentText: string, author: string = 'Admin'): Promise<{ success: boolean; updatedComments?: any[] }> => {
  if (supabase) {
    try {
      // Parse current comments
      let commentsArray: any[] = [];
      if (Array.isArray(currentComments)) {
        commentsArray = currentComments;
      } else if (typeof currentComments === 'string') {
        try {
          commentsArray = JSON.parse(currentComments);
        } catch {
          commentsArray = [];
        }
      }

      const newComment = {
        id: `c${Date.now()}`,
        author,
        text: newCommentText,
        timestamp: new Date().toISOString()
      };

      const updatedComments = [...commentsArray, newComment];

      const { error } = await supabase
        .from('tickets')
        .update({ comments: JSON.stringify(updatedComments) })
        .eq('id', ticketId);

      if (error) {
        console.error('Failed to add comment:', error);
        return { success: false };
      }

      return { success: true, updatedComments };
    } catch (e) {
      console.error('Error adding comment:', e);
      return { success: false };
    }
  }

  // Mock Update
  return { success: true, updatedComments: [] };
};

export const deleteSolution = async (id: string): Promise<{ success: boolean; error?: string }> => {
  if (supabase) {
    try {
      const { error } = await supabase.from('solutions').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete solution:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e) {
      console.error('Supabase error:', e);
      return { success: false, error: 'Failed to delete solution' };
    }
  }
  return { success: true };
};

export const updateSolution = async (id: string, solutionData: Partial<CreateSolutionData>): Promise<{ success: boolean; error?: string }> => {
  if (supabase) {
    try {
      const updatePayload: any = {};
      if (solutionData.title) {
        updatePayload.title = solutionData.title;
        updatePayload.problem = solutionData.title;
      }
      if (solutionData.issue_type) updatePayload.issue_type = solutionData.issue_type;
      if (solutionData.symptoms) updatePayload.symptoms = solutionData.symptoms;
      if (solutionData.steps) {
        updatePayload.steps = solutionData.steps;
        updatePayload.solution = solutionData.steps.join('\n');
      }

      const { error } = await supabase.from('solutions').update(updatePayload).eq('id', id);

      if (error) {
        console.error('Failed to update solution:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e) {
      console.error('Supabase error:', e);
      return { success: false, error: 'Failed to update solution' };
    }
  }
  return { success: true };
};

// --- Asset Management ---

export const fetchAssets = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching assets:', error);
      return [];
    }
    return data as Asset[];
  }
  return [];
};

export const createAsset = async (asset: Partial<Asset>) => {
  if (supabase) {
    const { data, error } = await supabase.from('assets').insert(asset).select().single();
    if (error) {
      console.error('Error creating asset:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  }
  return { success: true };
};

export const updateAsset = async (id: string, updates: Partial<Asset>) => {
  if (supabase) {
    const { error } = await supabase.from('assets').update(updates).eq('id', id);
    if (error) {
      console.error('Error updating asset:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return { success: true };
};

export const deleteAsset = async (id: string) => {
  if (supabase) {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      console.error('Error deleting asset:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return { success: true };
};

// --- Email Accounts Management ---

export const fetchEmailAccounts = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('email_accounts').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching email accounts:', error);
      return [];
    }
    return data as EmailAccount[];
  }
  return [];
};

export const createEmailAccount = async (account: Partial<EmailAccount>) => {
  if (supabase) {
    const { data, error } = await supabase.from('email_accounts').insert(account).select().single();
    if (error) {
      console.error('Error creating email account:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  }
  return { success: true };
};

export const updateEmailAccount = async (id: string, updates: Partial<EmailAccount>) => {
  if (supabase) {
    const { error } = await supabase.from('email_accounts').update(updates).eq('id', id);
    if (error) {
      console.error('Error updating email account:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return { success: true };
};

export const deleteEmailAccount = async (id: string) => {
  if (supabase) {
    const { error } = await supabase.from('email_accounts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting email account:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return { success: true };
};

// --- Domain Management ---

export const fetchDomains = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('domains').select('*').order('expiry_date', { ascending: true });
    if (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
    return data as Domain[];
  }
  return [];
};

export const createDomain = async (domain: Partial<Domain>) => {
  if (supabase) {
    const { data, error } = await supabase.from('domains').insert(domain).select().single();
    if (error) {
      console.error('Error creating domain:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  }
  return { success: true };
};

export const updateDomain = async (id: string, updates: Partial<Domain>) => {
  if (supabase) {
    const { error } = await supabase.from('domains').update(updates).eq('id', id);
    if (error) {
      console.error('Error updating domain:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return { success: true };
};

export const deleteDomain = async (id: string) => {
  if (supabase) {
    const { error } = await supabase.from('domains').delete().eq('id', id);
    if (error) {
      console.error('Error deleting domain:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return { success: true };
};

// --- Hosting Accounts Management ---

export const fetchHostingAccounts = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('hosting_accounts').select('*').order('provider_name', { ascending: true });
    if (error) {
      console.error('Error fetching hosting accounts:', error);
      return [];
    }
    return data as HostingAccount[];
  }
  return [];
};

export const createHostingAccount = async (account: Partial<HostingAccount>) => {
  if (supabase) {
    const { data, error } = await supabase.from('hosting_accounts').insert(account).select().single();
    if (error) {
      console.error('Error creating hosting account:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  }
  return { success: true };
};

export const updateHostingAccount = async (id: string, updates: Partial<HostingAccount>) => {
  if (supabase) {
    const { error } = await supabase.from('hosting_accounts').update(updates).eq('id', id);
    if (error) {
      console.error('Error updating hosting account:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return { success: true };
};

export const deleteHostingAccount = async (id: string) => {
  if (supabase) {
    const { error } = await supabase.from('hosting_accounts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting hosting account:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return { success: true };
};
