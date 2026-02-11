import { supabase } from './supabaseService';
import { OnboardingRequest } from '../types';

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
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        const requestNumber = generateRequestNumber();
        const approvalToken = generateApprovalToken();

        const requestData = {
            ...data,
            request_number: requestNumber,
            approval_token: approvalToken,
            status: 'Pending Approval',
        };

        const { data: request, error } = await supabase
            .from('onboarding_requests')
            .insert([requestData])
            .select()
            .single();

        if (error) {
            console.error('Error creating onboarding request:', error);
            return { success: false, error: error.message };
        }

        return { success: true, request };
    } catch (error: any) {
        console.error('Error in createOnboardingRequest:', error);
        return { success: false, error: error.message };
    }
}

// Get all onboarding requests (admin view)
export async function getOnboardingRequests(statusFilter?: string): Promise<OnboardingRequest[]> {
    try {
        if (!supabase) return [];

        let query = supabase
            .from('onboarding_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'All') {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching onboarding requests:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getOnboardingRequests:', error);
        return [];
    }
}

// Get request by approval token (for HOD approval page)
export async function getRequestByToken(token: string): Promise<OnboardingRequest | null> {
    try {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('onboarding_requests')
            .select('*')
            .eq('approval_token', token)
            .single();

        if (error) {
            console.error('Error fetching request by token:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getRequestByToken:', error);
        return null;
    }
}

// Update request status (admin)
export async function updateRequestStatus(id: string, status: string): Promise<boolean> {
    try {
        if (!supabase) return false;

        const updateData: any = { status, updated_at: new Date().toISOString() };

        if (status === 'Completed') {
            updateData.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('onboarding_requests')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating request status:', error);
            return false;
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
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        const updateData: any = {
            hod_comments: hodComments,
            updated_at: new Date().toISOString(),
        };

        if (action === 'approve') {
            updateData.status = 'Approved';
            updateData.approved_at = new Date().toISOString();
            if (oneDriveNotes) {
                updateData.onedrive_notes = oneDriveNotes;
            }
        } else {
            updateData.status = 'Rejected';
            updateData.rejected_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('onboarding_requests')
            .update(updateData)
            .eq('approval_token', token);

        if (error) {
            console.error('Error approving/rejecting request:', error);
            return { success: false, error: error.message };
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
        const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

        const response = await fetch('http://localhost:3001/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                request,
                appUrl,
            }),
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}
