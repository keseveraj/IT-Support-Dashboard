const express = require('express');
const cors = require('cors');
const https = require('https');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all origins (adjust for production)
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'cPanel Proxy Server is running' });
});

// cPanel API proxy endpoint
app.post('/cpanel-api', async (req, res) => {
    try {
        const { cpanelUrl, username, password, action, params } = req.body;

        if (!cpanelUrl || !username || !password || !action) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        // Build the cPanel API endpoint
        const baseUrl = cpanelUrl.replace(/\/$/, '');
        const auth = Buffer.from(`${username}:${password}`).toString('base64');

        let endpoint = '';

        switch (action) {
            case 'create_email': {
                const emailUser = params.email?.split('@')[0] || '';
                const domain = params.domain || '';
                const emailPassword = params.password || '';
                const quota = params.quota || 1024; // MB
                endpoint = `/execute/Email/add_pop?email=${encodeURIComponent(emailUser)}&password=${encodeURIComponent(emailPassword)}&domain=${encodeURIComponent(domain)}&quota=${quota}`;
                break;
            }

            case 'change_password': {
                const emailUser = params.email?.split('@')[0] || '';
                const domain = params.domain || '';
                const newPassword = params.password || '';
                endpoint = `/execute/Email/passwd_pop?email=${encodeURIComponent(emailUser)}&password=${encodeURIComponent(newPassword)}&domain=${encodeURIComponent(domain)}`;
                break;
            }

            case 'delete_email': {
                const emailUser = params.email?.split('@')[0] || '';
                const domain = params.domain || '';
                endpoint = `/execute/Email/delete_pop?email=${encodeURIComponent(emailUser)}&domain=${encodeURIComponent(domain)}`;
                break;
            }

            case 'list_emails': {
                endpoint = `/execute/Email/list_pops`;
                break;
            }

            default:
                return res.status(400).json({
                    success: false,
                    error: `Unknown action: ${action}`
                });
        }

        const targetUrl = `${baseUrl}${endpoint}`;
        console.log(`[${new Date().toISOString()}] ${action} -> ${targetUrl.replace(password, '***')}`);

        // Create HTTPS agent that bypasses SSL verification (for self-signed certs)
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        // Make the cPanel API call
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
            },
            agent: targetUrl.startsWith('https:') ? agent : undefined
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`cPanel API error: ${response.status}`, errorText.substring(0, 200));
            return res.json({
                success: false,
                error: `cPanel API error: ${response.status} ${response.statusText}`
            });
        }

        const data = await response.json();

        // Check for cPanel errors
        if (data.errors && data.errors.length > 0) {
            console.error('cPanel returned errors:', data.errors);
            return res.json({
                success: false,
                error: data.errors.join(', ')
            });
        }

        // Format response for list_emails
        if (action === 'list_emails' && data.data) {
            const emails = data.data.map((item) => item.email);
            console.log(`✅ Listed ${emails.length} email accounts`);
            return res.json({ success: true, data: emails });
        }

        console.log(`✅ ${action} completed successfully`);
        return res.json({ success: true, data: data.data });

    } catch (error) {
        console.error('Proxy server error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   cPanel Proxy Server Running              ║
║   Port: ${PORT}                               ║
║   Health: http://localhost:${PORT}/health     ║
╚════════════════════════════════════════════╝
    `);
});
