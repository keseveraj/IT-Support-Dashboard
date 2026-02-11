// Test email sending via proxy server
const testEmailSending = async () => {
    const testRequest = {
        request_number: 'ONB-TEST-001',
        employee_name: 'Test Employee',
        employee_email: 'test@example.com',
        position: 'Test Position',
        department: 'IT',
        company_name: 'Test Company',
        start_date: '2026-02-15',
        hod_name: 'Test HOD',
        hod_email: 'itsupport@graduanbersatu.com', // Your email for testing
        needs_email: true,
        needs_laptop: true,
        needs_onedrive: true,
        additional_notes: 'This is a test',
        approval_token: 'test-token-123',
        created_at: new Date().toISOString()
    };

    try {
        const response = await fetch('http://localhost:3001/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'hod_approval',
                request: testRequest,
                appUrl: 'http://localhost:5173'
            })
        });

        const result = await response.json();
        console.log('✅ Email test result:', result);

        if (result.success) {
            console.log('✅ Email sent successfully! Check your inbox at:', testRequest.hod_email);
        } else {
            console.error('❌ Email failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testEmailSending();
