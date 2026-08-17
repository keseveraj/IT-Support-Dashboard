// Telegram Notification Service for IT Support Tickets

interface TicketNotificationData {
    ticket_number?: string;
    user_name: string;
    user_email?: string;
    company_name?: string;
    department?: string;
    computer_name?: string;
    issue_type: string;
    priority?: string;
    description: string;
    remote_id?: string;
    remote_password?: string;
}

export async function sendTelegramTicketNotification(ticket: TicketNotificationData): Promise<{ success: boolean; error?: string }> {
    try {
        const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
        const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';
        const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

        if (!botToken || !chatId) {
            console.warn('⚠️ Telegram bot token or chat ID not configured. Skipping Telegram notification.');
            return { success: false, error: 'Telegram configuration missing' };
        }

        // Format priority emoji
        let priorityEmoji = '🟢';
        if (ticket.priority === 'Urgent') priorityEmoji = '🔴';
        else if (ticket.priority === 'High') priorityEmoji = '🟠';
        else if (ticket.priority === 'Normal') priorityEmoji = '🟡';

        const lines = [
            `🎫 <b>NEW IT SUPPORT TICKET</b>`,
            ``,
            `<b>Ticket #:</b> <code>${ticket.ticket_number || 'New'}</code>`,
            `<b>User:</b> ${ticket.user_name} ${ticket.user_email ? `(&lt;${ticket.user_email}&gt;)` : ''}`,
            `<b>Company:</b> ${ticket.company_name || 'N/A'}`,
            `<b>Department:</b> ${ticket.department || 'N/A'}`,
            ticket.computer_name ? `<b>Computer:</b> <code>${ticket.computer_name}</code>` : '',
            `<b>Category:</b> <b>${ticket.issue_type}</b>`,
            `<b>Priority:</b> ${priorityEmoji} <b>${ticket.priority || 'Normal'}</b>`,
            ``,
            `<b>📝 Description:</b>`,
            `<i>${ticket.description}</i>`,
        ].filter(Boolean);

        if (ticket.remote_id) {
            lines.push(
                ``,
                `🖥️ <b>Remote Access (TeamViewer):</b>`,
                `• ID: <code>${ticket.remote_id}</code>`,
                ticket.remote_password ? `• Password: <code>${ticket.remote_password}</code>` : ''
            );
        }

        lines.push(
            ``,
            `👉 <a href="${appUrl}/?page=tickets"><b>Click Here to View Ticket in Dashboard</b></a>`
        );

        const messageText = lines.filter(Boolean).join('\n');

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'HTML',
                disable_web_page_preview: false,
            }),
        });

        const result = await response.json();
        if (result.ok) {
            console.log('✅ Telegram notification sent successfully');
            return { success: true };
        } else {
            console.error('❌ Telegram API error:', result.description);
            return { success: false, error: result.description };
        }
    } catch (err: any) {
        console.error('❌ Error sending Telegram notification:', err);
        return { success: false, error: err.message };
    }
}

export async function sendTelegramApprovalNotification(data: {
    action: 'approve' | 'reject';
    request_number: string;
    employee_name: string;
    position: string;
    department: string;
    company_name: string;
    start_date: string;
    hod_name: string;
    hod_comments?: string;
    onedrive_notes?: string;
    needs_email?: boolean;
    needs_laptop?: boolean;
    needs_onedrive?: boolean;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
        const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';
        const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

        if (!botToken || !chatId) {
            return { success: false, error: 'Telegram configuration missing' };
        }

        const isApproved = data.action === 'approve';
        const statusEmoji = isApproved ? '✅' : '❌';
        const statusText = isApproved ? 'APPROVED' : 'REJECTED';

        const lines = [
            `${statusEmoji} <b>ONBOARDING REQUEST ${statusText} BY HOD</b>`,
            ``,
            `<b>Request #:</b> <code>${data.request_number}</code>`,
            `<b>Employee:</b> ${data.employee_name} (${data.position})`,
            `<b>Company:</b> ${data.company_name} • ${data.department}`,
            `<b>Start Date:</b> ${data.start_date ? new Date(data.start_date).toLocaleDateString() : 'TBD'}`,
            `<b>HOD:</b> ${data.hod_name}`,
            ``,
            isApproved ? `<b>Requirements to Setup:</b>` : '',
            isApproved && data.needs_email ? `• ✅ Company Email Account` : '',
            isApproved && data.needs_laptop ? `• ✅ Laptop/PC Setup` : '',
            isApproved && data.needs_onedrive ? `• ✅ OneDrive Account` : '',
            data.onedrive_notes ? `<i>OneDrive notes: ${data.onedrive_notes}</i>` : '',
            ``,
            data.hod_comments ? `<b>💬 HOD Comments:</b>\n<i>"${data.hod_comments}"</i>` : '',
            ``,
            isApproved
                ? `👉 <a href="${appUrl}/?page=tickets"><b>Click Here to Open Tickets & Proceed Setup</b></a>`
                : `👉 <a href="${appUrl}/?page=onboarding"><b>Click Here to View in Onboarding Admin</b></a>`
        ].filter(Boolean);

        const messageText = lines.join('\n');
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'HTML',
            }),
        });

        const result = await response.json();
        return { success: !!result.ok };
    } catch (err: any) {
        console.error('Error sending Telegram approval notification:', err);
        return { success: false, error: err.message };
    }
}

