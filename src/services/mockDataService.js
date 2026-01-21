/**
 * Mock Data Service
 * Provides mock data for all dashboard features without Supabase API calls
 *
 * UPDATED: Uses dynamic dates via date-fns to ensure the demo always looks "live"
 */

import { subDays, subHours, subMinutes, addDays, format } from 'date-fns';

const NOW = new Date();

// ============================================================================
// MOCK PROPERTIES - For Buy/Rent tabs
// ============================================================================

export const MOCK_PROPERTIES = [
    {
        id: 'prop-001',
        title: 'Stunning 4-Bedroom Victorian House',
        address_line_1: '42 Kensington Gardens',
        city: 'London',
        postcode: 'W8 4PX',
        price: 1850000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 4,
        bathrooms: 3,
        area: 2800,
        description: 'A magnificent Victorian townhouse featuring original period details, a private garden, and modern amenities throughout. Recently renovated to the highest standard.',
        image_urls: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
        ],
        latitude: 51.5074,
        longitude: -0.1878,
        view_count: 245,
        created_at: subDays(NOW, 2).toISOString(),
        features: ['Garden', 'Parking', 'Period Features', 'Recently Renovated'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 51.5074,
        street_view_lng: -0.1878,
        has_virtual_tour: true,
        status: 'available'
    },
    {
        id: 'prop-002',
        title: 'Modern 2-Bedroom Apartment',
        address_line_1: '15 Canary Wharf Tower',
        city: 'London',
        postcode: 'E14 5AB',
        price: 650000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 2,
        bathrooms: 2,
        area: 950,
        description: 'Luxurious apartment with stunning river views, 24/7 concierge, gym access, and underground parking. Perfect for city professionals.',
        image_urls: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        latitude: 51.5054,
        longitude: -0.0235,
        view_count: 178,
        created_at: subHours(NOW, 4).toISOString(), // Listed 4 hours ago (Fresh!)
        features: ['River Views', 'Concierge', 'Gym', 'Parking'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 51.5054,
        street_view_lng: -0.0235,
        has_virtual_tour: true,
        status: 'pending'
    },
    {
        id: 'prop-003',
        title: 'Charming 3-Bedroom Cottage',
        address_line_1: '7 Rose Lane',
        city: 'Cotswolds',
        postcode: 'GL54 2HN',
        price: 485000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 1600,
        description: 'Beautiful stone cottage in the heart of the Cotswolds with exposed beams, inglenook fireplace, and landscaped gardens.',
        image_urls: [
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
            'https://images.unsplash.com/photo-1572120366674-06853cb5b325?w=800'
        ],
        latitude: 51.8330,
        longitude: -1.8433,
        view_count: 312,
        created_at: subDays(NOW, 5).toISOString(),
        features: ['Garden', 'Fireplace', 'Period Features', 'Countryside'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=Zh14WDtkjdB',
        street_view_lat: 51.8330,
        street_view_lng: -1.8433,
        has_virtual_tour: true,
        status: 'available'
    },
    {
        id: 'prop-004',
        title: 'Luxury Studio Flat',
        address_line_1: '88 Manchester Central',
        city: 'Manchester',
        postcode: 'M1 5GN',
        price: 1500,
        property_type: 'rent',
        listing_type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        area: 550,
        description: 'Stylish studio flat with floor-to-ceiling windows, built-in appliances, and access to rooftop terrace. Bills included.',
        image_urls: [
            'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
            'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800'
        ],
        latitude: 53.4808,
        longitude: -2.2426,
        view_count: 89,
        created_at: subDays(NOW, 1).toISOString(),
        features: ['Bills Included', 'Rooftop Access', 'Furnished'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 53.4808,
        street_view_lng: -2.2426,
        has_virtual_tour: true,
        status: 'available'
    },
    {
        id: 'prop-005',
        title: 'Spacious 3-Bedroom Family Home',
        address_line_1: '24 Oak Avenue',
        city: 'Birmingham',
        postcode: 'B15 2TT',
        price: 1950,
        property_type: 'rent',
        listing_type: 'rent',
        bedrooms: 3,
        bathrooms: 2,
        area: 1400,
        description: 'Perfect family home with large garden, driveway parking, and close to excellent schools. Pet-friendly.',
        image_urls: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        latitude: 52.4862,
        longitude: -1.8904,
        view_count: 156,
        created_at: subDays(NOW, 3).toISOString(),
        features: ['Garden', 'Parking', 'Pet Friendly', 'Near Schools'],
        virtual_tour_url: null,
        street_view_lat: 52.4862,
        street_view_lng: -1.8904,
        has_virtual_tour: false,
        status: 'rented'
    },
    {
        id: 'prop-006',
        title: 'Penthouse with Panoramic Views',
        address_line_1: '1 Tower Bridge',
        city: 'London',
        postcode: 'SE1 9SG',
        price: 3500000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 3,
        area: 3200,
        description: 'Exclusive penthouse with 360-degree views of London, private terrace, wine cellar, and smart home technology.',
        image_urls: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
        ],
        latitude: 51.5055,
        longitude: -0.0754,
        view_count: 423,
        created_at: subDays(NOW, 7).toISOString(),
        features: ['Terrace', 'Smart Home', 'Wine Cellar', 'Panoramic Views'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 51.5055,
        street_view_lng: -0.0754,
        has_virtual_tour: true,
        status: 'available'
    },
    {
        id: 'prop-007',
        title: 'Converted Warehouse Loft',
        address_line_1: '55 Brick Lane',
        city: 'London',
        postcode: 'E1 6PU',
        price: 2800,
        property_type: 'rent',
        listing_type: 'rent',
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        description: 'Industrial-chic loft conversion with exposed brick, high ceilings, and original warehouse features.',
        image_urls: [
            'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
        ],
        latitude: 51.5219,
        longitude: -0.0719,
        view_count: 234,
        created_at: subDays(NOW, 4).toISOString(),
        features: ['Exposed Brick', 'High Ceilings', 'Open Plan'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=Zh14WDtkjdB',
        street_view_lat: 51.5219,
        street_view_lng: -0.0719,
        has_virtual_tour: true,
        status: 'available'
    },
    {
        id: 'prop-008',
        title: 'Edinburgh New Town Flat',
        address_line_1: '12 George Street',
        city: 'Edinburgh',
        postcode: 'EH2 2PF',
        price: 425000,
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 2,
        bathrooms: 1,
        area: 900,
        description: 'Elegant Georgian flat in Edinburgh\'s prestigious New Town with period features and castle views.',
        image_urls: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800'
        ],
        latitude: 55.9533,
        longitude: -3.1883,
        view_count: 198,
        created_at: subDays(NOW, 10).toISOString(),
        features: ['Castle Views', 'Period Features', 'City Centre'],
        virtual_tour_url: null,
        street_view_lat: 55.9533,
        street_view_lng: -3.1883,
        has_virtual_tour: false,
        status: 'sold'
    }
];

// ============================================================================
// MOCK INTERNATIONAL PROPERTIES - For Overseas Tab
// ============================================================================

export const MOCK_OVERSEAS_PROPERTIES = [
    {
        id: 'prop-int-001',
        title: 'Luxury Villa with Sea Views',
        address_line_1: 'Calle de la Costa',
        city: 'Marbella',
        country: 'Spain',
        country_code: 'ES',
        postcode: '29600',
        price: 850000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 5,
        bathrooms: 4,
        area: 3500,
        description: 'Stunning Mediterranean villa with panoramic sea views, infinity pool, and modern amenities. Located in prestigious Golden Mile area.',
        image_urls: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
            'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'
        ],
        latitude: 36.5104,
        longitude: -4.8826,
        view_count: 567,
        created_at: '2024-01-10T09:00:00Z',
        features: ['Sea Views', 'Pool', 'Garden', 'Parking', 'Air Conditioning'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 36.5104,
        street_view_lng: -4.8826,
        has_virtual_tour: true,
        agent: {
            name: 'Carlos Rodriguez',
            phone: '+34 952 123 456',
            email: 'carlos@spanishproperties.com',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
            languages: ['English', 'Spanish']
        }
    },
    {
        id: 'prop-int-002',
        title: 'Parisian Apartment with Balcony',
        address_line_1: '15 Avenue des Champs-Élysées',
        city: 'Paris',
        country: 'France',
        country_code: 'FR',
        postcode: '75008',
        price: 1200000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 2,
        area: 1800,
        description: 'Elegant Haussmannian apartment in the heart of Paris with high ceilings, original moldings, and views of the Eiffel Tower.',
        image_urls: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
        ],
        latitude: 48.8698,
        longitude: 2.3076,
        view_count: 892,
        created_at: '2024-01-12T14:30:00Z',
        features: ['Eiffel Tower Views', 'Balcony', 'Period Features', 'Central Location'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 48.8698,
        street_view_lng: 2.3076,
        has_virtual_tour: true,
        agent: {
            name: 'Marie Dubois',
            phone: '+33 1 42 12 34 56',
            email: 'marie@parisimmobilier.fr',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
            languages: ['English', 'French']
        }
    },
    {
        id: 'prop-int-003',
        title: 'Beachfront Apartment in Algarve',
        address_line_1: 'Praia da Rocha',
        city: 'Portimão',
        country: 'Portugal',
        country_code: 'PT',
        postcode: '8500-801',
        price: 425000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        description: 'Modern beachfront apartment with direct beach access, stunning ocean views, and resort amenities including pools and spa.',
        image_urls: [
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
        ],
        latitude: 37.1195,
        longitude: -8.5372,
        view_count: 445,
        created_at: '2024-01-14T11:00:00Z',
        features: ['Beach Access', 'Pool', 'Gym', 'Concierge', 'Parking'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=Zh14WDtkjdB',
        street_view_lat: 37.1195,
        street_view_lng: -8.5372,
        has_virtual_tour: true,
        agent: {
            name: 'João Silva',
            phone: '+351 282 123 456',
            email: 'joao@algarveproperties.pt',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            languages: ['English', 'Portuguese']
        }
    },
    {
        id: 'prop-int-004',
        title: 'Luxury Dubai Marina Penthouse',
        address_line_1: 'Dubai Marina',
        city: 'Dubai',
        country: 'United Arab Emirates',
        country_code: 'AE',
        postcode: '',
        price: 2500000,
        currency: 'AED',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 4,
        bathrooms: 5,
        area: 4200,
        description: 'Spectacular penthouse with 360-degree views of Dubai Marina, Palm Jumeirah, and Arabian Gulf. Features private elevator and rooftop terrace.',
        image_urls: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
        ],
        latitude: 25.0804,
        longitude: 55.1396,
        view_count: 1234,
        created_at: '2024-01-08T08:00:00Z',
        features: ['Panoramic Views', 'Private Elevator', 'Terrace', 'Smart Home', 'Pool'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
        street_view_lat: 25.0804,
        street_view_lng: 55.1396,
        has_virtual_tour: true,
        agent: {
            name: 'Ahmed Al Maktoum',
            phone: '+971 4 123 4567',
            email: 'ahmed@dubaielite.ae',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
            languages: ['English', 'Arabic']
        }
    },
    {
        id: 'prop-int-005',
        title: 'Modern Manhattan Condo',
        address_line_1: '432 Park Avenue',
        city: 'New York',
        country: 'United States',
        country_code: 'US',
        postcode: 'NY 10022',
        price: 3500000,
        currency: 'USD',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 3,
        bathrooms: 3,
        area: 2800,
        description: 'Stunning high-rise condo with floor-to-ceiling windows, Central Park views, and world-class building amenities.',
        image_urls: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        latitude: 40.7614,
        longitude: -73.9776,
        view_count: 987,
        created_at: '2024-01-05T10:00:00Z',
        features: ['Central Park Views', 'Concierge', 'Gym', 'Doorman', 'Storage'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=iJvNfP28yz8',
        street_view_lat: 40.7614,
        street_view_lng: -73.9776,
        has_virtual_tour: true,
        agent: {
            name: 'Jennifer Miller',
            phone: '+1 212 555 1234',
            email: 'jennifer@nycpremier.com',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
            languages: ['English']
        }
    },
    {
        id: 'prop-int-006',
        title: 'Barcelona Modernist Apartment',
        address_line_1: 'Passeig de Gràcia',
        city: 'Barcelona',
        country: 'Spain',
        country_code: 'ES',
        postcode: '08007',
        price: 1800,
        currency: 'EUR',
        property_type: 'rent',
        listing_type: 'rent',
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        description: 'Beautiful modernist apartment in Eixample with original features, high ceilings, and balcony overlooking famous boulevard.',
        image_urls: [
            'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
        ],
        latitude: 41.3919,
        longitude: 2.1649,
        view_count: 356,
        created_at: '2024-01-16T09:00:00Z',
        features: ['Balcony', 'Period Features', 'Central Location', 'Furnished'],
        virtual_tour_url: null,
        street_view_lat: 41.3919,
        street_view_lng: 2.1649,
        has_virtual_tour: false,
        agent: {
            name: 'Sofia Martinez',
            phone: '+34 93 123 4567',
            email: 'sofia@barcelonarentals.es',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
            languages: ['English', 'Spanish', 'Catalan']
        }
    },
    {
        id: 'prop-int-007',
        title: 'French Riviera Villa',
        address_line_1: 'Boulevard de la Croisette',
        city: 'Cannes',
        country: 'France',
        country_code: 'FR',
        postcode: '06400',
        price: 4500000,
        currency: 'EUR',
        property_type: 'sale',
        listing_type: 'sale',
        bedrooms: 6,
        bathrooms: 5,
        area: 5000,
        description: 'Magnificent 1920s villa on the Croisette with private beach access, manicured gardens, and breathtaking Mediterranean views.',
        image_urls: [
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
        ],
        latitude: 43.5513,
        longitude: 7.0128,
        view_count: 1567,
        created_at: '2024-01-03T08:00:00Z',
        features: ['Beach Access', 'Garden', 'Pool', 'Period Features', 'Parking'],
        virtual_tour_url: 'https://my.matterport.com/show/?m=Zh14WDtkjdB',
        street_view_lat: 43.5513,
        street_view_lng: 7.0128,
        has_virtual_tour: true,
        agent: {
            name: 'Pierre Laurent',
            phone: '+33 4 93 12 34 56',
            email: 'pierre@rivieraluxe.fr',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            languages: ['English', 'French', 'Italian']
        }
    },
    {
        id: 'prop-int-008',
        title: 'Lisbon Historic District Loft',
        address_line_1: 'Bairro Alto',
        city: 'Lisbon',
        country: 'Portugal',
        country_code: 'PT',
        postcode: '1200-109',
        price: 1200,
        currency: 'EUR',
        property_type: 'rent',
        listing_type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        area: 750,
        description: 'Charming loft in historic Bairro Alto with exposed stone walls, modern amenities, and rooftop terrace with Tagus River views.',
        image_urls: [
            'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
        ],
        latitude: 38.7139,
        longitude: -9.1450,
        view_count: 234,
        created_at: '2024-01-18T14:00:00Z',
        features: ['Rooftop Terrace', 'Historic Building', 'Furnished', 'City Centre'],
        virtual_tour_url: null,
        street_view_lat: 38.7139,
        street_view_lng: -9.1450,
        has_virtual_tour: false,
        agent: {
            name: 'Ana Costa',
            phone: '+351 21 123 4567',
            email: 'ana@lisbonliving.pt',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
            languages: ['English', 'Portuguese']
        }
    }
];


// ============================================================================
// MOCK APPLICATIONS
// ============================================================================

export const MOCK_APPLICATIONS = [
    {
        id: 'app-001',
        property_id: 'prop-002',
        property: MOCK_PROPERTIES[1],
        status: 'in_progress',
        current_stage: 'Document Verification',
        progress: 40,
        created_at: subDays(NOW, 2).toISOString(),
        updated_at: subHours(NOW, 2).toISOString(),
        timeline: [
            { stage: 'Application Submitted', date: format(subDays(NOW, 2), 'yyyy-MM-dd'), status: 'completed' },
            { stage: 'Document Verification', date: format(NOW, 'yyyy-MM-dd'), status: 'current' },
            { stage: 'Property Inspection', date: null, status: 'pending' },
            { stage: 'Final Approval', date: null, status: 'pending' }
        ]
    },
    {
        id: 'app-002',
        property_id: 'prop-004',
        property: MOCK_PROPERTIES[3],
        status: 'approved',
        current_stage: 'Viewing Scheduled',
        progress: 75,
        created_at: subDays(NOW, 5).toISOString(),
        updated_at: subDays(NOW, 1).toISOString(),
        timeline: [
            { stage: 'Application Submitted', date: format(subDays(NOW, 5), 'yyyy-MM-dd'), status: 'completed' },
            { stage: 'Reference Check', date: format(subDays(NOW, 4), 'yyyy-MM-dd'), status: 'completed' },
            { stage: 'Viewing Scheduled', date: format(subDays(NOW, 1), 'yyyy-MM-dd'), status: 'current' },
            { stage: 'Contract Signing', date: null, status: 'pending' }
        ]
    }
];

// ============================================================================
// MOCK VIEWINGS
// ============================================================================

export const MOCK_VIEWINGS = [
    {
        id: 'view-001',
        property_id: 'prop-002',
        property: MOCK_PROPERTIES[1],
        scheduled_date: format(addDays(NOW, 2), 'yyyy-MM-dd'),
        scheduled_time: '10:00',
        status: 'confirmed',
        agent: {
            name: 'Sarah Mitchell',
            phone: '+44 7700 900123',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
        },
        notes: 'Please arrive 5 minutes early. Parking available in the building.'
    },
    {
        id: 'view-002',
        property_id: 'prop-003',
        property: MOCK_PROPERTIES[2],
        scheduled_date: format(addDays(NOW, 5), 'yyyy-MM-dd'),
        scheduled_time: '14:30',
        status: 'pending',
        agent: {
            name: 'James Wilson',
            phone: '+44 7700 900456',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'
        },
        notes: 'Virtual viewing also available upon request.'
    },
    {
        id: 'view-003',
        property_id: 'prop-006',
        property: MOCK_PROPERTIES[5],
        scheduled_date: format(subDays(NOW, 3), 'yyyy-MM-dd'),
        scheduled_time: '11:00',
        status: 'completed',
        agent: {
            name: 'Emma Thompson',
            phone: '+44 7700 900789',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100'
        },
        notes: 'Viewing completed. Follow-up call scheduled.'
    }
];

// ============================================================================
// MOCK SAVED PROPERTIES
// ============================================================================

export const MOCK_SAVED_PROPERTIES = [
    MOCK_PROPERTIES[0],
    MOCK_PROPERTIES[2],
    MOCK_PROPERTIES[5],
    MOCK_PROPERTIES[6]
];

// ============================================================================
// MOCK USER PROFILE
// ============================================================================

export const MOCK_USER_PROFILE = {
    id: 'user-001',
    email: 'alex.mercer@example.com',
    full_name: 'Alex Mercer',
    phone: '+44 7700 123456',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    address: '123 High Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    preferred_locations: ['London', 'Manchester', 'Birmingham'],
    property_preferences: {
        min_bedrooms: 2,
        max_budget: 500000,
        property_types: ['Apartment', 'House']
    },
    notifications: {
        email: true,
        sms: false,
        push: true
    },
    created_at: subDays(NOW, 30).toISOString()
};

// ============================================================================
// MOCK MESSAGES
// ============================================================================

export const MOCK_MESSAGES = [
    {
        id: 'msg-001',
        sender: {
            name: 'Sarah Mitchell',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
            role: 'agent'
        },
        property_id: 'prop-002',
        property_title: 'Modern 2-Bedroom Apartment',
        preview: 'Thank you for your interest in the property. I would love to arrange a viewing at your convenience.',
        timestamp: subHours(NOW, 2).toISOString(),
        unread: true
    },
    {
        id: 'msg-002',
        sender: {
            name: 'Estospaces Support',
            avatar: null,
            role: 'support'
        },
        property_id: null,
        property_title: null,
        preview: 'Your application for 42 Kensington Gardens has been received. We will review and respond within 24 hours.',
        timestamp: subDays(NOW, 2).toISOString(),
        unread: false
    },
    {
        id: 'msg-003',
        sender: {
            name: 'James Wilson',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
            role: 'agent'
        },
        property_id: 'prop-003',
        property_title: 'Charming 3-Bedroom Cottage',
        preview: 'The seller has accepted your offer! Congratulations! Let\'s discuss the next steps.',
        timestamp: subDays(NOW, 5).toISOString(),
        unread: false
    }
];

// ============================================================================
// MOCK PAYMENTS
// ============================================================================

export const MOCK_PAYMENTS = [
    {
        id: 'pay-001',
        type: 'deposit',
        amount: 3000,
        status: 'completed',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: subDays(NOW, 15).toISOString(),
        reference: 'DEP-2024-001'
    },
    {
        id: 'pay-002',
        type: 'rent',
        amount: 1500,
        status: 'pending',
        property_id: 'prop-004',
        property_title: 'Luxury Studio Flat',
        date: addDays(NOW, 5).toISOString(),
        reference: 'RENT-2024-001'
    },
    {
        id: 'pay-003',
        type: 'service_fee',
        amount: 250,
        status: 'completed',
        property_id: 'prop-002',
        property_title: 'Modern 2-Bedroom Apartment',
        date: subDays(NOW, 20).toISOString(),
        reference: 'FEE-2024-001'
    }
];

// ============================================================================
// MOCK REVIEWS
// ============================================================================

export const MOCK_REVIEWS = [
    {
        id: 'rev-001',
        property_id: 'prop-003',
        property: MOCK_PROPERTIES[2],
        rating: 5,
        title: 'Absolutely stunning cottage!',
        content: 'The photos don\'t do it justice. The cottage is even more beautiful in person. Sarah was incredibly helpful throughout the viewing.',
        author: 'Alex Mercer',
        date: subDays(NOW, 5).toISOString()
    },
    {
        id: 'rev-002',
        property_id: 'prop-002',
        property: MOCK_PROPERTIES[1],
        rating: 4,
        title: 'Great apartment, minor issues',
        content: 'Lovely apartment with amazing views. The only downside is the noise from the nearby construction. Otherwise perfect.',
        author: 'Alex Mercer',
        date: subDays(NOW, 12).toISOString()
    }
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export const getProperties = (type = 'all', filters = {}) => {
    let filtered = [...MOCK_PROPERTIES];

    if (type === 'buy' || type === 'sale') {
        filtered = filtered.filter(p => p.property_type === 'sale');
    } else if (type === 'rent') {
        filtered = filtered.filter(p => p.property_type === 'rent');
    }

    if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms);
    }
    if (filters.location) {
        const loc = filters.location.toLowerCase();
        filtered = filtered.filter(p =>
            p.city.toLowerCase().includes(loc) ||
            p.postcode.toLowerCase().includes(loc) ||
            p.address_line_1.toLowerCase().includes(loc)
        );
    }

    return filtered;
};

export const getPropertyById = (id) => {
    return MOCK_PROPERTIES.find(p => p.id === id) || MOCK_PROPERTIES[0];
};

export const getSavedProperties = () => MOCK_SAVED_PROPERTIES;
export const getApplications = () => MOCK_APPLICATIONS;
export const getViewings = () => MOCK_VIEWINGS;
export const getMessages = () => MOCK_MESSAGES;
export const getPayments = () => MOCK_PAYMENTS;
export const getReviews = () => MOCK_REVIEWS;
export const getUserProfile = () => MOCK_USER_PROFILE;

// Overseas properties exports
export const getOverseasProperties = (filters = {}) => {
    let filtered = [...MOCK_OVERSEAS_PROPERTIES];

    if (filters.country) {
        filtered = filtered.filter(p => p.country_code === filters.country);
    }

    if (filters.type === 'buy' || filters.type === 'sale') {
        filtered = filtered.filter(p => p.property_type === 'sale');
    } else if (filters.type === 'rent') {
        filtered = filtered.filter(p => p.property_type === 'rent');
    }

    if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms);
    }
    if (filters.city) {
        const cityLower = filters.city.toLowerCase();
        filtered = filtered.filter(p => p.city.toLowerCase().includes(cityLower));
    }

    return filtered;
};

export const getOverseasPropertyById = (id) => {
    return MOCK_OVERSEAS_PROPERTIES.find(p => p.id === id) || MOCK_OVERSEAS_PROPERTIES[0];
};
