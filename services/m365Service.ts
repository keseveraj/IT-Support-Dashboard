
import { EmailAccount } from '../types';

export interface ServiceHealth {
    service: string;
    displayName: string;
    status: 'ServiceOperational' | 'ServiceDegradation' | 'ServiceInterruption' | 'ExtendedRecovery';
    lastUpdated: string;
    incidentId?: string;
    details?: string;
}

// Mock Data for Demo
const MOCK_HEALTH_STATUS: ServiceHealth[] = [
    {
        service: 'Exchange',
        displayName: 'Exchange Online',
        status: 'ServiceOperational',
        lastUpdated: new Date().toISOString()
    },
    {
        service: 'Microsoft365',
        displayName: 'Microsoft 365 Suite',
        status: 'ServiceOperational',
        lastUpdated: new Date().toISOString()
    },
    {
        service: 'Teams',
        displayName: 'Microsoft Teams',
        status: 'ServiceOperational',
        lastUpdated: new Date().toISOString()
    }
];

export const fetchServiceHealth = async (): Promise<ServiceHealth[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Randomly simulate an outage for demonstration purposes (1 in 5 chance)
    // In production, this would call https://graph.microsoft.com/v1.0/admin/serviceAnnouncement/healthOverviews
    const isSimulatedOutage = Math.random() > 0.8;

    if (isSimulatedOutage) {
        return MOCK_HEALTH_STATUS.map(s => {
            if (s.service === 'Exchange') {
                return {
                    ...s,
                    status: 'ServiceDegradation',
                    incidentId: 'EX123456',
                    details: 'Users may differencing delays in email delivery.'
                };
            }
            return s;
        });
    }

    return MOCK_HEALTH_STATUS;
};

// Check for compromised or blocked accounts
export const checkRiskyUsers = async (): Promise<Partial<EmailAccount>[]> => {
    // Simulate checking Graph API: https://graph.microsoft.com/v1.0/identityProtection/riskyUsers
    await new Promise(resolve => setTimeout(resolve, 600));

    return []; // Return empty list for healthy state
};
