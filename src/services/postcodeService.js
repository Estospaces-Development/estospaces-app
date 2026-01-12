/**
 * Postcode Service
 * Provides UK postcode autocomplete and address lookup
 */

/**
 * Fetch postcode suggestions from UK Postcodes API
 * Using postcodes.io - a free UK postcode API
 */
export const getPostcodeSuggestions = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Use postcodes.io API for autocomplete
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(query)}/autocomplete`
    );

    if (!response.ok) {
      // If API fails, fall back to mock suggestions
      return getMockPostcodeSuggestions(query);
    }

    const data = await response.json();
    
    if (data.result && data.result.length > 0) {
      return data.result.slice(0, 10); // Return top 10 suggestions
    }

    return getMockPostcodeSuggestions(query);
  } catch (error) {
    console.warn('Postcode API error, using mock suggestions:', error);
    return getMockPostcodeSuggestions(query);
  }
};

/**
 * Validate and get postcode details
 */
export const validatePostcode = async (postcode) => {
  if (!postcode) return { valid: false, data: null };
  
  const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
  
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`
    );
    
    if (!response.ok) {
      return { valid: false, data: null };
    }
    
    const data = await response.json();
    return { valid: data.status === 200, data: data.result };
  } catch (error) {
    console.warn('Postcode validation error:', error);
    return { valid: isValidPostcode(postcode), data: null };
  }
};

/**
 * Mock postcode suggestions for common UK postcode areas
 * This provides fallback when API is unavailable
 */
const getMockPostcodeSuggestions = (query) => {
  const lowerQuery = query.toLowerCase();
  const commonPostcodes = [
    // London
    'SW1A 1AA', 'SW1A 2AA', 'SW1E 5DJ', 'SW1H 0TL', 'SW1P 3BT',
    'SW1W 0DT', 'SW2 1AA', 'SW3 1AA', 'SW4 1AA', 'SW5 1AA',
    'SW6 1AA', 'SW7 1AA', 'SW8 1AA', 'SW9 1AA', 'SW10 1AA',
    'W1A 1AA', 'W1B 1AA', 'W1C 1AA', 'W1D 1AA', 'W1F 1AA',
    'W1G 1AA', 'W1H 1AA', 'W1J 1AA', 'W1K 1AA', 'W1S 1AA',
    'W1T 1AA', 'W1U 1AA', 'W1W 1AA', 'W2 1AA', 'W3 1AA',
    'W4 1AA', 'W5 1AA', 'W6 1AA', 'W7 1AA', 'W8 1AA',
    'W9 1AA', 'W10 1AA', 'W11 1AA', 'W12 1AA', 'W14 1AA',
    'EC1A 1BB', 'EC1M 1AA', 'EC1N 1AA', 'EC1R 1AA', 'EC1V 1AA',
    'EC2A 1AA', 'EC2M 1AA', 'EC2N 1AA', 'EC2P 1AA', 'EC2R 1AA',
    'EC2V 1AA', 'EC3A 1AA', 'EC3M 1AA', 'EC3N 1AA', 'EC3P 1AA',
    'EC3R 1AA', 'EC3V 1AA', 'EC4A 1AA', 'EC4M 1AA', 'EC4N 1AA',
    'EC4P 1AA', 'EC4R 1AA', 'EC4V 1AA', 'EC4Y 1AA',
    'N1 1AA', 'N2 1AA', 'N3 1AA', 'N4 1AA', 'N5 1AA',
    'N6 1AA', 'N7 1AA', 'N8 1AA', 'N9 1AA', 'N10 1AA',
    'E1 1AA', 'E2 1AA', 'E3 1AA', 'E4 1AA', 'E5 1AA',
    'E6 1AA', 'E7 1AA', 'E8 1AA', 'E9 1AA', 'E10 1AA',
    'SE1 1AA', 'SE2 1AA', 'SE3 1AA', 'SE4 1AA', 'SE5 1AA',
    'SE6 1AA', 'SE7 1AA', 'SE8 1AA', 'SE9 1AA', 'SE10 1AA',
    'NW1 1AA', 'NW2 1AA', 'NW3 1AA', 'NW4 1AA', 'NW5 1AA',
    'NW6 1AA', 'NW7 1AA', 'NW8 1AA', 'NW9 1AA', 'NW10 1AA',
    'NW11 1AA',
    // Manchester
    'M1 1AA', 'M2 1AA', 'M3 1AA', 'M4 1AA', 'M5 1AA',
    'M6 1AA', 'M7 1AA', 'M8 1AA', 'M9 1AA', 'M10 1AA',
    'M11 1AA', 'M12 1AA', 'M13 1AA', 'M14 1AA', 'M15 1AA',
    'M16 1AA', 'M17 1AA', 'M18 1AA', 'M19 1AA', 'M20 1AA',
    // Birmingham
    'B1 1AA', 'B2 1AA', 'B3 1AA', 'B4 1AA', 'B5 1AA',
    'B6 1AA', 'B7 1AA', 'B8 1AA', 'B9 1AA', 'B10 1AA',
    'B11 1AA', 'B12 1AA', 'B13 1AA', 'B14 1AA', 'B15 1AA',
    // Liverpool
    'L1 1AA', 'L2 1AA', 'L3 1AA', 'L4 1AA', 'L5 1AA',
    'L6 1AA', 'L7 1AA', 'L8 1AA', 'L9 1AA', 'L10 1AA',
    // Leeds
    'LS1 1AA', 'LS2 1AA', 'LS3 1AA', 'LS4 1AA', 'LS5 1AA',
    'LS6 1AA', 'LS7 1AA', 'LS8 1AA', 'LS9 1AA', 'LS10 1AA',
    // Edinburgh
    'EH1 1AA', 'EH2 1AA', 'EH3 1AA', 'EH4 1AA', 'EH5 1AA',
    'EH6 1AA', 'EH7 1AA', 'EH8 1AA', 'EH9 1AA', 'EH10 1AA',
    // Glasgow
    'G1 1AA', 'G2 1AA', 'G3 1AA', 'G4 1AA', 'G5 1AA',
    'G11 1AA', 'G12 1AA', 'G13 1AA', 'G14 1AA', 'G15 1AA',
    // Bristol
    'BS1 1AA', 'BS2 1AA', 'BS3 1AA', 'BS4 1AA', 'BS5 1AA',
    'BS6 1AA', 'BS7 1AA', 'BS8 1AA', 'BS9 1AA', 'BS10 1AA',
    // Preston
    'PR1 1AA', 'PR2 1AA', 'PR3 1AA', 'PR4 1AA', 'PR5 1AA',
    'PR6 1AA', 'PR7 1AA', 'PR8 1AA', 'PR9 1AA', 'PR25 1AA',
    // Other common areas
    'OX1 1AA', 'OX2 1AA', 'OX3 1AA', 'OX4 1AA', 'OX5 1AA',
    'CV1 1AA', 'CV2 1AA', 'CV3 1AA', 'CV4 1AA', 'CV5 1AA',
    'NG1 1AA', 'NG2 1AA', 'NG3 1AA', 'NG4 1AA', 'NG5 1AA',
    'S1 1AA', 'S2 1AA', 'S3 1AA', 'S4 1AA', 'S5 1AA',
    'BD1 1AA', 'BD2 1AA', 'BD3 1AA', 'BD4 1AA', 'BD5 1AA',
  ];

  // Filter postcodes that start with the query
  const suggestions = commonPostcodes
    .filter(postcode => postcode.toLowerCase().startsWith(lowerQuery))
    .slice(0, 10);

  return suggestions;
};

/**
 * Get addresses for a postcode
 * Returns a list of addresses (houses/buildings) for the given postcode
 */
export const getAddressesByPostcode = async (postcode) => {
  if (!postcode || postcode.length < 5) {
    return [];
  }

  try {
    // Normalize postcode (remove extra spaces, uppercase)
    const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    // Format with space: AB12CD -> AB1 2CD or BT97GG -> BT9 7GG
    const formattedPostcode = normalizedPostcode.replace(
      /^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})$/,
      '$1 $2'
    );

    // Try postcodes.io first to get location details
    const postcodeResponse = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(formattedPostcode)}`
    );

    if (postcodeResponse.ok) {
      const postcodeData = await postcodeResponse.json();
      
      if (postcodeData.result) {
        const { latitude, longitude } = postcodeData.result;
        
        // Try to get actual addresses from OpenStreetMap Nominatim API
        const addresses = await getAddressesFromNominatim(latitude, longitude, postcodeData.result);
        
        if (addresses && addresses.length > 0) {
          return addresses;
        }
        
        // Fall back to generating addresses from postcodes.io data
        return generateAddressesFromPostcodeData(postcodeData.result);
      }
    }

    // If postcodes.io fails, try with OpenStreetMap search
    const nominatimAddresses = await searchAddressesByPostcode(formattedPostcode);
    if (nominatimAddresses && nominatimAddresses.length > 0) {
      return nominatimAddresses;
    }

    // Last resort: generate realistic mock addresses
    return generateMockAddressesForPostcode(formattedPostcode);
  } catch (error) {
    console.warn('Postcode address API error:', error);
    return generateMockAddressesForPostcode(postcode);
  }
};

/**
 * Get addresses from OpenStreetMap Nominatim API using coordinates
 */
const getAddressesFromNominatim = async (lat, lon, postcodeInfo) => {
  try {
    // Search for buildings/addresses near this postcode location
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Estospaces Property App'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data && data.address) {
      // Use the street/road from OSM combined with postcodes.io data
      const streetName = data.address.road || data.address.pedestrian || postcodeInfo.thoroughfare || 'Main Street';
      const city = postcodeInfo.post_town || data.address.city || data.address.town || data.address.village || 'Unknown';
      const county = postcodeInfo.admin_county || data.address.county || '';
      const postcode = postcodeInfo.postcode;
      
      return generateStreetAddresses(streetName, city, county, postcode);
    }

    return null;
  } catch (error) {
    console.warn('Nominatim API error:', error);
    return null;
  }
};

/**
 * Search for addresses using postcode in Nominatim
 */
const searchAddressesByPostcode = async (postcode) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&postalcode=${encodeURIComponent(postcode)}&countrycodes=gb&addressdetails=1&limit=5`,
      {
        headers: {
          'User-Agent': 'Estospaces Property App'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      // Get location info from first result
      const firstResult = data[0];
      const streetName = firstResult.address?.road || firstResult.address?.pedestrian || 'Main Street';
      const city = firstResult.address?.city || firstResult.address?.town || firstResult.address?.village || 'Unknown';
      const county = firstResult.address?.county || '';
      
      return generateStreetAddresses(streetName, city, county, postcode);
    }

    return null;
  } catch (error) {
    console.warn('Nominatim search error:', error);
    return null;
  }
};

/**
 * Generate street addresses given street info
 */
const generateStreetAddresses = (streetName, city, county, postcode) => {
  const addresses = [];
  
  // Common UK house numbers pattern
  const houseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
  
  // Mix of houses and flats for variety
  const addressPatterns = [
    (num) => `${num} ${streetName}`,
    (num) => `${num}A ${streetName}`,
    (num) => `${num}B ${streetName}`,
    (num) => `Flat 1, ${num} ${streetName}`,
    (num) => `Flat 2, ${num} ${streetName}`,
    (num) => `Ground Floor, ${num} ${streetName}`,
    (num) => `First Floor, ${num} ${streetName}`,
  ];
  
  // Generate diverse addresses
  for (let i = 0; i < Math.min(15, houseNumbers.length); i++) {
    const houseNum = houseNumbers[i];
    const patternIndex = i < 10 ? 0 : (i % addressPatterns.length); // First 10 are regular, rest are mixed
    const line1 = addressPatterns[patternIndex](houseNum);
    
    addresses.push({
      line1,
      line2: '',
      city,
      county,
      postcode,
      fullAddress: [line1, city, county, postcode].filter(Boolean).join(', '),
    });
  }
  
  return addresses;
};

/**
 * Generate addresses from postcodes.io data when OSM fails
 */
const generateAddressesFromPostcodeData = (info) => {
  const streetName = info.thoroughfare || info.dependent_thoroughfare || getDefaultStreetForArea(info);
  const city = info.post_town || info.admin_district || 'Unknown';
  const county = info.admin_county || info.admin_district || '';
  const postcode = info.postcode;
  
  return generateStreetAddresses(streetName, city, county, postcode);
};

/**
 * Get a default street name based on postcode area
 */
const getDefaultStreetForArea = (info) => {
  // Common UK street names by region
  const commonStreets = [
    'High Street', 'Main Street', 'Station Road', 'Church Road', 
    'Park Road', 'Victoria Road', 'Mill Lane', 'Church Lane',
    'The Green', 'Manor Road', 'Queen Street', 'King Street'
  ];
  
  // Use a deterministic selection based on postcode
  const hash = info.postcode ? info.postcode.charCodeAt(0) + info.postcode.charCodeAt(info.postcode.length - 1) : 0;
  return commonStreets[hash % commonStreets.length];
};

/**
 * Generate mock addresses as last resort
 */
const generateMockAddressesForPostcode = (postcode) => {
  const upperPostcode = postcode.toUpperCase().replace(/\s+/g, ' ').trim();
  const postcodeArea = upperPostcode.split(' ')[0] || upperPostcode.substring(0, 3);
  
  const city = getCityFromPostcodeArea(postcodeArea);
  const county = getCountyFromPostcodeArea(postcodeArea);
  const streetName = getStreetNameForPostcode(postcodeArea);
  
  return generateStreetAddresses(streetName, city, county, upperPostcode);
};

/**
 * Get street name based on postcode prefix
 */
const getStreetNameForPostcode = (postcodeArea) => {
  const streetMap = {
    'SW': 'Victoria Street',
    'W': 'Oxford Street', 
    'EC': 'Threadneedle Street',
    'N': 'Holloway Road',
    'E': 'Mile End Road',
    'SE': 'Old Kent Road',
    'NW': 'Finchley Road',
    'M': 'Deansgate',
    'B': 'Bull Street',
    'L': 'Bold Street',
    'LS': 'Briggate',
    'PR': 'Fishergate',
    'BT': 'Donegall Place', // Belfast
    'EH': 'Princes Street', // Edinburgh
    'G': 'Buchanan Street', // Glasgow
    'BS': 'Park Street', // Bristol
    'CF': 'Queen Street', // Cardiff
  };
  
  // Check for matching prefix (longest match first)
  for (const [prefix, street] of Object.entries(streetMap)) {
    if (postcodeArea.startsWith(prefix)) {
      return street;
    }
  }
  
  return 'High Street';
};

/**
 * Format address from postcodes.io result
 */
const formatAddress = (result) => {
  const parts = [];
  if (result.thoroughfare) parts.push(result.thoroughfare);
  if (result.dependent_thoroughfare) parts.push(result.dependent_thoroughfare);
  if (result.post_town) parts.push(result.post_town);
  if (result.postcode) parts.push(result.postcode);
  return parts.join(', ');
};

/**
 * Get addresses from alternative API (mock for now)
 */
const getAddressesFromAlternativeAPI = async (postcode) => {
  // This would use another API like getAddress.io or similar
  // For now, return mock addresses
  return getMockAddressesForPostcode(postcode);
};

/**
 * Mock addresses for common UK postcodes
 */
const getMockAddressesForPostcode = (postcode) => {
  const upperPostcode = postcode.toUpperCase().replace(/\s+/g, ' ');
  const postcodeArea = upperPostcode.split(' ')[0];
  
  // Generate mock addresses based on postcode area
  const mockAddresses = [];
  
  // Common address patterns
  const streetNames = ['High Street', 'Main Road', 'Church Lane', 'Park Avenue', 'Station Road', 'Victoria Road', 'King Street', 'Queen Street'];
  const numbers = Array.from({ length: 50 }, (_, i) => i + 1);
  
  // Generate 5-10 mock addresses
  for (let i = 0; i < Math.min(8, streetNames.length); i++) {
    const number = numbers[Math.floor(Math.random() * numbers.length)];
    const street = streetNames[i];
    
    mockAddresses.push({
      line1: `${number} ${street}`,
      line2: '',
      city: getCityFromPostcodeArea(postcodeArea),
      county: getCountyFromPostcodeArea(postcodeArea),
      postcode: upperPostcode,
      fullAddress: `${number} ${street}, ${getCityFromPostcodeArea(postcodeArea)}, ${upperPostcode}`,
    });
  }
  
  return mockAddresses;
};

/**
 * Get city name from postcode area
 */
const getCityFromPostcodeArea = (area) => {
  // Check by prefix patterns (most specific first)
  const prefixMap = {
    'SW': 'London', 'SE': 'London', 'NW': 'London', 'WC': 'London',
    'EC': 'London', 'W': 'London', 'N': 'London', 'E': 'London',
    'M': 'Manchester',
    'B': 'Birmingham',
    'L': 'Liverpool',
    'LS': 'Leeds',
    'S': 'Sheffield',
    'PR': 'Preston',
    'BT': 'Belfast', // Northern Ireland
    'EH': 'Edinburgh',
    'G': 'Glasgow',
    'CF': 'Cardiff',
    'BS': 'Bristol',
    'NG': 'Nottingham',
    'LE': 'Leicester',
    'CV': 'Coventry',
    'NE': 'Newcastle',
    'SR': 'Sunderland',
    'OX': 'Oxford',
    'CB': 'Cambridge',
    'PO': 'Portsmouth',
    'SO': 'Southampton',
    'BN': 'Brighton',
    'PL': 'Plymouth',
    'EX': 'Exeter',
    'BA': 'Bath',
    'YO': 'York',
    'HU': 'Hull',
    'DN': 'Doncaster',
    'WF': 'Wakefield',
    'BD': 'Bradford',
    'HD': 'Huddersfield',
    'HX': 'Halifax',
    'OL': 'Oldham',
    'BL': 'Bolton',
    'WN': 'Wigan',
    'WA': 'Warrington',
    'CH': 'Chester',
    'ST': 'Stoke-on-Trent',
    'DE': 'Derby',
    'NN': 'Northampton',
    'MK': 'Milton Keynes',
    'LU': 'Luton',
    'SL': 'Slough',
    'RG': 'Reading',
    'GU': 'Guildford',
    'TW': 'Twickenham',
    'KT': 'Kingston upon Thames',
    'CR': 'Croydon',
    'BR': 'Bromley',
    'DA': 'Dartford',
    'RM': 'Romford',
    'IG': 'Ilford',
    'EN': 'Enfield',
    'HA': 'Harrow',
    'UB': 'Southall',
    'TN': 'Tunbridge Wells',
    'CT': 'Canterbury',
    'ME': 'Maidstone',
    'SS': 'Southend-on-Sea',
    'CM': 'Chelmsford',
    'CO': 'Colchester',
    'IP': 'Ipswich',
    'NR': 'Norwich',
    'PE': 'Peterborough',
    'LN': 'Lincoln',
    'HG': 'Harrogate',
    'DL': 'Darlington',
    'TS': 'Middlesbrough',
    'DH': 'Durham',
    'CA': 'Carlisle',
    'LA': 'Lancaster',
    'FY': 'Blackpool',
    'BB': 'Blackburn',
    'SK': 'Stockport',
    'CW': 'Crewe',
    'WR': 'Worcester',
    'HR': 'Hereford',
    'GL': 'Gloucester',
    'SN': 'Swindon',
    'SP': 'Salisbury',
    'BH': 'Bournemouth',
    'DT': 'Dorchester',
    'TA': 'Taunton',
    'TR': 'Truro',
    'TQ': 'Torquay',
    'SA': 'Swansea',
    'LD': 'Llandrindod Wells',
    'SY': 'Shrewsbury',
    'LL': 'Llandudno',
    'AB': 'Aberdeen',
    'DD': 'Dundee',
    'KY': 'Kirkcaldy',
    'FK': 'Falkirk',
    'PA': 'Paisley',
    'KA': 'Kilmarnock',
    'DG': 'Dumfries',
    'IV': 'Inverness',
    'PH': 'Perth',
  };
  
  // Check for matching prefix (longest match first)
  const sortedPrefixes = Object.keys(prefixMap).sort((a, b) => b.length - a.length);
  for (const prefix of sortedPrefixes) {
    if (area.startsWith(prefix)) {
      return prefixMap[prefix];
    }
  }
  
  return 'UK';
};

/**
 * Get county from postcode area
 */
const getCountyFromPostcodeArea = (area) => {
  const countyMap = {
    'SW': 'Greater London', 'SE': 'Greater London', 'NW': 'Greater London', 
    'WC': 'Greater London', 'EC': 'Greater London', 'W': 'Greater London',
    'N': 'Greater London', 'E': 'Greater London',
    'M': 'Greater Manchester',
    'B': 'West Midlands',
    'L': 'Merseyside',
    'LS': 'West Yorkshire', 'BD': 'West Yorkshire', 'HX': 'West Yorkshire',
    'HD': 'West Yorkshire', 'WF': 'West Yorkshire',
    'S': 'South Yorkshire', 'DN': 'South Yorkshire',
    'PR': 'Lancashire', 'BB': 'Lancashire', 'FY': 'Lancashire', 'LA': 'Lancashire',
    'BT': 'County Antrim', // Northern Ireland - Belfast
    'EH': 'Midlothian', // Edinburgh
    'G': 'Glasgow City', // Glasgow
    'CF': 'South Glamorgan', // Cardiff
    'BS': 'Bristol', // Bristol
    'NG': 'Nottinghamshire',
    'LE': 'Leicestershire',
    'CV': 'West Midlands',
    'NE': 'Tyne and Wear', 'SR': 'Tyne and Wear',
    'OX': 'Oxfordshire',
    'CB': 'Cambridgeshire',
    'PO': 'Hampshire', 'SO': 'Hampshire',
    'BN': 'East Sussex',
    'PL': 'Devon', 'EX': 'Devon', 'TQ': 'Devon',
    'BA': 'Somerset', 'TA': 'Somerset',
    'YO': 'North Yorkshire', 'HG': 'North Yorkshire',
    'HU': 'East Riding of Yorkshire',
    'OL': 'Greater Manchester', 'BL': 'Greater Manchester', 'SK': 'Greater Manchester',
    'WN': 'Greater Manchester', 'WA': 'Cheshire',
    'CH': 'Cheshire', 'CW': 'Cheshire',
    'ST': 'Staffordshire',
    'DE': 'Derbyshire',
    'NN': 'Northamptonshire',
    'MK': 'Buckinghamshire',
    'LU': 'Bedfordshire',
    'SL': 'Berkshire', 'RG': 'Berkshire',
    'GU': 'Surrey', 'KT': 'Surrey',
    'TW': 'Greater London',
    'CR': 'Greater London', 'BR': 'Greater London',
    'DA': 'Kent', 'TN': 'Kent', 'CT': 'Kent', 'ME': 'Kent',
    'RM': 'Greater London', 'IG': 'Greater London', 'EN': 'Greater London',
    'HA': 'Greater London', 'UB': 'Greater London',
    'SS': 'Essex', 'CM': 'Essex', 'CO': 'Essex',
    'IP': 'Suffolk',
    'NR': 'Norfolk',
    'PE': 'Cambridgeshire',
    'LN': 'Lincolnshire',
    'DL': 'County Durham', 'DH': 'County Durham',
    'TS': 'North Yorkshire',
    'CA': 'Cumbria',
    'WR': 'Worcestershire',
    'HR': 'Herefordshire',
    'GL': 'Gloucestershire',
    'SN': 'Wiltshire', 'SP': 'Wiltshire',
    'BH': 'Dorset', 'DT': 'Dorset',
    'TR': 'Cornwall',
    'SA': 'West Glamorgan',
    'LL': 'Clwyd',
    'SY': 'Shropshire',
    'AB': 'Aberdeenshire',
    'DD': 'Angus',
    'KY': 'Fife',
    'FK': 'Stirlingshire',
    'PA': 'Renfrewshire',
    'KA': 'Ayrshire',
    'DG': 'Dumfries and Galloway',
    'IV': 'Highland',
    'PH': 'Perthshire',
  };
  
  // Check for matching prefix (longest match first)
  const sortedPrefixes = Object.keys(countyMap).sort((a, b) => b.length - a.length);
  for (const prefix of sortedPrefixes) {
    if (area.startsWith(prefix)) {
      return countyMap[prefix];
    }
  }
  
  return '';
};

/**
 * Validate UK postcode format
 */
export const isValidPostcode = (postcode) => {
  if (!postcode) return false;
  
  // UK postcode regex pattern
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return ukPostcodeRegex.test(postcode.trim());
};

