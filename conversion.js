/**
 * Core conversion utilities for D&D imperial to metric conversions
 */

const ConversionUtils = {
  // Length conversions
  feetToMeters: (feet) => {
    const meters = feet * 0.3048;
    return Math.round(meters * 10) / 10; // Round to 1 decimal place
  },

  milesToKilometers: (miles) => {
    const km = miles * 1.60934;
    return Math.round(km * 10) / 10; // Round to 1 decimal place
  },

  inchesToCentimeters: (inches) => {
    const cm = inches * 2.54;
    return Math.round(cm); // Round to nearest whole number
  },

  // Weight conversions
  poundsToKilograms: (pounds) => {
    const kg = pounds * 0.453592;
    return Math.round(kg * 10) / 10; // Round to 1 decimal place
  },

  // Volume conversions
  gallonsToLiters: (gallons) => {
    const liters = gallons * 3.78541;
    return Math.round(liters); // Round to nearest whole liter
  },

  quartToLiters: (quart) => {
    const liters = quart * 0.946353;
    return Math.round(liters * 10) / 10; // Round to 1 decimal place
  },

  // Temperature conversions
  fahrenheitToCelsius: (fahrenheit) => {
    const celsius = (fahrenheit - 32) * 5/9;
    return Math.round(celsius); // Round to nearest whole degree
  }
};

/**
 * Regular expressions for matching different imperial unit formats
 * Using word boundaries (\b) and lookahead (?!\w) to ensure we only match complete words
 */
const UnitRegexPatterns = {
  // Length
  feet: /(\d+(?:\.\d+)?)\s*(foot|feet|ft\.?|′)(?!\w)/gi,
  miles: /(\d+(?:\.\d+)?)\s*(mile|miles|mi\.?)(?!\w)/gi,
  inches: /(\d+(?:\.\d+)?)\s*(inch|inches|in\.?|″)(?!\w)/gi,

  // Weight
  pounds: /(\d+(?:\.\d+)?)\s*(pound|pounds|lb|lbs\.?)(?!\w)/gi,

  // Volume
  gallons: /(\d+(?:\.\d+)?)\s*(gallon|gallons|gal\.?)(?!\w)/gi,
  quarts: /(\d+(?:\.\d+)?)\s*(quart|quarts|qt\.?)(?!\w)/gi,

  // Temperature
  fahrenheit: /(\d+(?:\.\d+)?)\s*(°F|degrees Fahrenheit|Fahrenheit)(?!\w)/gi
};
