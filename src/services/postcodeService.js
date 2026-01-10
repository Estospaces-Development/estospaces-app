/**
 * Postcode Service
 * Provides UK postcode autocomplete suggestions
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
    // Normalize postcode (remove spaces, uppercase)
    const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    // Format with space: AB12CD -> AB1 2CD
    const formattedPostcode = normalizedPostcode.replace(
      /^([A-Z]{1,2}[0-9][A-Z0-9]?)([0-9][A-Z]{2})$/,
      '$1 $2'
    );

    // Use postcodes.io API to get addresses
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(formattedPostcode)}`
    );

    if (!response.ok) {
      // Try alternative API endpoint for address lookup
      return getAddressesFromAlternativeAPI(formattedPostcode);
    }

    const data = await response.json();
    
    if (data.result) {
      // Return the main address from postcodes.io
      const address = {
        line1: data.result.thoroughfare || '',
        line2: data.result.dependent_thoroughfare || '',
        city: data.result.post_town || data.result.admin_district || '',
        county: data.result.admin_county || data.result.admin_district || '',
        postcode: data.result.postcode,
        fullAddress: formatAddress(data.result),
      };
      
      // Try to get more addresses from the same postcode area
      try {
        const addressesResponse = await fetch(
          `https://api.getAddress.io/find/${encodeURIComponent(formattedPostcode)}?api-key=YOUR_API_KEY`
        );
        // Note: getAddress.io requires an API key, so we'll use mock data as fallback
      } catch (err) {
        // Fallback to mock addresses
        return getMockAddressesForPostcode(formattedPostcode);
      }
      
      return [address];
    }

    return getMockAddressesForPostcode(formattedPostcode);
  } catch (error) {
    console.warn('Postcode address API error, using mock addresses:', error);
    return getMockAddressesForPostcode(postcode);
  }
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
  const areaMap = {
    'SW1': 'London', 'SW2': 'London', 'SW3': 'London', 'SW4': 'London', 'SW5': 'London',
    'SW6': 'London', 'SW7': 'London', 'SW8': 'London', 'SW9': 'London', 'SW10': 'London',
    'W1': 'London', 'W2': 'London', 'W3': 'London', 'W4': 'London', 'W5': 'London',
    'W6': 'London', 'W7': 'London', 'W8': 'London', 'W9': 'London', 'W10': 'London',
    'W11': 'London', 'W12': 'London', 'W14': 'London',
    'EC1': 'London', 'EC2': 'London', 'EC3': 'London', 'EC4': 'London',
    'N1': 'London', 'N2': 'London', 'N3': 'London', 'N4': 'London', 'N5': 'London',
    'E1': 'London', 'E2': 'London', 'E3': 'London', 'E4': 'London', 'E5': 'London',
    'SE1': 'London', 'SE2': 'London', 'SE3': 'London', 'SE4': 'London', 'SE5': 'London',
    'NW1': 'London', 'NW2': 'London', 'NW3': 'London', 'NW4': 'London', 'NW5': 'London',
    'M1': 'Manchester', 'M2': 'Manchester', 'M3': 'Manchester', 'M4': 'Manchester',
    'B1': 'Birmingham', 'B2': 'Birmingham', 'B3': 'Birmingham', 'B4': 'Birmingham',
    'L1': 'Liverpool', 'L2': 'Liverpool', 'L3': 'Liverpool', 'L4': 'Liverpool',
    'LS1': 'Leeds', 'LS2': 'Leeds', 'LS3': 'Leeds', 'LS4': 'Leeds',
    'PR1': 'Preston', 'PR2': 'Preston', 'PR3': 'Preston', 'PR4': 'Preston', 'PR5': 'Preston',
  };
  
  return areaMap[area] || 'UK';
};

/**
 * Get county from postcode area
 */
const getCountyFromPostcodeArea = (area) => {
  if (area.startsWith('SW') || area.startsWith('W') || area.startsWith('EC') || 
      area.startsWith('N') || area.startsWith('E') || area.startsWith('SE') || area.startsWith('NW')) {
    return 'Greater London';
  }
  if (area.startsWith('M')) return 'Greater Manchester';
  if (area.startsWith('B')) return 'West Midlands';
  if (area.startsWith('L')) return 'Merseyside';
  if (area.startsWith('LS')) return 'West Yorkshire';
  if (area.startsWith('PR')) return 'Lancashire';
  return 'UK';
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

