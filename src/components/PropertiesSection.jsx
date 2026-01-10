import React from 'react';
import PropertyCard from './PropertyCard';

const PropertiesSection = () => {
    const properties = [
        {
            id: 1,
            title: 'Modern Villa with Pool',
            location: 'Miami Beach, FL',
            price: 1250000,
            status: 'For Sale',
            beds: 4,
            baths: 3,
            area: 3500,
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 2,
            title: 'Luxury Apartment Downtown',
            location: 'New York, NY',
            price: 850000,
            status: 'For Sale',
            beds: 3,
            baths: 2,
            area: 2200,
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 3,
            title: 'Cozy Family Home',
            location: 'Los Angeles, CA',
            price: 675000,
            status: 'For Rent',
            beds: 3,
            baths: 2,
            area: 1800,
            image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 4,
            title: 'Beachfront Condo',
            location: 'San Diego, CA',
            price: 920000,
            status: 'For Sale',
            beds: 2,
            baths: 2,
            area: 1500,
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 5,
            title: 'Mountain Retreat Cabin',
            location: 'Aspen, CO',
            price: 1450000,
            status: 'For Sale',
            beds: 5,
            baths: 4,
            area: 4200,
            image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 6,
            title: 'Urban Loft Space',
            location: 'Chicago, IL',
            price: 525000,
            status: 'For Rent',
            beds: 2,
            baths: 1,
            area: 1200,
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Featured Properties</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Discover our handpicked selection of premium properties that match your lifestyle and budget.
                    </p>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <button className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl">
                        View All Properties
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PropertiesSection;
