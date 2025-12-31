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
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:brightness-105 dark:hover:brightness-110">
      {/* Animated light overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <h3 className="section-heading text-gray-800 dark:text-white transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-light">Top Performing properties</h3>
        </div>

      <div className="space-y-4">
        {properties.map((property, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-black relative overflow-hidden group/item cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:brightness-110 dark:hover:brightness-125 hover:border-primary/30"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover/item:opacity-20 dark:group-hover/item:opacity-15 transition-opacity duration-300 bg-gradient-to-br from-white/50 dark:from-white/30 via-transparent to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <h4 className="body-text font-semibold text-gray-800 dark:text-white transition-colors duration-300 group-hover/item:text-primary dark:group-hover/item:text-primary-light">{property.name}</h4>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 caption rounded-full whitespace-nowrap transition-all duration-300 group-hover/item:scale-110 group-hover/item:shadow-md">
                  {property.status}
                </span>
              </div>
              <p className="text-lg font-bold text-gray-800 dark:text-white mb-2 transition-all duration-300 group-hover/item:scale-105">{property.price}</p>
              <div className="flex items-center gap-4 secondary-label text-gray-600 dark:text-gray-400">
                <span className="transition-colors duration-300 group-hover/item:text-gray-800 dark:group-hover/item:text-gray-300">{property.views}</span>
                <span className="transition-colors duration-300 group-hover/item:text-gray-800 dark:group-hover/item:text-gray-300">{property.inquiries}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default TopProperties;
