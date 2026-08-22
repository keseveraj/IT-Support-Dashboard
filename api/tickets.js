// Serverless Tickets API for cross-device synchronization
// Syncs tickets to Supabase and provides unified cloud persistence

export default async function handler(req, res) {
    // Set CORS headers
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

    // GET /api/tickets -> fetch all tickets from database
    if (req.method === 'GET') {
        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/tickets?select=*&order=created_at.desc`, {
                headers,
                signal: AbortSignal.timeout(6000)
            });

            if (resp.ok) {
                const tickets = await resp.json();
                return res.status(200).json({ success: true, source: 'supabase', data: tickets });
            } else {
                return res.status(200).json({ success: false, source: 'fallback', error: 'Supabase paused or unreachable', data: [] });
            }
        } catch (e) {
            return res.status(200).json({ success: false, source: 'fallback', error: e.message, data: [] });
        }
    }

    // POST /api/tickets -> create or batch sync tickets
    if (req.method === 'POST') {
        const ticketData = req.body;
        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
                method: 'POST',
                headers,
                body: JSON.stringify(ticketData),
                signal: AbortSignal.timeout(6000)
            });

            if (resp.ok) {
                const inserted = await resp.json();
                return res.status(200).json({ success: true, data: inserted });
            } else {
                const errText = await resp.text();
                return res.status(200).json({ success: false, error: errText });
            }
        } catch (e) {
            return res.status(200).json({ success: false, error: e.message });
        }
    }

    // DELETE /api/tickets -> delete a ticket by id
    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ success: false, error: 'Missing ticket id' });
        }

        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/tickets?id=eq.${id}`, {
                method: 'DELETE',
                headers,
                signal: AbortSignal.timeout(6000)
            });

            return res.status(200).json({ success: resp.ok });
        } catch (e) {
            return res.status(200).json({ success: false, error: e.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
