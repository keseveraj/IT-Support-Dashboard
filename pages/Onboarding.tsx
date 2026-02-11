import React, { useState } from 'react';
import { createOnboardingRequest, sendOnboardingEmail } from '../services/onboardingService';
import { UserPlus, Building2, Mail, Phone, Calendar, Briefcase, User, CheckCircle2 } from 'lucide-react';

const Onboarding: React.FC = () => {
    const [formData, setFormData] = useState({
        employee_name: '',
        employee_email: '',
        employee_phone: '',
        department: '',
        company_name: '',
        position: '',
        start_date: '',
        hod_name: '',
        hod_email: '',
        needs_email: false,
        needs_laptop: false,
        needs_onedrive: false,
        additional_notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [requestNumber, setRequestNumber] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        setFormData({ ...formData, [target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create the onboarding request
            const result = await createOnboardingRequest(formData);

            if (!result.success || !result.request) {
                setError(result.error || 'Failed to create request');
                setLoading(false);
                return;
            }

            setRequestNumber(result.request.request_number);

            // Send emails
            await sendOnboardingEmail('hod_approval', result.request);
            await sendOnboardingEmail('confirmation', result.request);

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Your onboarding request has been successfully submitted.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Request Number</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{requestNumber}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        An approval email has been sent to your HOD. You will be notified once your request is approved.
                    </p>
                    <button
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({
                                employee_name: '',
                                employee_email: '',
                                employee_phone: '',
                                department: '',
                                company_name: '',
                                position: '',
                                start_date: '',
                                hod_name: '',
                                hod_email: '',
                                needs_email: false,
                                needs_laptop: false,
                                needs_onedrive: false,
                                additional_notes: '',
                            });
                        }}
                        className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                    >
                        Submit Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-4">
                        <UserPlus size={32} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New Employee Onboarding</h1>
                    <p className="text-gray-600 dark:text-gray-300">Submit your onboarding request to get started</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Employee Information */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <User size={20} className="text-emerald-600" />
                            Employee Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="employee_name"
                                    value={formData.employee_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Personal Email (for contact)
                                </label>
                                <input
                                    type="email"
                                    name="employee_email"
                                    value={formData.employee_email}
                                    onChange={handleChange}
                                    placeholder="personal@gmail.com"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="employee_phone"
                                    value={formData.employee_phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Position *
                                </label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Company & Department */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Building2 size={20} className="text-emerald-600" />
                            Company & Department
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Company Name *
                                </label>
                                <select
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Company</option>
                                    <option value="Graduan Bersatu Padat Sdn. Bhd.">Graduan Bersatu Padat Sdn. Bhd.</option>
                                    <option value="Greenfield Facility Management Sdn.Bhd.">Greenfield Facility Management Sdn.Bhd.</option>
                                    <option value="Bright Pest Service (M) Sdn Bhd">Bright Pest Service (M) Sdn Bhd</option>
                                    <option value="Revon Malaya">Revon Malaya</option>
                                    <option value="Apollo Logistic Sdn Bhd">Apollo Logistic Sdn Bhd</option>
                                    <option value="Max Health Pharma Sdn Bhd">Max Health Pharma Sdn Bhd</option>
                                    <option value="Bright Environment Sdn. Bhd.">Bright Environment Sdn. Bhd.</option>
                                    <option value="Cool Man Acond Service Sdn Bhd">Cool Man Acond Service Sdn Bhd</option>
                                    <option value="Bright Cleaning Service - Enterprise">Bright Cleaning Service - Enterprise</option>
                                    <option value="G Cleaning Services - Enterprise">G Cleaning Services - Enterprise</option>
                                    <option value="Kaw Kaw Kopitiam">Kaw Kaw Kopitiam</option>
                                    <option value="Telur Maju Setia">Telur Maju Setia</option>
                                    <option value="SBX Workshop">SBX Workshop</option>
                                    <option value="Pentalead Sdn. Bhd.">Pentalead Sdn. Bhd.</option>
                                    <option value="Lava's Holiday Sdn Bhd">Lava's Holiday Sdn Bhd</option>
                                    <option value="Healix Healthcare Sdn Bhd">Healix Healthcare Sdn Bhd</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Department *
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                >
                                    <option value="">Select Department</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Intern">Intern</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* HOD Information */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-emerald-600" />
                            Head of Department (HOD)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    HOD Name *
                                </label>
                                <input
                                    type="text"
                                    name="hod_name"
                                    value={formData.hod_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    HOD Email *
                                </label>
                                <input
                                    type="email"
                                    name="hod_email"
                                    value={formData.hod_email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <input
                                    type="checkbox"
                                    name="needs_email"
                                    checked={formData.needs_email}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">Company Email Account</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Create a new company email address</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <input
                                    type="checkbox"
                                    name="needs_laptop"
                                    checked={formData.needs_laptop}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">Laptop/PC Setup</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Prepare a laptop or desktop computer</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <input
                                    type="checkbox"
                                    name="needs_onedrive"
                                    checked={formData.needs_onedrive}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">OneDrive Account</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Setup OneDrive cloud storage access</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            name="additional_notes"
                            value={formData.additional_notes}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Any special requirements or additional information..."
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Onboarding Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
