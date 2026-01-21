interface VerifiedBadgeProps {
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function VerifiedBadge({ className = '', size = 'md' }: VerifiedBadgeProps) {
    const sizeClasses: Record<string, string> = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <svg
            className={`${sizeClasses[size]} ${className}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Verified"
        >
            {/* Blue background circle */}
            <circle cx="12" cy="12" r="10" fill="#3B82F6" />

            {/* White checkmark */}
            <path
                d="M9 12L11 14L15 10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
