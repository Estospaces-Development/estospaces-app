import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Property {
  id: string;
  // Basic Info
  title: string;
  propertyType: string;
  rentalType: string;
  price: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Property Details
  bedrooms: number;
  bathrooms: number;
  area: number;
  yearBuilt: number;
  propertyId: string;
  description: string;
  // Media & Features
  images: File[] | string[];
  virtualTourUrl: string;
  videos: File[] | string[];
  features: string[];
  // Contact & Publish
  availableDate: string;
  deposit: string;
  inclusions: string;
  exclusions: string;
  contactName: string;
  phoneNumber: string;
  emailAddress: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  published: boolean;
  draft: boolean;
}

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Property;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getProperty: (id: string) => Property | undefined;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within PropertyProvider');
  }
  return context;
};

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);

  // Load properties from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('properties');
    if (stored) {
      try {
        setProperties(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading properties:', error);
      }
    }
  }, []);

  // Save properties to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
  }, [properties]);

  const addProperty = (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property => {
    const newProperty: Property = {
      ...propertyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProperties((prev) => [...prev, newProperty]);
    return newProperty;
  };

  const updateProperty = (id: string, propertyData: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === id
          ? { ...prop, ...propertyData, updatedAt: new Date().toISOString() }
          : prop
      )
    );
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((prop) => prop.id !== id));
  };

  const getProperty = (id: string): Property | undefined => {
    return properties.find((prop) => prop.id === id);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
        getProperty,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

