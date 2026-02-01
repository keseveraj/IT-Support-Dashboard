import { HostingAccount } from '../types';

interface CpanelResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Execute a cPanel command using local proxy server
 * Make sure the proxy server is running: npm run proxy
 */
export async function executeCpanelCommand(
    account: HostingAccount,
    action: 'create_email' | 'change_password' | 'delete_email' | 'list_emails',
    params: {
        email?: string;
        password?: string;
        domain?: string;
        quota?: number;
    }
): Promise<CpanelResult> {
    const baseUrl = account.control_panel_url?.replace(/\/$/, '');
    const username = account.control_panel_username;
    const password = account.control_panel_password_encrypted;

    if (!baseUrl || !username || !password) {
        return {
            success: false,
            error: 'Missing cPanel credentials. Please update the hosting account with Control Panel URL, Username, and Password.'
        };
    }

    try {
        // Call local proxy server (make sure it's running on port 3001)
        const response = await fetch('http://localhost:3001/cpanel-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cpanelUrl: baseUrl,
                username,
                password,
                action,
                params
            })
        });

        if (!response.ok) {
            const text = await response.text();
            return {
                success: false,
                error: `Proxy server error: ${response.status}. Make sure the proxy server is running (npm run proxy)`
            };
        }

        const data = await response.json();
        return data as CpanelResult;

    } catch (err: any) {
        console.error('cPanel API error:', err);

        // Provide helpful error messages
        if (err.message?.includes('Failed to fetch') || err.message?.includes('ECONNREFUSED')) {
            return {
                success: false,
                error: '❌ Proxy server not running. Please run: npm run proxy'
            };
        }

        return { success: false, error: err.message || 'Unknown error occurred' };
    }
}
