// Serverless Tickets API for cross-device synchronization
// Syncs tickets to Supabase and provides unified cloud persistence fallback

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
    
    // Cloud fallback store for when Supabase is paused
    const FALLBACK_STORE_ID = 'ff8081819ff5b11001a027dc89c97394';
    const FALLBACK_URL = `https://api.restful-api.dev/objects/${FALLBACK_STORE_ID}`;

    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    // Helper to get fallback data
    async function getFallbackTickets() {
        try {
            const resp = await fetch(FALLBACK_URL);
            if (resp.ok) {
                const doc = await resp.json();
                return doc.data?.tickets || [];
            }
        } catch(e) {}
        return [];
    }

    // Helper to save fallback data
    async function saveFallbackTickets(tickets) {
        try {
            await fetch(FALLBACK_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: "IT-Support-Tickets-Production-Sync", data: { tickets } })
            });
        } catch(e) {}
    }

    // GET
    if (req.method === 'GET') {
        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/tickets?select=*&order=created_at.desc`, {
                headers, signal: AbortSignal.timeout(4000)
            });
            if (resp.ok) {
                const tickets = await resp.json();
                return res.status(200).json({ success: true, source: 'supabase', data: tickets });
            }
        } catch (e) {}
        
        // Supabase failed/paused, use fallback
        const fallbackTickets = await getFallbackTickets();
        return res.status(200).json({ success: true, source: 'fallback', data: fallbackTickets });
    }

    // POST (Create/Update)
    if (req.method === 'POST') {
        const ticketData = req.body;
        const isArray = Array.isArray(ticketData);
        const newTickets = isArray ? ticketData : [ticketData];

        let supabaseSuccess = false;
        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
                method: 'POST', headers, body: JSON.stringify(ticketData), signal: AbortSignal.timeout(4000)
            });
            if (resp.ok) supabaseSuccess = true;
        } catch (e) {}

        // Even if Supabase succeeds or fails, save to fallback store just in case
        const existing = await getFallbackTickets();
        const existingMap = new Map(existing.map(t => [t.id || t.ticket_number, t]));
        newTickets.forEach(t => existingMap.set(t.id || t.ticket_number, t));
        const combined = Array.from(existingMap.values());
        await saveFallbackTickets(combined);

        return res.status(200).json({ success: true, source: supabaseSuccess ? 'supabase+fallback' : 'fallback', data: ticketData });
    }

    // DELETE
    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, error: 'Missing ticket id' });

        try {
            await fetch(`${SUPABASE_URL}/rest/v1/tickets?id=eq.${id}`, {
                method: 'DELETE', headers, signal: AbortSignal.timeout(4000)
            });
        } catch (e) {}

        // Delete from fallback
        const existing = await getFallbackTickets();
        const filtered = existing.filter(t => t.id !== id && t.ticket_number !== id);
        await saveFallbackTickets(filtered);

        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
