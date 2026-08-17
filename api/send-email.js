const nodemailer = require('nodemailer');

// Vercel Serverless Function: /api/send-email
module.exports = async (req, res) => {
    // Enable CORS
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

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { type, request, appUrl } = req.body;

        if (!type || !request) {
            return res.status(400).json({ success: false, error: 'Missing required parameters' });
        }

        const smtpHost = process.env.SMTP_HOST || 'mail.graduanbersatu.com.my';
        const smtpPort = parseInt(process.env.SMTP_PORT) || 465;
        const smtpUser = process.env.SMTP_USER || 'it.support@graduanbersatu.com.my';
        const smtpPass = process.env.SMTP_PASS || 'graduan@1234';

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const baseUrl = appUrl || process.env.VITE_APP_URL || 'https://it-support-dashboard-chi.vercel.app';
        let mailOptions = {};

        if (type === 'hod_approval') {
            const approvalLink = `${baseUrl}/approve/${request.approval_token}`;

            mailOptions = {
                from: `"IT Support" <${smtpUser}>`,
                to: request.hod_email,
                subject: `Onboarding Request Approval Required - ${request.employee_name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
                        <h2 style="color: #10b981; margin-top: 0;">New Employee Onboarding Request</h2>
                        <p>Dear ${request.hod_name},</p>
                        <p>A new employee onboarding request requires your review and approval:</p>
                        
                        <div style="background: #f9fafb; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                            <p style="margin: 6px 0;"><strong>Employee Name:</strong> ${request.employee_name}</p>
                            <p style="margin: 6px 0;"><strong>Position:</strong> ${request.position}</p>
                            <p style="margin: 6px 0;"><strong>Department:</strong> ${request.department}</p>
                            <p style="margin: 6px 0;"><strong>Company:</strong> ${request.company_name}</p>
                            <p style="margin: 6px 0;"><strong>Start Date:</strong> ${request.start_date ? new Date(request.start_date).toLocaleDateString() : 'TBD'}</p>
                            <p style="margin: 6px 0;"><strong>Email:</strong> ${request.employee_email || 'To be created'}</p>
                            ${request.employee_phone ? `<p style="margin: 6px 0;"><strong>Phone:</strong> ${request.employee_phone}</p>` : ''}
                        </div>
                        
                        <h3 style="color: #374151;">Requirements:</h3>
                        <ul style="color: #4b5563; line-height: 1.6;">
                            ${request.needs_email ? '<li>✅ Company Email Account</li>' : ''}
                            ${request.needs_laptop ? '<li>✅ Laptop / PC Setup</li>' : ''}
                            ${request.needs_onedrive ? '<li>✅ OneDrive Account</li>' : ''}
                        </ul>
                        
                        ${request.additional_notes ? `<p style="background: #fffbeb; padding: 12px; border-radius: 6px; border: 1px solid #fde68a;"><strong>Additional Notes:</strong><br>${request.additional_notes}</p>` : ''}
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${approvalLink}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Review & Approve Request
                            </a>
                        </div>
                        
                        <p style="color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 24px;">
                            Request Number: ${request.request_number}
                        </p>
                    </div>
                `
            };
        } else if (type === 'it_notification') {
            mailOptions = {
                from: `"IT Support" <${smtpUser}>`,
                to: smtpUser,
                subject: `Onboarding Request Approved - ${request.employee_name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #10b981;">Onboarding Request Approved</h2>
                        <p>The following onboarding request has been approved by ${request.hod_name}:</p>
                        
                        <div style="background: #f9fafb; padding: 18px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Employee:</strong> ${request.employee_name} (${request.position})</p>
                            <p><strong>Company:</strong> ${request.company_name} - ${request.department}</p>
                            <p><strong>Start Date:</strong> ${request.start_date ? new Date(request.start_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                        
                        <h3>Requirements Checklist:</h3>
                        <ul>
                            ${request.needs_email ? '<li>✅ Company Email Account</li>' : ''}
                            ${request.needs_laptop ? '<li>✅ Laptop Setup</li>' : ''}
                            ${request.needs_onedrive ? `<li>✅ OneDrive Account: <i>${request.onedrive_notes || 'Standard'}</i></li>` : ''}
                        </ul>
                        
                        ${request.hod_comments ? `<p><strong>HOD Comments:</strong><br>${request.hod_comments}</p>` : ''}
                        
                        <p style="margin-top: 24px;">
                            <a href="${baseUrl}/?page=tickets" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
                                Open Tickets Dashboard
                            </a>
                        </p>
                    </div>
                `
            };
        } else if (type === 'confirmation') {
            mailOptions = {
                from: `"IT Support" <${smtpUser}>`,
                to: request.employee_email,
                subject: `Onboarding Request Received - ${request.employee_name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #10b981;">Welcome to ${request.company_name}!</h2>
                        <p>Dear ${request.employee_name},</p>
                        <p>Your onboarding request (${request.request_number}) has been received and sent to your HOD (${request.hod_name}) for approval.</p>
                        <p>The IT team will prepare your setup once approved.</p>
                    </div>
                `
            };
        }

        const info = await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
