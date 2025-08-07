import Link from 'next/link';

interface BackToLeagueButtonProps {
    leagueId: string;
    className?: string;
}

export default function BackToLeagueButton({ leagueId, className = '' }: BackToLeagueButtonProps) {
    return (
        <Link
            href={`/leagues/${leagueId}`}
            className={`inline-flex items-center text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 transition-colors ${className}`}
        >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to League
        </Link>
    );
}
