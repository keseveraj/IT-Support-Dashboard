import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createSolution } from '../services/supabaseService';

interface AddSolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: {
        title: string;
        issue_type: string;
        symptoms: string;
        steps: string;
    };
}

const AddSolutionModal: React.FC<AddSolutionModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [solution, setSolution] = useState({
        title: '',
        issue_type: 'Software',
        symptoms: '',
        steps: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setSolution(initialData);
        } else if (isOpen) {
            // Reset if no initial data
            setSolution({
                title: '',
                issue_type: 'Software',
                symptoms: '',
                steps: ''
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        if (!solution.title || !solution.symptoms || !solution.steps) return;

        setLoading(true);
        const stepsArray = solution.steps.split('\n').filter(s => s.trim());
        await createSolution({
            title: solution.title,
            issue_type: solution.issue_type,
            symptoms: solution.symptoms,
            steps: stepsArray
        });
        setLoading(false);
        onSuccess();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Solution</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                        <input
                            type="text"
                            value={solution.title}
                            onChange={(e) => setSolution({ ...solution, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white transition-all"
                            placeholder="e.g., Printer Offline Fix"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type</label>
                        <select
                            value={solution.issue_type}
                            onChange={(e) => setSolution({ ...solution, issue_type: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                        >
                            <option value="Software">Software</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Network">Network</option>
                            <option value="Printer">Printer</option>
                            <option value="Email">Email</option>
                            <option value="Access">Access</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symptoms *</label>
                        <input
                            type="text"
                            value={solution.symptoms}
                            onChange={(e) => setSolution({ ...solution, symptoms: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white transition-all"
                            placeholder="e.g., Printer shows offline status"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resolution Steps * (one per line)</label>
                        <textarea
                            rows={5}
                            value={solution.steps}
                            onChange={(e) => setSolution({ ...solution, steps: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white resize-none transition-all"
                            placeholder="1. Restart Print Spooler service&#10;2. Check cable connections&#10;3. Reinstall printer driver"
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !solution.title || !solution.steps}
                        className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Solution'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSolutionModal;
