const express = require('express');
const cors = require('cors');
const https = require('https');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Enable CORS for all origins (adjust for production)
app.use(cors());
app.use(express.json());

// SMTP Configuration
const smtpConfig = {
    host: process.env.SMTP_HOST || 'mail.graduanbersatu.com.my',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // use SSL
    auth: {
        user: process.env.SMTP_USER || 'it.support@graduanbersatu.com.my',
        pass: process.env.SMTP_PASS || 'graduan@1234'
    }
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'cPanel Proxy Server is running' });
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
    try {
        const { type, request, appUrl } = req.body;

        if (!type || !request) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const transporter = nodemailer.createTransporter(smtpConfig);

        let mailOptions = {};

        if (type === 'hod_approval') {
            // Email to HOD for approval
            const approvalLink = `${appUrl}/approve/${request.approval_token}`;

            mailOptions = {
                from: `"IT Support" <${smtpConfig.auth.user}>`,
                to: request.hod_email,
                subject: `Onboarding Request Approval Required - ${request.employee_name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">New Employee Onboarding Request</h2>
                        <p>Dear ${request.hod_name},</p>
                        <p>A new employee onboarding request requires your approval:</p>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Employee Name:</strong> ${request.employee_name}</p>
                            <p><strong>Position:</strong> ${request.position}</p>
                            <p><strong>Department:</strong> ${request.department}</p>
                            <p><strong>Company:</strong> ${request.company_name}</p>
                            <p><strong>Start Date:</strong> ${new Date(request.start_date).toLocaleDateString()}</p>
                            <p><strong>Email:</strong> ${request.employee_email}</p>
                            ${request.employee_phone ? `<p><strong>Phone:</strong> ${request.employee_phone}</p>` : ''}
                        </div>
                        
                        <h3>Requirements:</h3>
                        <ul>
                            ${request.needs_email ? '<li>✅ Company Email Account</li>' : ''}
                            ${request.needs_laptop ? '<li>✅ Laptop/PC Setup</li>' : ''}
                            ${request.needs_onedrive ? '<li>✅ OneDrive Account</li>' : ''}
                        </ul>
                        
                        ${request.additional_notes ? `<p><strong>Additional Notes:</strong><br>${request.additional_notes}</p>` : ''}
                        
                        <div style="margin: 30px 0;">
                            <a href="${approvalLink}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Review & Approve Request
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 12px;">Request Number: ${request.request_number}</p>
                    </div>
                `
            };
        } else if (type === 'it_notification') {
            // Email to IT when approved
            mailOptions = {
                from: `"IT Support" <${smtpConfig.auth.user}>`,
                to: smtpConfig.auth.user,
                subject: `Onboarding Request Approved - ${request.employee_name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">Onboarding Request Approved</h2>
                        <p>The following onboarding request has been approved by ${request.hod_name}:</p>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Employee Name:</strong> ${request.employee_name}</p>
                            <p><strong>Position:</strong> ${request.position}</p>
                            <p><strong>Department:</strong> ${request.department}</p>
                            <p><strong>Company:</strong> ${request.company_name}</p>
                            <p><strong>Start Date:</strong> ${new Date(request.start_date).toLocaleDateString()}</p>
                            <p><strong>Email:</strong> ${request.employee_email}</p>
                            ${request.employee_phone ? `<p><strong>Phone:</strong> ${request.employee_phone}</p>` : ''}
                        </div>
                        
                        <h3>Requirements:</h3>
                        <ul>
                            ${request.needs_email ? '<li>✅ Company Email Account</li>' : ''}
                            ${request.needs_laptop ? '<li>✅ Laptop/PC Setup</li>' : ''}
                            ${request.needs_onedrive ? '<li>✅ OneDrive Account</li>' : ''}
                        </ul>
                        
                        ${request.onedrive_notes ? `<p><strong>OneDrive Notes (from HOD):</strong><br>${request.onedrive_notes}</p>` : ''}
                        ${request.hod_comments ? `<p><strong>HOD Comments:</strong><br>${request.hod_comments}</p>` : ''}
                        
                        <p style="margin-top: 20px;"><strong>Please proceed with the setup.</strong></p>
                        <p style="color: #6b7280; font-size: 12px;">Request Number: ${request.request_number}</p>
                    </div>
                `
            };
        } else if (type === 'confirmation') {
            // Confirmation email to employee
            mailOptions = {
                from: `"IT Support" <${smtpConfig.auth.user}>`,
                to: request.employee_email,
                subject: `Onboarding Request Received - ${request.request_number}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">Onboarding Request Received</h2>
                        <p>Dear ${request.employee_name},</p>
                        <p>Your onboarding request has been successfully submitted and is pending approval from ${request.hod_name}.</p>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Request Number:</strong> ${request.request_number}</p>
                            <p><strong>Status:</strong> Pending Approval</p>
                            <p><strong>Submitted:</strong> ${new Date(request.created_at).toLocaleString()}</p>
                        </div>
                        
                        <p>You will be notified once your request is approved and processed.</p>
                        <p>If you have any questions, please contact IT Support.</p>
                    </div>
                `
            };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent (${type}):`, info.messageId);

        res.json({ success: true, messageId: info.messageId });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send email'
        });
    }
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
