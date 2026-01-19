import React, { useState } from 'react';
import { Mail, Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Ticket, Solution } from '../types';

interface EmailGeneratorProps {
    ticket: Ticket;
}

const EmailGenerator: React.FC<EmailGeneratorProps> = ({ ticket }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateEmailBody = () => {
        const firstName = ticket.user_name.split(' ')[0] || 'User';

        return `Hi ${firstName},

Thank you for your ticket regarding "${ticket.issue_type}" (Ticket ${ticket.ticket_number || `#${ticket.id}`}).

We are looking into your issue: "${ticket.description}"

Could you please provide the following information to help us diagnose the problem?
1. When did this issue start?
2. Are you seeing any specific error messages?
3. Have you tried restarting your computer/application?
4. Is this affecting only you or others as well?

If this is urgent, please call IT Support directly.

Best regards,
IT Support Team`;
    };

    const emailBody = generateEmailBody();
    const subject = `[${ticket.ticket_number || `INC-${ticket.id}`}] IT Support Request - ${ticket.issue_type}`;

    const handleCopy = () => {
        const fullEmail = `Subject: ${subject}\n\n${emailBody}`;
        navigator.clipboard.writeText(fullEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenOutlook = () => {
        const mailtoLink = `mailto:${ticket.user_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
    };

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm mt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                        <Mail size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Generate Email Reply</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Send diagnostic questions to user</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>

            {isOpen && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 mb-4 border border-gray-100 dark:border-white/10">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Preview</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Subject: {subject}</div>
                        <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                            {emailBody}
                        </pre>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                        <button
                            onClick={handleOpenOutlook}
                            className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            <ExternalLink size={18} />
                            Open in Outlook
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailGenerator;
