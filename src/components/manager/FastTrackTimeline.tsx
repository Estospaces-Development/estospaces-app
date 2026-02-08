import React from 'react';
import { CheckCircle, Circle, Clock, Send } from 'lucide-react';
import { PropertyStage } from '../../mocks/fastTrackData';

interface FastTrackTimelineProps {
    currentStage: PropertyStage;
}

const stages: { id: PropertyStage; label: string }[] = [
    { id: 'submitted', label: 'Submitted' },
    { id: 'verified', label: 'Verified' },
    { id: 'broker_assigned', label: 'Broker Assigned' },
    { id: 'published', label: 'Published' },
];

const FastTrackTimeline: React.FC<FastTrackTimelineProps> = ({ currentStage }) => {
    const getCurrentStageIndex = () => {
        return stages.findIndex((s) => s.id === currentStage);
    };

    const currentIndex = getCurrentStageIndex();

    return (
        <div className="flex items-center justify-between w-full mt-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 -translate-y-1/2" />

            {stages.map((stage, index) => {
                let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
                if (index < currentIndex) status = 'completed';
                else if (index === currentIndex) status = 'current';

                return (
                    <div key={stage.id} className="flex flex-col items-center bg-white dark:bg-zinc-900 px-2">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                ${status === 'current' ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' : ''}
                ${status === 'upcoming' ? 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-gray-600 text-gray-400' : ''}
              `}
                        >
                            {status === 'completed' && <CheckCircle className="w-5 h-5" />}
                            {status === 'current' && <Clock className="w-5 h-5 animate-pulse" />}
                            {status === 'upcoming' && <Circle className="w-5 h-5" />}
                        </div>
                        <span
                            className={`text-xs mt-2 font-medium whitespace-nowrap transition-colors duration-300
                ${status === 'current' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
                ${status === 'completed' ? 'text-green-600 dark:text-green-500' : ''}
                ${status === 'upcoming' ? 'text-gray-400' : ''}
              `}
                        >
                            {stage.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default FastTrackTimeline;
