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
            `👉 <a href="${appUrl}/"><b>Click Here to Open Dashboard & View Ticket</b></a>`
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
