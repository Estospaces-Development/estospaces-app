import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface TopProperty {
  id: string;
  name: string;
  price: string;
  views: number;
  inquiries: number;
  status: string;
}

const TopProperties = () => {
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProperties = async () => {
      try {
        // Get current user
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session?.user) {
          setTopProperties([]);
          setLoading(false);
          return;
        }

        const userId = session.user.id;

        // Fetch properties for this agent
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('id, title, price, views, inquiries, status')
          .eq('agent_id', userId)
          .in('status', ['online', 'active', 'published']);

        if (propertiesError) {
          console.error('Error fetching top properties:', propertiesError);
          setTopProperties([]);
          setLoading(false);
          return;
        }

        if (!properties || properties.length === 0) {
          setTopProperties([]);
          setLoading(false);
          return;
        }

        // Sort by performance (views + inquiries) and get top 3
        const sortedProperties = properties
          .map(prop => ({
            id: prop.id,
            name: prop.title || 'Untitled Property',
            price: parseFloat(prop.price || 0).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            views: prop.views || 0,
            inquiries: prop.inquiries || 0,
            status: prop.status === 'online' || prop.status === 'active' || prop.status === 'published' 
              ? 'Available' 
              : prop.status || 'Unknown',
          }))
          .sort((a, b) => {
            // Sort by total performance (views + inquiries)
            const aPerformance = a.views + a.inquiries;
            const bPerformance = b.views + b.inquiries;
            return bPerformance - aPerformance;
          })
          .slice(0, 3); // Top 3 properties

        setTopProperties(sortedProperties);
      } catch (error) {
        console.error('Error fetching top properties:', error);
        setTopProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProperties();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTopProperties, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-primary" />
        <h3 className="section-heading text-gray-800 dark:text-white">Top Performing properties</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-black animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : topProperties.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No properties found. Add properties to see top performers here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topProperties.map((property) => (
            <div
              key={property.id}
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
                <span>{property.views} {property.views === 1 ? 'view' : 'views'}</span>
                <span>{property.inquiries} {property.inquiries === 1 ? 'Inquiry' : 'Inquiries'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProperties;
