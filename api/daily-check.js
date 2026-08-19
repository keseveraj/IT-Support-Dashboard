// Vercel Cloud Serverless Cron Function
// Triggered automatically by Vercel Cloud Cron every morning at 8:00 AM (MYT / UTC+8)
// Runs 100% in the cloud — NO laptop needs to be turned on!

export default async function handler(req, res) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8853646983:AAEkQNVqmPS2bh6uWEjqwUgP84rnuZ9Sfyg';
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1043546954';
    const APP_URL = 'https://it-support-dashboard.vercel.app';

    const startTime = new Date();
    // Format in Malaysia Time (Asia/Kuala_Lumpur)
    const dateStr = startTime.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    const timeStr = startTime.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const results = {
        dashboard: false,
        submitForm: false,
        onboardingForm: false,
        emailApi: false,
    };

    // 1. Dashboard root check
    try {
        const r = await fetch(APP_URL, { signal: AbortSignal.timeout(8000) });
        results.dashboard = r.ok;
    } catch (e) {
        console.warn('Dashboard check failed:', e.message);
    }

    // 2. Submit form check
    try {
        const r = await fetch(`${APP_URL}/submit`, { signal: AbortSignal.timeout(8000) });
        results.submitForm = r.ok;
    } catch (e) {
        console.warn('Submit form check failed:', e.message);
    }

    // 3. Onboarding form check
    try {
        const r = await fetch(`${APP_URL}/onboarding`, { signal: AbortSignal.timeout(8000) });
        results.onboardingForm = r.ok;
    } catch (e) {
        console.warn('Onboarding form check failed:', e.message);
    }

    // 4. Serverless Email API check
    try {
        const r = await fetch(`${APP_URL}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
            signal: AbortSignal.timeout(8000),
        });
        results.emailApi = (r.status === 400 || r.status === 200);
    } catch (e) {
        console.warn('Email API check failed:', e.message);
    }

    const allHealthy = results.dashboard && results.submitForm && results.onboardingForm && results.emailApi;
    const overallIcon = allHealthy ? '🟢 ALL SYSTEMS OPERATIONAL' : '⚠️ ATTENTION REQUIRED';

    const reportMessage = `
🌅 <b>Daily IT Dashboard Morning Check</b>
📅 <b>Date:</b> ${dateStr} at ${timeStr} (MYT)

<b>System Status:</b> ${overallIcon}

• <b>Main Dashboard:</b> ${results.dashboard ? '✅ Online' : '❌ Down'}
• <b>Ticket Form (/submit):</b> ${results.submitForm ? '✅ Online' : '❌ Down'}
• <b>Onboarding Form (/onboarding):</b> ${results.onboardingForm ? '✅ Online' : '❌ Down'}
• <b>Email API (Serverless):</b> ${results.emailApi ? '✅ Ready' : '❌ Down'}

🔗 <a href="${APP_URL}">Open IT Support Dashboard</a>
`.trim();

    try {
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const teleRes = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: reportMessage,
                parse_mode: 'HTML',
            }),
        });
        const teleData = await teleRes.json();
        return res.status(200).json({ success: true, allHealthy, telegramSent: teleData.ok, timestamp: startTime.toISOString() });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
}
