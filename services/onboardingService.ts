import { supabase, createTicket } from './supabaseService';
import { sendTelegramTicketNotification } from './telegramService';
import { OnboardingRequest } from '../types';

const LOCAL_ONBOARDING_KEY = 'it_support_onboarding_requests';

const getStoredOnboarding = (): OnboardingRequest[] => {
    try {
        const raw = localStorage.getItem(LOCAL_ONBOARDING_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveStoredOnboarding = (requests: OnboardingRequest[]) => {
    try {
        localStorage.setItem(LOCAL_ONBOARDING_KEY, JSON.stringify(requests));
    } catch (e) {
        console.error('Failed to save onboarding requests to localStorage:', e);
    }
};

// Generate unique request number
function generateRequestNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ONB-${dateStr}-${randomNum}`;
}

// Generate unique approval token
function generateApprovalToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create new onboarding request
export async function createOnboardingRequest(data: Partial<OnboardingRequest>): Promise<{ success: boolean; request?: OnboardingRequest; error?: string }> {
    try {
        const requestNumber = generateRequestNumber();
        const approvalToken = generateApprovalToken();
        const now = new Date().toISOString();

        const requestData: OnboardingRequest = {
            id: `onb-${Date.now()}`,
            ...data,
            request_number: requestNumber,
            approval_token: approvalToken,
            status: 'Pending Approval',
            created_at: now,
        } as OnboardingRequest;

        // 1. Save to local storage
        const currentList = getStoredOnboarding();
        saveStoredOnboarding([requestData, ...currentList]);

        // 2. Also create a corresponding IT ticket in the tickets list so it's tracked as a task!
        const requirementsList = [
            data.needs_email ? 'Company Email' : null,
            data.needs_laptop ? 'Laptop/PC Setup' : null,
            data.needs_onedrive ? 'OneDrive Account' : null,
        ].filter(Boolean).join(', ');

        const ticketDescription = [
            `New Employee Onboarding: ${data.employee_name || 'New Staff'} (${data.position || 'Staff'})`,
            `Start Date: ${data.start_date || 'TBD'}`,
            `Requirements: ${requirementsList || 'Standard Setup'}`,
            `HOD: ${data.hod_name || 'N/A'} (${data.hod_email || 'N/A'})`,
            data.additional_notes ? `Notes: ${data.additional_notes}` : '',
            `Request #: ${requestNumber}`
        ].filter(Boolean).join(' | ');

        await createTicket({
            user_name: data.employee_name || 'New Staff',
            user_email: data.employee_email || data.hod_email || 'it.support@graduanbersatu.com.my',
            company_name: data.company_name,
            department: data.department,
            computer_name: data.position,
            issue_type: 'Access',
            priority: 'High',
            description: ticketDescription,
        });

        // Send Telegram alert for new onboarding
        sendTelegramTicketNotification({
            ticket_number: requestNumber,
            user_name: `${data.employee_name} (New Staff)`,
            user_email: data.employee_email,
            company_name: data.company_name,
            department: data.department,
            computer_name: data.position,
            issue_type: 'Staff Onboarding',
            priority: 'High',
            description: `Onboarding request for ${data.employee_name} (${data.position}). HOD: ${data.hod_name} (${data.hod_email}). Requires: ${requirementsList || 'Standard Setup'}.`,
        }).catch(console.warn);

        // 3. Sync to Supabase if connected
        if (supabase) {
            try {
                const { data: dbRequest, error } = await supabase
                    .from('onboarding_requests')
                    .insert([requestData])
                    .select()
                    .single();

                if (!error && dbRequest) {
                    return { success: true, request: dbRequest };
                }
            } catch (e) {
                console.warn('Supabase insert failed, onboarding saved locally:', e);
            }
        }

        return { success: true, request: requestData };
    } catch (error: any) {
        console.error('Error in createOnboardingRequest:', error);
        return { success: false, error: error.message };
    }
}

// Get all onboarding requests (admin view)
export async function getOnboardingRequests(statusFilter?: string): Promise<OnboardingRequest[]> {
    const localRequests = getStoredOnboarding();

    // 1. Try serverless cloud sync endpoint
    try {
        const res = await fetch('/api/onboarding', { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const result = await res.json();
            if (result.success && result.data && result.data.length > 0) {
                const remoteIds = new Set(result.data.map((d: any) => d.id || d.request_number));
                const uniqueLocals = localRequests.filter(lr => !remoteIds.has(lr.id) && !remoteIds.has(lr.request_number));
                const combined = [...uniqueLocals, ...result.data] as OnboardingRequest[];
                saveStoredOnboarding(combined);
                if (statusFilter && statusFilter !== 'All') {
                    return combined.filter(r => r.status === statusFilter);
                }
                return combined;
            }
        }
    } catch (e) {}

    // 2. Direct Supabase query
    if (supabase) {
        try {
            let query = supabase
                .from('onboarding_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter && statusFilter !== 'All') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                const remoteIds = new Set(data.map(d => d.id || d.request_number));
                const uniqueLocals = localRequests.filter(lr => !remoteIds.has(lr.id) && !remoteIds.has(lr.request_number));
                const combined = [...uniqueLocals, ...data] as OnboardingRequest[];
                saveStoredOnboarding(combined);
                return combined;
            }
        } catch (e) {
            console.warn('Supabase fetch onboarding requests failed, using local:', e);
        }
    }

    if (statusFilter && statusFilter !== 'All') {
        return localRequests.filter(r => r.status === statusFilter);
    }
    return localRequests;
}

// Get request by approval token (for HOD approval page)
export async function getRequestByToken(token: string): Promise<OnboardingRequest | null> {
    try {
        // 1. Check local storage first
        const localList = getStoredOnboarding();
        const localMatch = localList.find(r => r.approval_token === token);
        if (localMatch) return localMatch;

        // 2. Check Supabase if connected
        if (supabase) {
            const { data, error } = await supabase
                .from('onboarding_requests')
                .select('*')
                .eq('approval_token', token)
                .single();

            if (!error && data) return data;
        }

        return null;
    } catch (error) {
        console.error('Error in getRequestByToken:', error);
        return null;
    }
}

// Update request status (admin)
export async function updateRequestStatus(id: string, status: string): Promise<boolean> {
    try {
        const localList = getStoredOnboarding();
        const updatedLocals = localList.map(r => r.id === id || r.request_number === id ? { ...r, status } : r);
        saveStoredOnboarding(updatedLocals);

        if (supabase) {
            const updateData: any = { status, updated_at: new Date().toISOString() };
            if (status === 'Completed') {
                updateData.completed_at = new Date().toISOString();
            }

            await supabase
                .from('onboarding_requests')
                .update(updateData)
                .eq('id', id);
        }

        return true;
    } catch (error) {
        console.error('Error in updateRequestStatus:', error);
        return false;
    }
}

// Approve or reject request (HOD)
export async function approveOrRejectRequest(
    token: string,
    action: 'approve' | 'reject',
    hodComments: string,
    oneDriveNotes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const now = new Date().toISOString();
        const status = action === 'approve' ? 'Approved' : 'Rejected';

        // 1. Update local storage
        const localList = getStoredOnboarding();
        const target = localList.find(r => r.approval_token === token);

        const updatedLocals = localList.map(r => {
            if (r.approval_token === token) {
                return {
                    ...r,
                    status,
                    hod_comments: hodComments,
                    onedrive_notes: action === 'approve' ? oneDriveNotes : r.onedrive_notes,
                    approved_at: action === 'approve' ? now : undefined,
                    rejected_at: action === 'reject' ? now : undefined,
                    updated_at: now,
                };
            }
            return r;
        });
        saveStoredOnboarding(updatedLocals);

        // 2. Sync to Supabase if connected
        if (supabase) {
            const updateData: any = {
                status,
                hod_comments: hodComments,
                updated_at: now,
            };

            if (action === 'approve') {
                updateData.approved_at = now;
                if (oneDriveNotes) {
                    updateData.onedrive_notes = oneDriveNotes;
                }
            } else {
                updateData.rejected_at = now;
            }

            await supabase
                .from('onboarding_requests')
                .update(updateData)
                .eq('approval_token', token);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in approveOrRejectRequest:', error);
        return { success: false, error: error.message };
    }
}

// Send email notification
export async function sendOnboardingEmail(
    type: 'hod_approval' | 'it_notification' | 'confirmation',
    request: OnboardingRequest
): Promise<{ success: boolean; error?: string }> {
    try {
        const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        
        // Skip confirmation email if no employee email provided
        if (type === 'confirmation' && !request.employee_email) {
            return { success: true };
        }

        // Determine email endpoint:
        // On Vercel / production, use same-origin serverless endpoint /api/send-email
        // On localhost, try localhost:3001 first or /api/send-email
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const endpoints = isLocalhost
            ? ['http://localhost:3001/send-email', '/api/send-email']
            : ['/api/send-email', 'http://localhost:3001/send-email'];

        let lastError = '';
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type,
                        request,
                        appUrl,
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    return result;
                }
            } catch (err: any) {
                lastError = err.message;
            }
        }

        return { success: false, error: lastError || 'Email endpoint unreachable' };
    } catch (error: any) {
        console.warn('Error in sendOnboardingEmail:', error);
        return { success: false, error: error.message };
    }
}

