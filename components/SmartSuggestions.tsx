import React, { useState, useEffect } from 'react';
import { Lightbulb, HelpCircle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchSolutions } from '../services/supabaseService';
import { Ticket, Solution } from '../types';

// Diagnostic questions based on issue type
const DIAGNOSTIC_QUESTIONS: Record<string, string[]> = {
    'Software': [
        'When did this issue start?',
        'Did you install any new software recently?',
        'Have you tried restarting the application?',
        'Does the issue happen with other files/documents?',
        'What error message do you see (if any)?'
    ],
    'Hardware': [
        'Is the device making any unusual sounds?',
        'Are there any visible physical damages?',
        'When did you first notice the problem?',
        'Have you tried unplugging and reconnecting the device?',
        'Does the device work on another computer?'
    ],
    'Network': [
        'Are other websites/applications working?',
        'Are you connected via WiFi or cable?',
        'Have you tried restarting your router/modem?',
        'Are colleagues on the same network affected?',
        'What error message do you see when connecting?'
    ],
    'Printer': [
        'Is the printer showing any error lights?',
        'Can you print a test page from the printer itself?',
        'Is the printer connected via USB or network?',
        'Have you checked the paper and ink/toner levels?',
        'Does the printer appear in Windows devices?'
    ],
    'Email': [
        'Are you getting any error messages?',
        'Can you access email via webmail (browser)?',
        'When was the last time email worked normally?',
        'Is this affecting sending, receiving, or both?',
        'What email client are you using (Outlook, etc)?'
    ],
    'Access': [
        'What resource are you trying to access?',
        'What error message do you see?',
        'Have you recently changed your password?',
        'Did you have access to this resource before?',
        'Are colleagues able to access this resource?'
    ],
    'Other': [
        'Can you describe the issue in more detail?',
        'When did this issue start?',
        'Have you made any recent changes to your computer?',
        'Is anyone else experiencing this issue?',
        'What have you already tried to fix it?'
    ]
};

interface SmartSuggestionsProps {
    ticket: Ticket;
    onCopySolution?: (text: string) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ ticket, onCopySolution }) => {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [matchedSolutions, setMatchedSolutions] = useState<Solution[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<'solutions' | 'questions' | null>('solutions');

    useEffect(() => {
        fetchSolutions().then(data => {
            setSolutions(data);
            // Find matching solutions based on issue type and keywords
            const matches = findMatchingSolutions(data, ticket);
            setMatchedSolutions(matches);
        });
    }, [ticket]);

    const findMatchingSolutions = (allSolutions: Solution[], ticket: Ticket): Solution[] => {
        const description = (ticket.description || '').toLowerCase();
        const issueType = ticket.issue_type || '';

        return allSolutions.filter(sol => {
            // Match by issue type
            if (sol.issue_type === issueType) return true;

            // Match by keywords in description
            const title = (sol.title || '').toLowerCase();
            const symptoms = (sol.symptoms || '').toLowerCase();

            const keywords = description.split(' ').filter(w => w.length > 3);
            for (const keyword of keywords) {
                if (title.includes(keyword) || symptoms.includes(keyword)) return true;
            }

            return false;
        }).slice(0, 3); // Limit to top 3
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        onCopySolution?.(text);
    };

    const issueType = ticket.issue_type || 'Other';
    const questions = DIAGNOSTIC_QUESTIONS[issueType] || DIAGNOSTIC_QUESTIONS['Other'];

    return (
        <div className="space-y-4">
            {/* Suggested Solutions */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-500/20 overflow-hidden">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'solutions' ? null : 'solutions')}
                    className="w-full p-4 flex items-center justify-between text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                            <Lightbulb size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Suggested Solutions</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {matchedSolutions.length} matching solutions from Knowledge Base
                            </p>
                        </div>
                    </div>
                    {expandedSection === 'solutions' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSection === 'solutions' && (
                    <div className="px-4 pb-4 space-y-3">
                        {matchedSolutions.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">
                                No matching solutions found. Consider adding a new solution to the Knowledge Base after resolving this ticket.
                            </p>
                        ) : (
                            matchedSolutions.map(sol => {
                                const stepsArray = Array.isArray(sol.steps) ? sol.steps : [];
                                const solutionText = `${sol.title}\n\nSteps:\n${stepsArray.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
                                return (
                                    <div key={sol.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{sol.title}</h4>
                                            <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                                                {sol.success_rate || 0}% success
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{sol.symptoms}</p>
                                        <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1 mb-3">
                                            {stepsArray.slice(0, 3).map((step, idx) => (
                                                <li key={idx}>{step}</li>
                                            ))}
                                            {stepsArray.length > 3 && (
                                                <li className="text-gray-400">...and {stepsArray.length - 3} more steps</li>
                                            )}
                                        </ol>
                                        <button
                                            onClick={() => handleCopy(solutionText, sol.id)}
                                            className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700"
                                        >
                                            {copiedId === sol.id ? <Check size={16} /> : <Copy size={16} />}
                                            {copiedId === sol.id ? 'Copied!' : 'Copy Solution'}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Diagnostic Questions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-500/20 overflow-hidden">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'questions' ? null : 'questions')}
                    className="w-full p-4 flex items-center justify-between text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <HelpCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Questions to Ask</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Diagnostic questions for {issueType} issues
                            </p>
                        </div>
                    </div>
                    {expandedSection === 'questions' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSection === 'questions' && (
                    <div className="px-4 pb-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                            <ul className="space-y-3">
                                {questions.map((q, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{q}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleCopy(questions.join('\n'), 'questions')}
                                className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700"
                            >
                                {copiedId === 'questions' ? <Check size={16} /> : <Copy size={16} />}
                                {copiedId === 'questions' ? 'Copied!' : 'Copy All Questions'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartSuggestions;
