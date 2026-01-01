import { Star } from 'lucide-react';

const TopProperties = () => {
  const properties = [
    {
      name: 'Modern Downtown Apartment',
      price: '$450,000.00',
      views: '245 view',
      inquiries: '12 Inquiries',
      status: 'Available',
    },
    {
      name: 'Luxury Condo with city view',
      price: '$3,500.00',
      views: '189 view',
      inquiries: '8 Inquires',
      status: 'Available',
    },
    {
      name: 'Spacious Penthouse',
      price: '$6,500.00',
      views: '156 view',
      inquiries: '15 Inquires',
      status: 'Available',
    },
  ];

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-primary" />
        <h3 className="section-heading text-gray-800 dark:text-white">Top Performing properties</h3>
      </div>

      <div className="space-y-4">
        {properties.map((property, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-black"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="body-text font-semibold text-gray-800 dark:text-white">{property.name}</h4>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 caption rounded-full whitespace-nowrap">
                {property.status}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">{property.price}</p>
            <div className="flex items-center gap-4 secondary-label text-gray-600 dark:text-gray-400">
              <span>{property.views}</span>
              <span>{property.inquiries}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProperties;
