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

const LOCAL_TICKETS_KEY = 'it_support_submitted_tickets';

const getStoredTickets = (): Ticket[] => {
  try {
    const raw = localStorage.getItem(LOCAL_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredTickets = (tickets: Ticket[]) => {
  try {
    localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save tickets to localStorage:', e);
  }
};

export const fetchTickets = async (): Promise<Ticket[]> => {
  const localTickets = getStoredTickets();
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        // Merge remote and local (avoiding duplicates by id)
        const remoteIds = new Set(data.map(d => d.id || d.ticket_number));
        const uniqueLocals = localTickets.filter(lt => !remoteIds.has(lt.id) && !remoteIds.has(lt.ticket_number));
        return [...uniqueLocals, ...data] as Ticket[];
      }
    } catch (e) {
      console.warn('Supabase fetch tickets failed, using local tickets:', e);
    }
  }

  return localTickets;
};

export const fetchSolutions = async (): Promise<Solution[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('solutions').select('*');
      if (!error && data && data.length > 0) return data as Solution[];
    } catch (e) {
      console.warn('Supabase fetch solutions failed:', e);
    }
  }
  return MOCK_SOLUTIONS;
};

export const updateTicketStatus = async (id: string, status: string): Promise<void> => {
  // Update local storage
  const locals = getStoredTickets();
  const updatedLocals = locals.map(t => t.id === id || t.ticket_number === id ? { ...t, status: status as any } : t);
  saveStoredTickets(updatedLocals);

  // Update remote Supabase if available
  if (supabase) {
    try {
      await supabase.from('tickets').update({ status }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update status failed:', e);
    }
  }
};

// Update full ticket fields (for edit)
export const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<{ success: boolean; error?: string }> => {
  // Update localStorage
  const locals = getStoredTickets();
  const updatedLocals = locals.map(t =>
    t.id === id || t.ticket_number === id ? { ...t, ...updates } : t
  );
  saveStoredTickets(updatedLocals);

  // Sync to Supabase
  if (supabase) {
    try {
      await supabase.from('tickets').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase update ticket failed:', e);
    }
  }
  return { success: true };
};

// Delete a ticket by id
export const deleteTicket = async (id: string): Promise<{ success: boolean; error?: string }> => {
  // Remove from localStorage
  const locals = getStoredTickets();
  saveStoredTickets(locals.filter(t => t.id !== id && t.ticket_number !== id));

  // Delete from Supabase
  if (supabase) {
    try {
      await supabase.from('tickets').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete ticket failed:', e);
    }
  }
  return { success: true };
};

// Clear test/dummy tickets (tickets with user_name containing 'test' or 'Test', case-insensitive)
export const clearTestTickets = async (): Promise<number> => {
  const locals = getStoredTickets();
  const isTest = (t: Ticket) =>
    /^test$/i.test(t.user_name?.trim() || '') ||
    (t.user_email?.toLowerCase().includes('test@') ?? false) ||
    (t.description?.toLowerCase().startsWith('test') && t.user_name?.toLowerCase() === 'test');
  const testTickets = locals.filter(isTest);
  const cleaned = locals.filter(t => !isTest(t));
  saveStoredTickets(cleaned);

  // Remove from Supabase
  if (supabase) {
    for (const t of testTickets) {
      try {
        await supabase.from('tickets').delete().eq('id', t.id);
      } catch (e) { /* silent */ }
    }
  }
  return testTickets.length;
};

// Create a new ticket (for public submission form)
interface CreateTicketData {
  user_name: string;
  user_email: string;
  company_name?: string;
  department?: string;
  computer_name?: string;
  issue_type: string;
  priority?: string;
  description: string;
  remote_id?: string;
  remote_password?: string;
}

export const createTicket = async (ticketData: CreateTicketData): Promise<{ success: boolean; ticketNumber?: string; error?: string }> => {
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const ticketNumber = `INC-${dateStr}-${randomSuffix}`;
  const newId = `t-${Date.now()}`;

  const newTicket: Ticket = {
    id: newId,
    ticket_number: ticketNumber,
    user_name: ticketData.user_name,
    user_email: ticketData.user_email,
    company_name: ticketData.company_name || 'Graduan Bersatu',
    department: ticketData.department || 'General',
    computer_name: ticketData.computer_name || '',
    issue_type: ticketData.issue_type as any,
    priority: (ticketData.priority || 'Normal') as any,
    status: 'New',
    description: ticketData.description,
    created_at: timestamp.toISOString(),
    remote_tool: 'TeamViewer',
    remote_id: ticketData.remote_id || undefined,
    remote_password: ticketData.remote_password || undefined,
    comments: [
      { id: `c-${Date.now()}`, author: 'System', text: 'Ticket created via web form', timestamp: timestamp.toISOString() }
    ]
  };

  // 1. Always save to local storage immediately
  const existing = getStoredTickets();
  saveStoredTickets([newTicket, ...existing]);

  // 2. Try to sync to Supabase if connected
  if (supabase) {
    try {
      await supabase
        .from('tickets')
        .insert({
          ticket_number: ticketNumber,
          user_name: ticketData.user_name,
          user_email: ticketData.user_email,
          email: ticketData.user_email,
          company_name: ticketData.company_name || null,
          department: ticketData.department || null,
          computer_name: ticketData.computer_name || null,
          issue_type: ticketData.issue_type,
          priority: ticketData.priority || 'Normal',
          status: 'New',
          description: ticketData.description,
          remote_id: ticketData.remote_id || null,
          remote_password: ticketData.remote_password || null,
          remote_tool: 'TeamViewer',
          comments: JSON.stringify(newTicket.comments)
        });
    } catch (e) {
      console.warn('Supabase remote insert failed, ticket saved locally:', e);
    }
  }

  return { success: true, ticketNumber };
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
