import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Check, ChevronDown, Sparkles } from 'lucide-react';
import { HostingAccount } from '../types';
import {
    fetchHostingAccounts,
    createDomain,
    deleteDomain,
    fetchDomains,
    createAsset,
    createTicket,
    createHostingAccount
} from '../services/supabaseService';
import { executeCpanelCommand } from '../services/cpanelService';
import { detectIntent } from '../services/chatbotIntents';

interface Message {
    id: string;
    type: 'user' | 'bot' | 'confirmation';
    content: string;
    timestamp: Date;
    confirmAction?: () => void;
    cancelAction?: () => void;
}

const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'bot',
            content: 'Hi! I\'m your **Dashboard Assistant**. I can help you:\\n\\n📧 **Emails** - Create, update, delete (via cPanel)\\n🌐 **Domains** - Add, manage domains\\n💻 **Assets** - Track laptops, devices\\n🎫 **Tickets** - Create support requests\\n☁️ **Hosting** - Manage accounts\\n\\nJust tell me what you need in plain language!',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hostingAccounts, setHostingAccounts] = useState<HostingAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<HostingAccount | null>(null);
    const [showAccountSelector, setShowAccountSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadHostingAccounts();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const loadHostingAccounts = async () => {
        const accounts = await fetchHostingAccounts();
        const cpanelAccounts = accounts.filter(acc => acc.control_panel_url?.includes(':2083') || acc.control_panel_url?.includes('cpanel'));
        setHostingAccounts(cpanelAccounts);
        if (cpanelAccounts.length === 1) {
            setSelectedAccount(cpanelAccounts[0]);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const addMessage = (type: Message['type'], content: string, extra?: Partial<Message>) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date(),
            ...extra
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userInput = input.trim();
        setInput('');
        addMessage('user', userInput);

        setLoading(true);

        try {
            // Use smart intent detection
            const intent = detectIntent(userInput);

            console.log('Detected intent:', intent);

            if (intent.confidence < 30) {
                addMessage('bot', '🤔 I didn\'t quite understand that. Try:\\n\\n• "Add domain example.com expiring Dec 31 2026 RM50"\\n• "Create laptop Dell XPS assigned to John"\\n• "New ticket printer broken high priority"\\n• "Create email test@domain.com password Pass123!"');
                setLoading(false);
                return;
            }

            // Route to appropriate handler
            switch (intent.entityType) {
                case 'domain':
                    await handleDomainCommand(intent);
                    break;
                case 'asset':
                    await handleAssetCommand(intent);
                    break;
                case 'ticket':
                    await handleTicketCommand(intent);
                    break;
                case 'email':
                    await handleEmailCommand(intent);
                    break;
                case 'hosting':
                    await handleHostingCommand(intent);
                    break;
                default:
                    addMessage('bot', '❓ I\'m not sure what you\'d like to manage. Try specifying: domain, asset, ticket, email, or hosting.');
            }
        } catch (error: any) {
            addMessage('bot', `❌ Error: ${error.message}`);
        }

        setLoading(false);
    };

    // Domain handler
    const handleDomainCommand = async (intent: any) => {
        if (intent.action === 'create') {
            const { domain, expiryDate, cost, registrar, autoRenew } = intent.params;

            if (!domain) {
                addMessage('bot', '⚠️ Please specify a domain name (e.g., example.com)');
                return;
            }

            try {
                const result = await createDomain({
                    domain_name: domain,
                    expiry_date: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    renewal_cost: cost || 0,
                    registrar: registrar || 'Unknown',
                    auto_renew: autoRenew || false,
                    status: 'Active',
                    company_name: 'Graduan Bersatu Padat Sdn. Bhd.'
                });

                if (result?.success) {
                    addMessage('bot', `✅ Domain **${domain}** added successfully!${expiryDate ? `\\n📅 Expires: ${expiryDate}` : ''}${cost ? `\\n💰 Cost: RM${cost}` : ''}`);
                } else {
                    addMessage('bot', `❌ Failed to add domain: ${result?.error || 'Unknown error'}`);
                }
            } catch (err: any) {
                addMessage('bot', `❌ Error: ${err.message}`);
            }
        } else if (intent.action === 'delete') {
            const { domain } = intent.params;

            if (!domain) {
                addMessage('bot', '⚠️ Please specify which domain to delete');
                return;
            }

            // Confirmation for delete
            addMessage('confirmation', `⚠️ Are you sure you want to delete domain **${domain}**?\\n\\nThis action cannot be undone!`, {
                confirmAction: async () => {
                    setLoading(true);
                    setMessages(prev => prev.filter(m => m.type !== 'confirmation'));
                    addMessage('user', 'Yes, delete it');

                    try {
                        // Fetch all domains to find the matching one
                        const domains = await fetchDomains();
                        const domainToDelete = domains.find(d => d.domain_name?.toLowerCase() === domain.toLowerCase());

                        if (!domainToDelete) {
                            addMessage('bot', `❌ Domain **${domain}** not found in database.`);
                            setLoading(false);
                            return;
                        }

                        // Delete from database
                        const result = await deleteDomain(domainToDelete.id);

                        if (result?.success) {
                            addMessage('bot', `✅ Domain **${domain}** deleted successfully.`);
                        } else {
                            addMessage('bot', `❌ Failed to delete: ${result?.error || 'Unknown error'}`);
                        }
                    } catch (err: any) {
                        addMessage('bot', `❌ Error: ${err.message}`);
                    }
                    setLoading(false);
                },
                cancelAction: () => {
                    setMessages(prev => prev.filter(m => m.type !== 'confirmation'));
                    addMessage('user', 'Cancel');
                    addMessage('bot', '👍 Deletion cancelled.');
                }
            });
        } else if (intent.action === 'list') {
            addMessage('bot', '📋 Please navigate to the **Domains** page to view all domains.');
        } else if (intent.action === 'query') {
            // Handle domain queries
            try {
                const domains = await fetchDomains();
                const { filterAutoRenew, filterExpiring } = intent.params;

                let filtered = domains;
                let description = '';

                // Filter by auto-renew
                if (filterAutoRenew === false) {
                    filtered = domains.filter(d => !d.auto_renew);
                    description = 'not set to auto-renew';
                } else if (filterAutoRenew === true) {
                    filtered = domains.filter(d => d.auto_renew);
                    description = 'set to auto-renew';
                }

                // Filter by expiring soon (within 30 days)
                if (filterExpiring) {
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                    filtered = filtered.filter(d => {
                        const expiry = new Date(d.expiry_date);
                        return expiry <= thirtyDaysFromNow;
                    });
                    description = 'expiring within 30 days';
                }

                if (filtered.length === 0) {
                    addMessage('bot', `No domains found ${description}.`);
                } else {
                    const domainList = filtered.map(d => `• **${d.domain_name}**${d.expiry_date ? ` (expires ${d.expiry_date})` : ''}`).join('\\n');
                    addMessage('bot', `Found **${filtered.length}** domain${filtered.length > 1 ? 's' : ''} ${description}:\\n\\n${domainList}`);
                }
            } catch (err: any) {
                addMessage('bot', `❌ Error: ${err.message}`);
            }
        } else {
            addMessage('bot', '🤔 I can help you **add**, **delete**, or **query** domains. What would you like to do?');
        }
    };

    // Asset handler
    const handleAssetCommand = async (intent: any) => {
        if (intent.action === 'create') {
            const { type, brand, model, serial, assignedTo, department } = intent.params;

            if (!type) {
                addMessage('bot', '⚠️ Please specify an asset type (laptop, desktop, phone, etc.)');
                return;
            }

            try {
                const assetName = `${brand || ''} ${model || type}`.trim();
                const result = await createAsset({
                    asset_name: assetName,
                    asset_type: type.charAt(0).toUpperCase() + type.slice(1),
                    serial_number: serial || '',
                    assigned_to: assignedTo || '',
                    department: department || '',
                    status: 'Active',
                    company_name: 'Graduan Bersatu Padat Sdn. Bhd.'
                });

                if (result?.success) {
                    addMessage('bot', `✅ Asset **${assetName}** created!${assignedTo ? `\\n👤 Assigned to: ${assignedTo}` : ''}${serial ? `\\n🔢 Serial: ${serial}` : ''}`);
                } else {
                    addMessage('bot', `❌ Failed to create asset: ${result?.error || 'Unknown error'}`);
                }
            } catch (err: any) {
                addMessage('bot', `❌ Error: ${err.message}`);
            }
        }
    };

    // Ticket handler
    const handleTicketCommand = async (intent: any) => {
        if (intent.action === 'create') {
            const { title, description, priority, department } = intent.params;

            try {
                const result = await createTicket({
                    title: title || 'New Issue',
                    description: description || title || '',
                    priority: priority || 'Medium',
                    department: department || 'IT',
                    status: 'Open',
                    company_name: 'Graduan Bersatu Padat Sdn. Bhd.'
                });

                if (result?.success) {
                    addMessage('bot', `✅ Ticket created!\\n📋 **${title}**\\n⚡ Priority: ${priority || 'Medium'}`);
                } else {
                    addMessage('bot', `❌ Failed to create ticket: ${result?.error || 'Unknown error'}`);
                }
            } catch (err: any) {
                addMessage('bot', `❌ Error: ${err.message}`);
            }
        }
    };

    // Email handler (cPanel)
    const handleEmailCommand = async (intent: any) => {
        if (!selectedAccount) {
            addMessage('bot', '⚠️ Please select a hosting account first (for cPanel emails).');
            return;
        }

        if (intent.action === 'create') {
            const { email, password, domain } = intent.params;

            if (!email) {
                addMessage('bot', '⚠️ Please specify an email address');
                return;
            }

            if (!password) {
                addMessage('bot', `What password would you like for **${email}**?`);
                return;
            }

            try {
                const result = await executeCpanelCommand(selectedAccount, 'create_email', {
                    email,
                    password,
                    domain
                });

                if (result.success) {
                    addMessage('bot', `✅ Email **${email}** created successfully!`);
                } else {
                    addMessage('bot', `❌ Failed to create email: ${result.error}`);
                }
            } catch (err: any) {
                addMessage('bot', `❌ Error: ${err.message}`);
            }
        } else if (intent.action === 'delete') {
            const { email, domain } = intent.params;

            // Confirmation for delete
            addMessage('confirmation', `⚠️ Are you sure you want to delete **${email}**?\\n\\nThis cannot be undone!`, {
                confirmAction: async () => {
                    setLoading(true);
                    setMessages(prev => prev.filter(m => m.type !== 'confirmation'));
                    addMessage('user', 'Yes, delete it');

                    try {
                        const result = await executeCpanelCommand(selectedAccount!, 'delete_email', { email, domain });
                        if (result.success) {
                            addMessage('bot', `✅ Email **${email}** deleted.`);
                        } else {
                            addMessage('bot', `❌ Failed: ${result.error}`);
                        }
                    } catch (err: any) {
                        addMessage('bot', `❌ Error: ${err.message}`);
                    }
                    setLoading(false);
                },
                cancelAction: () => {
                    setMessages(prev => prev.filter(m => m.type !== 'confirmation'));
                    addMessage('user', 'Cancel');
                    addMessage('bot', '👍 Cancelled.');
                }
            });
        }
    };

    // Hosting handler
    const handleHostingCommand = async (intent: any) => {
        if (intent.action === 'create') {
            const { provider, plan, cost } = intent.params;

            if (!provider) {
                addMessage('bot', '⚠️ Please specify a hosting provider');
                return;
            }

            try {
                const result = await createHostingAccount({
                    provider_name: provider,
                    account_name: plan || 'Main Account',
                    company_name: 'Graduan Bersatu Padat Sdn. Bhd.',
                    monthly_cost: cost || 0,
                    status: 'Active'
                });

                if (result?.success) {
                    addMessage('bot', `✅ Hosting account **${provider}** added!`);
                } else {
                    addMessage('bot', `❌ Failed: ${result?.error || 'Unknown error'}`);
                }
            } catch (err: any) {
                addMessage('bot', `❌ Error: ${err.message}`);
            }
        }
    };

    const formatMessage = (content: string) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />');
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg shadow-purple-600/40 flex items-center justify-center transition-all hover:scale-110 z-50"
                >
                    <Sparkles size={24} />
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[420px] h-[550px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-white/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Dashboard Assistant</h3>
                                <p className="text-xs text-purple-100">AI-powered management</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {hostingAccounts.length > 0 && (
                        <div className="p-3 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50">
                            <div className="relative">
                                <button
                                    onClick={() => setShowAccountSelector(!showAccountSelector)}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg text-left text-sm flex items-center justify-between"
                                >
                                    <span className="text-gray-700 dark:text-gray-300 text-xs">
                                        {selectedAccount ? `cPanel: ${selectedAccount.provider_name}` : 'Select cPanel (for emails)'}
                                    </span>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showAccountSelector ? 'rotate-180' : ''}`} />
                                </button>

                                {showAccountSelector && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                                        {hostingAccounts.map(acc => (
                                            <button
                                                key={acc.id}
                                                onClick={() => {
                                                    setSelectedAccount(acc);
                                                    setShowAccountSelector(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 flex justify-between items-center"
                                            >
                                                <span className="text-gray-700 dark:text-gray-300 text-xs">{acc.provider_name}</span>
                                                {selectedAccount?.id === acc.id && <Check size={12} className="text-purple-500" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map(message => (
                            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${message.type === 'user'
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                    : message.type === 'confirmation'
                                        ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                    }`}>
                                    <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />

                                    {message.type === 'confirmation' && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={message.confirmAction}
                                                className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Yes, Delete
                                            </button>
                                            <button
                                                onClick={message.cancelAction}
                                                className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                                    <Loader2 size={18} className="animate-spin text-purple-600" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="What would you like to do?"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;
