// Stricter word list (Expanding this is recommended)
const BANNED_WORDS = [
    // --- English ---
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy', 'motherfucker',
    'fucker', 'cock', 'slut', 'whore', 'arsehole', 'bollocks', 'wanker', 'prick', 'twat',
    'nigger', 'faggot', 'retard', 'piss', 'slut', 'bloody', 'bugger', 'crap',

    // --- Arabic (Formal & Dialects) ---
    'شتم', 'لعن', 'قذر', 'حيوان', 'كلب', 'حمار', 'خنزير', 'تفه', 'سافل', 'واطي',
    'يا وسخ', 'يا زباله', 'بنت كلب', 'ابن كلب', 'منيك', 'شرموط', 'عرص', 'قواد',
    'خول', 'لبوه', 'متناك', 'كس', 'طيز', 'زب', 'بزاز', 'لبوة', 'شرموطة', 'منيوك',
    'يا ربايط', 'يا فاشل', 'تبا', 'سحقا', 'يا حمار', 'يا غبي', 'يا تافه',

    // --- Common Variations & Spam ---
    'f.u.c.k', 'f u c k', 'sh!t', 'a$$', 'b!tch', 'p0rn', 'x.x.x', 'xxx'
];

// Patterns for spam or link farms
const SPAM_PATTERNS = [
    /https?:\/\/[^\s]+/gi, // URLs
    /(.)\1{5,}/gi,         // More than 5 repeating characters (e.g. aaaaaaa)
    /[<>]/gi               // Basic HTML tags prevention
];

export function filterProfanity(text: string): { cleanText: string, isFlagged: boolean } {
    let filteredText = text;
    let isFlagged = false;

    // Check for spam patterns
    SPAM_PATTERNS.forEach(pattern => {
        if (pattern.test(filteredText)) {
            isFlagged = true;
            filteredText = filteredText.replace(pattern, '[REMOVED]');
        }
    });

    // Replace banned words
    BANNED_WORDS.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(filteredText)) {
            isFlagged = true;
            filteredText = filteredText.replace(regex, '***');
        }
    });

    // Check for "screaming" or excessive symbols
    if (filteredText.length > 10 && (filteredText.match(/[!?.@#$%^&*]/g) || []).length > filteredText.length * 0.3) {
        isFlagged = true;
    }

    return { cleanText: filteredText, isFlagged };
}

export function hasProfanity(text: string): boolean {
    const { isFlagged } = filterProfanity(text);
    return isFlagged;
}
