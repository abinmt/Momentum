interface ProgressRingProps {
    progress: number; // 0-100
    size: number;
    strokeWidth: number;
    className?: string;
}

export default function ProgressRing({ 
    progress, 
    size, 
    strokeWidth, 
    className = "" 
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg 
            className={`progress-ring transform -rotate-90 ${className}`} 
            width={size} 
            height={size}
            viewBox={`0 0 ${size} ${size}`}
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <circle
                className="progress-ring-circle transition-all duration-500 ease-in-out"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="white"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
            />
        </svg>
    );
}
