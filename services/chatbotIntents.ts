/**
 * Smart Intent Detection for Dashboard Chatbot
 * Detects entity type, action, and extracts parameters from natural language
 */

export interface Intent {
    entityType: 'domain' | 'asset' | 'email' | 'ticket' | 'hosting' | 'unknown';
    action: 'create' | 'update' | 'delete' | 'list' | 'query' | 'unknown';
    params: Record<string, any>;
    confidence: number;
}

/**
 * Detect what the user wants to do
 */
export function detectIntent(text: string): Intent {
    const lowerText = text.toLowerCase().trim();

    // Detect entity type
    const entityType = detectEntityType(lowerText);

    // Detect action
    const action = detectAction(lowerText);

    // Extract parameters based on entity type
    const params = extractParameters(text, entityType);

    // Calculate confidence
    const confidence = calculateConfidence(entityType, action, params);

    return {
        entityType,
        action,
        params,
        confidence
    };
}

/**
 * Detect which entity the user is talking about
 */
function detectEntityType(text: string): Intent['entityType'] {
    // Email patterns
    if (/@/.test(text) && (text.includes('email') || text.includes('password'))) {
        return 'email';
    }

    // Domain patterns
    if (/\.(com|net|org|my|co|io)/.test(text) &&
        (text.includes('domain') || text.includes('registrar') || text.includes('expir'))) {
        return 'domain';
    }

    // Asset patterns
    const assetKeywords = ['laptop', 'desktop', 'computer', 'phone', 'tablet', 'monitor',
        'printer', 'keyboard', 'mouse', 'asset', 'device', 'equipment'];
    if (assetKeywords.some(keyword => text.includes(keyword))) {
        return 'asset';
    }

    // Ticket patterns
    const ticketKeywords = ['ticket', 'issue', 'problem', 'bug', 'request', 'support', 'help'];
    if (ticketKeywords.some(keyword => text.includes(keyword))) {
        return 'ticket';
    }

    // Hosting patterns
    const hostingKeywords = ['hosting', 'server', 'vps', 'aws', 'digitalocean', 'cpanel', 'whm'];
    if (hostingKeywords.some(keyword => text.includes(keyword))) {
        return 'hosting';
    }

    return 'unknown';
}

/**
 * Detect what action to perform
 */
function detectAction(text: string): Intent['action'] {
    // Query patterns - questions about data
    if (/\b(how many|count|show me|which|what|find)\b/.test(text) && !/\b(create|add|new)\b/.test(text)) {
        return 'query';
    }

    // Create patterns
    if (/\b(create|add|new|make|register)\b/.test(text)) {
        return 'create';
    }

    // Update patterns
    if (/\b(update|change|edit|modify|set)\b/.test(text)) {
        return 'update';
    }

    // Delete patterns
    if (/\b(delete|remove|cancel|drop)\b/.test(text)) {
        return 'delete';
    }

    // List patterns
    if (/\b(list|show|get|view|display)\b/.test(text)) {
        return 'list';
    }

    return 'unknown';
}

/**
 * Extract parameters based on entity type
 */
function extractParameters(text: string, entityType: Intent['entityType']): Record<string, any> {
    const params: Record<string, any> = {};

    switch (entityType) {
        case 'domain':
            params.domain = extractDomainName(text);
            params.expiryDate = extractDate(text);
            params.cost = extractCurrency(text);
            params.registrar = extractAfterKeyword(text, ['registrar', 'from']);
            params.autoRenew = text.includes('auto') || text.includes('renew');

            // Query filters
            if (text.includes('not auto') || text.includes('no auto')) {
                params.filterAutoRenew = false;
            } else if (text.includes('auto renew') && !text.includes('not')) {
                params.filterAutoRenew = true;
            }
            break;

        case 'asset':
            params.type = extractAssetType(text);
            params.model = extractAfterKeyword(text, ['model']);
            params.brand = extractBrand(text);
            params.serial = extractAfterKeyword(text, ['serial', 'sn', 's/n']);
            params.assignedTo = extractAfterKeyword(text, ['assigned to', 'for', 'user']);
            params.department = extractAfterKeyword(text, ['department', 'dept']);
            break;

        case 'email':
            params.email = extractEmailAddress(text);
            params.password = extractPassword(text);
            params.domain = params.email?.split('@')[1];
            break;

        case 'ticket':
            params.title = extractTicketTitle(text);
            params.description = text;
            params.priority = extractPriority(text);
            params.department = extractAfterKeyword(text, ['department', 'dept', 'team']);
            break;

        case 'hosting':
            params.provider = extractAfterKeyword(text, ['provider', 'from', 'hosting']);
            params.plan = extractAfterKeyword(text, ['plan']);
            params.cost = extractCurrency(text);
            break;
    }

    return params;
}

/**
 * Extract domain name from text
 */
function extractDomainName(text: string): string | null {
    const match = text.match(/([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/);
    return match ? match[0] : null;
}

/**
 * Extract email address from text
 */
function extractEmailAddress(text: string): string | null {
    const match = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return match ? match[1] : null;
}

/**
 * Extract date in various formats
 */
function extractDate(text: string): string | null {
    // YYYY-MM-DD format
    let match = text.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];

    // Dec 31 2026, December 31 2026
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    match = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})[,\s]+(\d{4})/i);
    if (match) {
        const monthIndex = monthNames.findIndex(m => match![1].toLowerCase().startsWith(m));
        return `${match[3]}-${String(monthIndex + 1).padStart(2, '0')}-${String(match[2]).padStart(2, '0')}`;
    }

    // Relative dates: "next year", "next month"
    if (text.includes('next year')) {
        const nextYear = new Date().getFullYear() + 1;
        return `${nextYear}-12-31`;
    }

    return null;
}

/**
 * Extract currency amount (RM50, RM 100, 50)
 * Prioritizes explicit RM prefix to avoid matching dates
 */
function extractCurrency(text: string): number | null {
    // First try to find explicit RM prefix
    let match = text.match(/\bRM\s*(\d+(?:\.\d{2})?)\b/i);
    if (match) return parseFloat(match[1]);

    // Fallback: look for standalone numbers that aren't part of dates
    // Avoid matching day numbers in dates (1-31)
    match = text.match(/\b(\d{3,}|\d+\.\d{2})\b/);
    return match ? parseFloat(match[1]) : null;
}

/**
 * Extract password from common patterns
 */
function extractPassword(text: string): string | null {
    const patterns = [
        /password[:\s]+([^\s]+)/i,
        /pwd[:\s]+([^\s]+)/i,
        /pass[:\s]+([^\s]+)/i,
        /with\s+(?:password\s+)?([^\s]+)/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Extract text after a keyword
 */
function extractAfterKeyword(text: string, keywords: string[]): string | null {
    for (const keyword of keywords) {
        const pattern = new RegExp(`${keyword}[:\\s]+([^,\\.]+)`, 'i');
        const match = text.match(pattern);
        if (match) return match[1].trim();
    }
    return null;
}

/**
 * Extract asset type
 */
function extractAssetType(text: string): string | null {
    const types = ['laptop', 'desktop', 'computer', 'phone', 'tablet', 'monitor', 'printer',
        'keyboard', 'mouse', 'headset', 'webcam', 'router', 'switch'];
    const found = types.find(type => text.toLowerCase().includes(type));
    return found || null;
}

/**
 * Extract brand name
 */
function extractBrand(text: string): string | null {
    const brands = ['dell', 'hp', 'lenovo', 'apple', 'macbook', 'asus', 'acer', 'samsung',
        'microsoft', 'surface', 'thinkpad', 'latitude'];
    const found = brands.find(brand => text.toLowerCase().includes(brand));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : null;
}

/**
 * Extract ticket title
 */
function extractTicketTitle(text: string): string {
    // Remove command words
    return text
        .replace(/\b(create|new|add|ticket|issue|problem)\b/gi, '')
        .trim()
        .slice(0, 100);
}

/**
 * Extract priority level
 */
function extractPriority(text: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical') || lowerText.includes('urgent') || lowerText.includes('emergency')) {
        return 'Critical';
    }
    if (lowerText.includes('high')) {
        return 'High';
    }
    if (lowerText.includes('low')) {
        return 'Low';
    }
    return 'Medium';
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
    entityType: Intent['entityType'],
    action: Intent['action'],
    params: Record<string, any>
): number {
    let score = 0;

    // Entity detection confidence
    if (entityType !== 'unknown') score += 40;

    // Action detection confidence
    if (action !== 'unknown') score += 30;

    // Parameter extraction confidence
    const paramCount = Object.values(params).filter(v => v !== null && v !== undefined).length;
    score += Math.min(paramCount * 10, 30);

    return score;
}
