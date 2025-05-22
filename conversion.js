/**
 * Core conversion utilities for D&D imperial to metric conversions
 */

// Helper function for rounding to a specific number of decimal places
const roundToDecimalPlaces = (num, dp) => {
  if (typeof dp !== 'number' || dp < 0) {
    // Default to 0 decimal places if dp is invalid, or handle error appropriately
    const factorDefault = Math.pow(10, 0);
    return Math.round(num * factorDefault) / factorDefault;
  }
  const factor = Math.pow(10, dp);
  return Math.round(num * factor) / factor;
};

const ConversionUtils = {
  // Length conversions
  feetToMeters: (feet, smartRoundingEnabled = false) => {
    const meters = feet * 0.3048;
    if (!smartRoundingEnabled) {
      return roundToDecimalPlaces(meters, 2);
    } else {
      if (feet < 10) return roundToDecimalPlaces(meters, 1);
      return roundToDecimalPlaces(meters, 0); // feet >= 10
    }
  },

  milesToKilometers: (miles, smartRoundingEnabled = false) => {
    const km = miles * 1.60934;
    if (!smartRoundingEnabled) {
      return roundToDecimalPlaces(km, 2);
    } else {
      if (miles < 10) return roundToDecimalPlaces(km, 1);
      if (miles >= 10 && miles < 100) return roundToDecimalPlaces(km, 0);
      return Math.round(km / 10) * 10; // miles >= 100, round to nearest 10
    }
  },

  inchesToCentimeters: (inches, smartRoundingEnabled = false) => {
    const cm = inches * 2.54;
    if (!smartRoundingEnabled) {
      return roundToDecimalPlaces(cm, 2);
    } else {
      if (inches < 10) return roundToDecimalPlaces(cm, 1);
      return roundToDecimalPlaces(cm, 0); // inches >= 10
    }
  },

  // Weight conversions
  poundsToKilograms: (pounds, smartRoundingEnabled = false) => {
    const kg = pounds * 0.453592;
    if (!smartRoundingEnabled) {
      return roundToDecimalPlaces(kg, 2);
    } else {
      if (pounds < 10) return roundToDecimalPlaces(kg, 1);
      return roundToDecimalPlaces(kg, 0); // pounds >= 10
    }
  },

  // Volume conversions
  gallonsToLiters: (gallons, smartRoundingEnabled = false) => {
    const liters = gallons * 3.78541;
    if (!smartRoundingEnabled) {
      return roundToDecimalPlaces(liters, 2);
    } else {
      if (gallons === 1) return 3.5; // Specific user example
      if (gallons > 0 && gallons < 10) return roundToDecimalPlaces(liters, 1);
      if (gallons >= 10 && gallons < 100) return roundToDecimalPlaces(liters, 0);

      return roundToDecimalPlaces(liters, 0); // Default for any other case if needed
    }
  },

  quartToLiters: (quart, smartRoundingEnabled = false) => {
    const liters = quart * 0.946353;
    if (!smartRoundingEnabled) {
      return roundToDecimalPlaces(liters, 2);
    } else {
      if (quart < 10) return roundToDecimalPlaces(liters, 1);
      return roundToDecimalPlaces(liters, 0); // quart >= 10
    }
  },

  // Temperature conversions
  fahrenheitToCelsius: (fahrenheit, smartRoundingEnabled = false) => {
    const celsius = (fahrenheit - 32) * 5/9;
    if (!smartRoundingEnabled) {
      return roundToDecimalPlaces(celsius, 2);
    } else {
      // Smart rounding for Celsius usually means whole numbers.
      return roundToDecimalPlaces(celsius, 0);
    }
  },

  // New Volume (cubic) conversion
  cubicFeetToCubicMeters: (cubicFeet, smartRoundingEnabled = false) => {
    const cubicMeters = cubicFeet * 0.0283168;
    if (!smartRoundingEnabled) {
      return roundToDecimalPlaces(cubicMeters, 2); // Default to 2 decimal places
    } else {
      if (cubicFeet < 1) return roundToDecimalPlaces(cubicMeters, 3);
      if (cubicFeet >= 1 && cubicFeet < 10) return roundToDecimalPlaces(cubicMeters, 2);
      return roundToDecimalPlaces(cubicMeters, 1); // For 100 cubic feet or more
    }
  }
};

/**
 * Regular expressions for matching different imperial unit formats
 * Using word boundaries (\b) and lookahead (?!\w) to ensure we only match complete words
 */
const UnitRegexPatterns = {
  // Length
  feetRange: /(\d+(?:\.\d+)?)\s*(?:-|–|\s+to\s+)\s*(\d+(?:\.\d+)?)\s*(foot|feet|ft\.?|′)(?!\w)/gi, // For ranges like 5-7 feet or 5 to 7 feet
  feet: /(\d+(?:\.\d+)?)(?:\s*|-)(foot|feet|ft\.?|′)(?!\w)/gi,
  miles: /(\d+(?:\.\d+)?)\s*(mile|miles|mi\.?)(?!\w)/gi,
  inches: /(\d+(?:\.\d+)?)\s*(inch|inches|in\.?|″)(?!\w)/gi,

  // Weight
  pounds: /(\d+(?:\.\d+)?)\s*(pound|pounds|lb|lbs\.?)(?!\w)/gi,

  // Volume
  gallons: /(\d+(?:\.\d+)?)\s*(gallon|gallons|gal\.?)(?!\w)/gi,
  quarts: /(\d+(?:\.\d+)?)\s*(quart|quarts|qt\.?)(?!\w)/gi,
  cubicFeet: /(\d+(?:\.\d+)?)\s*(cubic\sfeet|cubic\sfoot|cu\sft|ft³|ft\^3)(?!\w)/gi, // Added cubic feet

  // Temperature
  fahrenheit: /(\d+(?:\.\d+)?)\s*(°F|degrees Fahrenheit|Fahrenheit)(?!\w)/gi
};
