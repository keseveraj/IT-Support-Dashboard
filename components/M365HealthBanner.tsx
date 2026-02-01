
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Server, ShieldAlert } from 'lucide-react';
import { fetchServiceHealth, ServiceHealth } from '../services/m365Service';

const M365HealthBanner: React.FC = () => {
    const [healths, setHealths] = useState<ServiceHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadHealth = async () => {
        setLoading(true);
        try {
            const data = await fetchServiceHealth();
            setHealths(data);
        } catch (err) {
            setError('Failed to fetch M365 status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHealth();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ServiceOperational': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900';
            case 'ServiceDegradation': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
            case 'ServiceInterruption': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'ServiceOperational') return <CheckCircle size={18} />;
        return <AlertTriangle size={18} />;
    };

    const issues = healths.filter(h => h.status !== 'ServiceOperational');
    const isAllHealthy = issues.length === 0;

    if (loading) {
        return (
            <div className="animate-pulse bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-white/10 p-4 mb-6">
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className="mb-6 space-y-4">
            {/* Main Status Card */}
            <div className={`rounded-xl border p-4 flex items-start justify-between ${isAllHealthy
                ? 'bg-white dark:bg-dark-card border-gray-200 dark:border-white/10'
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'}`}>

                <div className="flex gap-4">
                    <div className={`p-3 rounded-full ${isAllHealthy ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'}`}>
                        {isAllHealthy ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {isAllHealthy ? 'All Systems Operational' : 'Service Issue Detected'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {isAllHealthy
                                ? 'Microsoft 365 Exchange, Teams, and Identity services are running normally.'
                                : 'We have detected degraded performance in your tenant.'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={loadHealth}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Incident Details (Only if unhealthy) */}
            {!isAllHealthy && (
                <div className="grid gap-3">
                    {issues.map((issue, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium ${getStatusColor(issue.status)}`}>
                            {getStatusIcon(issue.status)}
                            <span className="flex-1">{issue.displayName}: {issue.status} {issue.incidentId && `(${issue.incidentId})`}</span>
                            {issue.details && <span className="text-xs opacity-80 border-l pl-3 ml-2 border-current">{issue.details}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default M365HealthBanner;
