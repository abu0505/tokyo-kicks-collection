import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(false);
    const [pullY, setPullY] = useState(0);
    const startY = useRef(0);
    const currentY = useRef(0);

    if (!isMobile) return <>{children}</>;

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        currentY.current = e.touches[0].clientY;
        const dy = currentY.current - startY.current;

        // Only allow pull if at top and dragging down
        if (window.scrollY <= 0 && dy > 0 && !loading) {
            // Add resistance
            setPullY(Math.min(dy * 0.4, 150));
        }
    };

    const handleTouchEnd = async () => {
        if (pullY > 80 && !loading) {
            setLoading(true);
            // Snap to loading position
            setPullY(60);
            try {
                await onRefresh();
            } finally {
                setTimeout(() => {
                    setLoading(false);
                    setPullY(0);
                }, 500); // Minimum showing time
            }
        } else {
            setPullY(0);
        }
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="min-h-screen relative"
        >
            <div
                className="absolute w-full flex justify-center pointer-events-none"
                style={{ top: 20 }}
            >
                <motion.div
                    className="flex items-center justify-center bg-background rounded-full p-2 shadow-md border"
                    style={{
                        opacity: Math.min(pullY / 60, 1),
                        scale: Math.min(pullY / 60, 1),
                        y: -50 + pullY // Move down as we pull
                    }}
                >
                    <Loader2 className={`w-5 h-5 text-primary ${loading ? 'animate-spin' : ''}`} />
                </motion.div>
            </div>

            <motion.div
                animate={{ y: loading ? 60 : pullY / 2 }} // Content moves less than indicator
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PullToRefresh;
