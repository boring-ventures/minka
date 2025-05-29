import { CountryCode, findCountryByCode } from "@/data/country-codes";

export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber: string;
  errorMessage?: string;
}

// Format phone number based on country patterns
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode?: string
): string {
  if (!countryCode || !phoneNumber) return phoneNumber;

  const country = findCountryByCode(countryCode);
  if (!country) return phoneNumber;

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  // Apply basic formatting based on common patterns
  switch (countryCode) {
    case "US":
    case "CA":
      // Format: (123) 456-7890
      if (digits.length >= 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      } else if (digits.length >= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length >= 3) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      }
      return digits;

    case "BO":
      // Format: 7123 4567
      if (digits.length >= 8) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
      } else if (digits.length >= 4) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      }
      return digits;

    case "BR":
      // Format: (11) 98765-4321
      if (digits.length >= 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
      } else if (digits.length >= 7) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length >= 2) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      }
      return digits;

    case "AR":
      // Format: 911 1234-5678
      if (digits.length >= 10) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 10)}`;
      } else if (digits.length >= 7) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
      } else if (digits.length >= 3) {
        return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      }
      return digits;

    case "GB":
      // Format: 01234 567890
      if (digits.length >= 10) {
        return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
      } else if (digits.length >= 5) {
        return `${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
      return digits;

    case "FR":
    case "DE":
    case "IT":
    case "ES":
      // Format: 01 23 45 67 89
      const formatted = digits.match(/.{1,2}/g)?.join(" ") || digits;
      return formatted;

    default:
      // Basic formatting - add spaces every 3-4 digits
      if (digits.length > 7) {
        return digits.match(/.{1,3}/g)?.join(" ") || digits;
      } else if (digits.length > 3) {
        return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      }
      return digits;
  }
}

// Validate phone number based on country rules
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode?: string
): PhoneValidationResult {
  if (!phoneNumber) {
    return {
      isValid: false,
      formattedNumber: "",
      errorMessage: "El número de teléfono es requerido",
    };
  }

  if (!countryCode) {
    return {
      isValid: false,
      formattedNumber: phoneNumber,
      errorMessage: "Selecciona un país",
    };
  }

  const country = findCountryByCode(countryCode);
  if (!country) {
    return {
      isValid: false,
      formattedNumber: phoneNumber,
      errorMessage: "País no válido",
    };
  }

  // Remove all non-digit characters for validation
  const digits = phoneNumber.replace(/\D/g, "");

  // Check if we have phone validation rules for this country
  if (country.phoneLength && country.phonePattern) {
    const expectedLengths = Array.isArray(country.phoneLength)
      ? country.phoneLength
      : [country.phoneLength];

    // Check length
    if (!expectedLengths.includes(digits.length)) {
      const lengthStr =
        expectedLengths.length === 1
          ? expectedLengths[0].toString()
          : expectedLengths.join(" o ");
      return {
        isValid: false,
        formattedNumber: formatPhoneNumber(phoneNumber, countryCode),
        errorMessage: `El número debe tener ${lengthStr} dígitos`,
      };
    }

    // Check pattern
    const regex = new RegExp(country.phonePattern);
    if (!regex.test(digits)) {
      return {
        isValid: false,
        formattedNumber: formatPhoneNumber(phoneNumber, countryCode),
        errorMessage: "Formato de número no válido",
      };
    }
  } else {
    // Basic validation for countries without specific rules
    if (digits.length < 6 || digits.length > 15) {
      return {
        isValid: false,
        formattedNumber: formatPhoneNumber(phoneNumber, countryCode),
        errorMessage: "El número debe tener entre 6 y 15 dígitos",
      };
    }
  }

  return {
    isValid: true,
    formattedNumber: formatPhoneNumber(phoneNumber, countryCode),
  };
}

// Get placeholder for country
export function getPhonePlaceholder(countryCode?: string): string {
  if (!countryCode) return "XXXXXXXX";

  const country = findCountryByCode(countryCode);
  return country?.phonePlaceholder || "XXXXXXXX";
}
