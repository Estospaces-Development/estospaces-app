import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Download, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import BrokerRequestItem, { BrokerRequest, RequestStatus } from '../components/manager/BrokerResponse/BrokerRequestItem';
import ClientProfileModal from '../components/manager/BrokerResponse/ClientProfileModal';

// Mock Data Generator
const generateMockRequests = (count: number): BrokerRequest[] => {
    const statuses: RequestStatus[] = ['pending', 'responded', 'expired'];
    const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh', 'Anjali Desai', 'Rahul Verma', 'Kavita Reddy'];
    const properties = ['Sunset Villa', 'Green Heights', 'Commercial Hub', 'Lakeview Penthouse', 'Urban Loft', 'Garden Estate', 'Tech Park Office', 'Seaside Condo'];
    const locations = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Chennai', 'Hyderabad', 'Gurgaon', 'Noida'];

    return Array.from({ length: count }, (_, i) => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const date = new Date();
        // Random time within last 24 hours
        date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440));

        // For pending items, make them recent (within 10 mins) or they would be expired
        if (status === 'pending') {
            const now = new Date();
            date.setTime(now.getTime() - Math.floor(Math.random() * 10 * 60 * 1000));
        }

        return {
            id: `req-${i + 1}`,
            propertyName: `${properties[Math.floor(Math.random() * properties.length)]}, ${locations[Math.floor(Math.random() * locations.length)]}`,
            brokerName: names[Math.floor(Math.random() * names.length)],
            distance: `${(Math.random() * 5).toFixed(1)} km away`,
            timestamp: date,
            status: status
        };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const AllBrokerRequests: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<BrokerRequest[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const itemsPerPage = 12;

    useEffect(() => {
        // Generate data once
        setRequests(generateMockRequests(48));
    }, []);

    // Filtering
    const filteredRequests = requests.filter(req => {
        const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
        const matchesSearch = req.brokerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRespond = (id: string) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'responded' } : req
        ));
        // BrokerRequestItem handles navigation, we just update state here to reflect change if they come back
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/manager/dashboard')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Broker Requests</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and track all emergency assistance requests</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by broker or property..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                    >
                        All Requests
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus('responded')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'responded' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                    >
                        Responded
                    </button>
                    <button
                        onClick={() => setFilterStatus('expired')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                    >
                        Expired
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedRequests.map(request => (
                    <BrokerRequestItem
                        key={request.id}
                        request={request}
                        onRespond={handleRespond}
                    />
                ))}
            </div>

            {/* Empty State */}
            {paginatedRequests.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 border-dashed">
                    <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No requests found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search query</p>
                </div>
            )}

            {/* Pagination */}
            {filteredRequests.length > 0 && (
                <div className="flex items-center justify-between bg-white dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</span> of <span className="font-medium">{filteredRequests.length}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllBrokerRequests;
