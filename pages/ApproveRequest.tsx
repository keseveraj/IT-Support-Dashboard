import React, { useState, useEffect } from 'react';
import { getRequestByToken, approveOrRejectRequest, sendOnboardingEmail } from '../services/onboardingService';
import { OnboardingRequest } from '../types';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface ApproveRequestProps {
    token: string;
}

const ApproveRequest: React.FC<ApproveRequestProps> = ({ token }) => {
    const [request, setRequest] = useState<OnboardingRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [hodComments, setHodComments] = useState('');
    const [oneDriveNotes, setOneDriveNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRequest();
    }, [token]);

    const loadRequest = async () => {
        if (!token) {
            setError('Invalid approval link');
            setLoading(false);
            return;
        }

        const data = await getRequestByToken(token);
        if (!data) {
            setError('Request not found or link has expired');
            setLoading(false);
            return;
        }

        if (data.status !== 'Pending Approval') {
            setError(`This request has already been ${data.status.toLowerCase()}`);
            setLoading(false);
            return;
        }

        setRequest(data);
        setLoading(false);
    };

    const handleSubmit = async (selectedAction: 'approve' | 'reject') => {
        if (!token || !request) return;

        if (!hodComments.trim()) {
            setError('Please provide comments');
            return;
        }

        setSubmitting(true);
        setError(null);

        const result = await approveOrRejectRequest(
            token,
            selectedAction,
            hodComments,
            selectedAction === 'approve' ? oneDriveNotes : undefined
        );

        if (!result.success) {
            setError(result.error || 'Failed to process request');
            setSubmitting(false);
            return;
        }

        // Send notification to IT if approved
        if (selectedAction === 'approve') {
            const updatedRequest = {
                ...request,
                status: 'Approved' as const,
                hod_comments: hodComments,
                onedrive_notes: oneDriveNotes,
            };
            await sendOnboardingEmail('it_notification', updatedRequest);
        }

        setAction(selectedAction);
        setCompleted(true);
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Loading request...</p>
                </div>
            </div>
        );
    }

    if (error && !request) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-300">{error}</p>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className={`w-16 h-16 ${action === 'approve' ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-red-100 dark:bg-red-900'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        {action === 'approve' ? (
                            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <XCircle size={32} className="text-red-600 dark:text-red-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {action === 'approve' ? 'Request Approved!' : 'Request Rejected'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {action === 'approve'
                            ? 'The IT team has been notified and will proceed with the onboarding setup.'
                            : 'The request has been rejected and the employee has been notified.'}
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Request Number</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{request?.request_number}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!request) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Onboarding Request Approval</h1>
                    <p className="text-gray-600 dark:text-gray-300">Review and approve the onboarding request below</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Request #{request.request_number}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Employee Details */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Employee Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-medium text-gray-900 dark:text-white">{request.employee_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                                <p className="font-medium text-gray-900 dark:text-white">{request.position}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium text-gray-900 dark:text-white">{request.employee_email}</p>
                            </div>
                            {request.employee_phone && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{request.employee_phone}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                                <p className="font-medium text-gray-900 dark:text-white">{request.company_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                                <p className="font-medium text-gray-900 dark:text-white">{request.department}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {new Date(request.start_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
                        <div className="space-y-2">
                            {request.needs_email && (
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CheckCircle2 size={20} className="text-emerald-600" />
                                    <span>Company Email Account</span>
                                </div>
                            )}
                            {request.needs_laptop && (
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CheckCircle2 size={20} className="text-emerald-600" />
                                    <span>Laptop/PC Setup</span>
                                </div>
                            )}
                            {request.needs_onedrive && (
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CheckCircle2 size={20} className="text-emerald-600" />
                                    <span>OneDrive Account</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {request.additional_notes && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Additional Notes</h2>
                            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                {request.additional_notes}
                            </p>
                        </div>
                    )}

                    {/* HOD Input */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Decision</h2>

                        {request.needs_onedrive && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    OneDrive Setup Instructions (Optional)
                                </label>
                                <textarea
                                    value={oneDriveNotes}
                                    onChange={(e) => setOneDriveNotes(e.target.value)}
                                    rows={3}
                                    placeholder="e.g., Share with existing account or create new account..."
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white resize-none"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Comments *
                            </label>
                            <textarea
                                value={hodComments}
                                onChange={(e) => setHodComments(e.target.value)}
                                rows={4}
                                required
                                placeholder="Provide your comments or additional instructions..."
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white resize-none"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSubmit('approve')}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Approve Request
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => handleSubmit('reject')}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <XCircle size={20} />
                            Reject Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApproveRequest;
