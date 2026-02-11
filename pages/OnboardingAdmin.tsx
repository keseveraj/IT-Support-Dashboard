import React, { useState, useEffect } from 'react';
import { getOnboardingRequests, updateRequestStatus } from '../services/onboardingService';
import { OnboardingRequest } from '../types';
import { UserPlus, CheckCircle2, Clock, XCircle, Loader2, Eye } from 'lucide-react';

const OnboardingAdmin: React.FC = () => {
    const [requests, setRequests] = useState<OnboardingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadRequests();
    }, [statusFilter]);

    const loadRequests = async () => {
        setLoading(true);
        const data = await getOnboardingRequests(statusFilter === 'All' ? undefined : statusFilter);
        setRequests(data);
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdating(true);
        const success = await updateRequestStatus(id, newStatus);
        if (success) {
            await loadRequests();
            if (selectedRequest?.id === id) {
                setSelectedRequest({ ...selectedRequest, status: newStatus as any });
            }
        }
        setUpdating(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending Approval':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Approved':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'In Progress':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'Completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending Approval':
                return <Clock size={16} />;
            case 'Approved':
            case 'Completed':
                return <CheckCircle2 size={16} />;
            case 'Rejected':
                return <XCircle size={16} />;
            default:
                return <Clock size={16} />;
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <UserPlus size={28} className="text-emerald-600" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding Requests</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Manage employee onboarding requests</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-2 flex-wrap">
                {['All', 'Pending Approval', 'Approved', 'In Progress', 'Completed', 'Rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${statusFilter === status
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="text-emerald-600 animate-spin" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <UserPlus size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No onboarding requests found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {request.employee_name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            {request.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {request.position} • {request.department} • {request.company_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Request #{request.request_number} • {new Date(request.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedRequest(request)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                    <Eye size={16} />
                                    View Details
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(request.start_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">HOD</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{request.hod_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Requirements</p>
                                    <div className="flex gap-1 mt-1">
                                        {request.needs_email && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Email</span>}
                                        {request.needs_laptop && <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">Laptop</span>}
                                        {request.needs_onedrive && <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">OneDrive</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            {request.status === 'Approved' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(request.id, 'In Progress')}
                                        disabled={updating}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                                    >
                                        Mark In Progress
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(request.id, 'Completed')}
                                        disabled={updating}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                                    >
                                        Mark Completed
                                    </button>
                                </div>
                            )}
                            {request.status === 'In Progress' && (
                                <button
                                    onClick={() => handleStatusUpdate(request.id, 'Completed')}
                                    disabled={updating}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                                >
                                    Mark Completed
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRequest(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Details</h2>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Employee Information</h3>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.employee_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.position}</p>
                                    </div>
                                    {selectedRequest.employee_email && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.employee_email}</p>
                                        </div>
                                    )}
                                    {selectedRequest.employee_phone && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.employee_phone}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.company_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(selectedRequest.start_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">HOD Information</h3>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">HOD Name</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.hod_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">HOD Email</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.hod_email}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
                                <div className="space-y-2">
                                    {selectedRequest.needs_email && (
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                            <CheckCircle2 size={20} className="text-emerald-600" />
                                            <span>Company Email Account</span>
                                        </div>
                                    )}
                                    {selectedRequest.needs_laptop && (
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                            <CheckCircle2 size={20} className="text-emerald-600" />
                                            <span>Laptop/PC Setup</span>
                                        </div>
                                    )}
                                    {selectedRequest.needs_onedrive && (
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                            <CheckCircle2 size={20} className="text-emerald-600" />
                                            <span>OneDrive Account</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedRequest.onedrive_notes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">OneDrive Instructions (from HOD)</h3>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                        {selectedRequest.onedrive_notes}
                                    </p>
                                </div>
                            )}

                            {selectedRequest.additional_notes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Additional Notes</h3>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                        {selectedRequest.additional_notes}
                                    </p>
                                </div>
                            )}

                            {selectedRequest.hod_comments && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">HOD Comments</h3>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                        {selectedRequest.hod_comments}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Status</h3>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 ${getStatusColor(selectedRequest.status)}`}>
                                    {getStatusIcon(selectedRequest.status)}
                                    {selectedRequest.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnboardingAdmin;
