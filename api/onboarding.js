// Serverless Onboarding API for cross-device synchronization

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zuqqutdhvxxqwulcwqjm.supabase.co';
    const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cXF1dGRodnh4cXd1bGN3cWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjMzNTMsImV4cCI6MjA4NDI5OTM1M30.DybgltfCtLl3yfbuttvKXvKl9g6C_iXUTeDqFSfUCXs';

    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    if (req.method === 'GET') {
        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/onboarding_requests?select=*&order=created_at.desc`, {
                headers,
                signal: AbortSignal.timeout(6000)
            });

            if (resp.ok) {
                const data = await resp.json();
                return res.status(200).json({ success: true, source: 'supabase', data });
            } else {
                return res.status(200).json({ success: false, source: 'fallback', error: 'Supabase paused or unreachable', data: [] });
            }
        } catch (e) {
            return res.status(200).json({ success: false, source: 'fallback', error: e.message, data: [] });
        }
    }

    if (req.method === 'POST') {
        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/onboarding_requests`, {
                method: 'POST',
                headers,
                body: JSON.stringify(req.body),
                signal: AbortSignal.timeout(6000)
            });

            if (resp.ok) {
                const data = await resp.json();
                return res.status(200).json({ success: true, data });
            } else {
                const errText = await resp.text();
                return res.status(200).json({ success: false, error: errText });
            }
        } catch (e) {
            return res.status(200).json({ success: false, error: e.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
