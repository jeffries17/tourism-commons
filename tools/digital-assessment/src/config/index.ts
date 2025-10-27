import type { CountryConfig } from '../types/index';
import { gambiaConfig } from './countries/gambia';

// Export all country configs
export const countryConfigs = {
  gambia: gambiaConfig,
  // Add more countries here as needed
};

// Default to Gambia for now
export const currentCountry: CountryConfig = gambiaConfig;

// Helper function to get config by country code
export const getCountryConfig = (countryCode: string): CountryConfig => {
  const configs: Record<string, CountryConfig> = {
    'GM': gambiaConfig,
    // Add more mappings as needed
  };
  
  return configs[countryCode] || gambiaConfig;
};

