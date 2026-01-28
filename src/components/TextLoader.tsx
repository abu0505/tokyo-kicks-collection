import { useEffect, useState } from 'react';

interface TextLoaderProps {
    text?: string;
    className?: string;
    isWhite?: boolean;
}

const TextLoader = ({ text = 'Loading', className = '', isWhite = false }: TextLoaderProps) => {
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4); // Cycle through 0-3
        }, 500);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const dots = '.'.repeat(dotCount);

    // Define style for white text variant to override CSS variables
    const style = isWhite ? {
        '--shimmer-c1': '#ffffff',
        '--shimmer-c2': 'rgba(255,255,255,0.5)'
    } as React.CSSProperties : {};

    return (
        <div className={`flex items-center justify-center ${className}`} style={style}>
            <span className="animate-text-shimmer font-medium inline-block min-w-[8ch] text-center">
                {text}{dots}
            </span>
        </div>
    );
};

export default TextLoader;
