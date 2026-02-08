import React, { useState, useEffect } from 'react';
import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { FastTrackProperty } from '../../mocks/fastTrackData';
import FastTrackTimeline from './FastTrackTimeline';
import FastTrackActions from './FastTrackActions';

interface FastTrackCardProps {
    property: FastTrackProperty;
    onAssignBroker: (id: string) => void;
    onEscalate: (id: string) => void;
}

const FastTrackCard: React.FC<FastTrackCardProps> = ({ property, onAssignBroker, onEscalate }) => {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number } | null>(null);
    const [currentSlaStatus, setCurrentSlaStatus] = useState(property.slaStatus);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const submitTime = new Date(property.submittedAt).getTime();
            const targetTime = submitTime + 24 * 60 * 60 * 1000;
            const now = new Date().getTime();
            const diff = targetTime - now;

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0 });
                setCurrentSlaStatus('breached');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft({ hours, minutes });

            if (hours < 6) {
                setCurrentSlaStatus('at_risk');
            } else {
                setCurrentSlaStatus('on_track');
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [property.submittedAt]);

    const getSlaBadgeStyles = () => {
        switch (currentSlaStatus) {
            case 'on_track':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'at_risk':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800 animate-pulse';
            case 'breached':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getSlaLabel = () => {
        switch (currentSlaStatus) {
            case 'on_track': return 'On Track';
            case 'at_risk': return 'At Risk';
            case 'breached': return 'Breached';
            default: return '';
        }
    }

    return (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col h-full group">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-primary transition-colors">
                        {property.propertyTitle}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{property.location}</span>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSlaBadgeStyles()} flex items-center gap-1.5`}>
                    {currentSlaStatus === 'at_risk' && <AlertCircle className="w-3 h-3" />}
                    {getSlaLabel()}
                </div>
            </div>

            {/* Timer & Broker Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SLA Countdown</p>
                    <div className={`text-xl font-bold font-mono tracking-tight flex items-center gap-2
            ${currentSlaStatus === 'breached' ? 'text-red-600 dark:text-red-500' :
                            currentSlaStatus === 'at_risk' ? 'text-orange-600 dark:text-orange-500' : 'text-gray-800 dark:text-gray-200'
                        }`}>
                        <Clock className="w-5 h-5" />
                        {timeLeft ? `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}` : '--:--'}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                        Submitted: {new Date(property.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned Broker</p>
                    {property.assignedBroker ? (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                {property.assignedBroker.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{property.assignedBroker}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400 italic flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                            Unassigned
                        </span>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="mb-4">
                <FastTrackTimeline currentStage={property.currentStage} />
            </div>

            <div className="mt-auto">
                <FastTrackActions
                    propertyId={property.id}
                    onAssignBroker={() => onAssignBroker(property.id)}
                    onEscalate={() => onEscalate(property.id)}
                />
            </div>
        </div>
    );
};

export default FastTrackCard;
