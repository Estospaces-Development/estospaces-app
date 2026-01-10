import React from 'react';
import { Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';

const PropertyCard = ({ property }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
            {/* Image */}
            <div className="relative overflow-hidden h-64">
                <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                        {property.status}
                    </span>
                </div>
                <button className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full hover:bg-primary hover:text-white transition-colors text-gray-700 dark:text-gray-200">
                    <Heart size={18} />
                </button>
                <div className="absolute bottom-4 left-4">
                    <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded font-bold text-lg">
                        ${property.price.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 hover:text-primary transition-colors cursor-pointer">
                    {property.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-4">
                    <MapPin size={16} />
                    {property.location}
                </p>

                {/* Features */}
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-1">
                        <Bed size={18} className="text-primary" />
                        <span className="text-sm">{property.beds}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bath size={18} className="text-primary" />
                        <span className="text-sm">{property.baths}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Maximize size={18} className="text-primary" />
                        <span className="text-sm">{property.area} sqft</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
