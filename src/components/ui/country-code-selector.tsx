"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  countryCodes,
  CountryCode,
  findCountryByCode,
} from "@/data/country-codes";
import { cn } from "@/lib/utils";

interface CountryCodeSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CountryCodeSelector({
  value,
  onValueChange,
  placeholder = "País",
  disabled = false,
  className,
}: CountryCodeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search query
  const filteredCountries = countryCodes.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  // Get selected country for display
  const selectedCountry = value ? findCountryByCode(value) : null;

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    onValueChange?.(countryCode);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "flex items-center justify-between h-10 px-3 border-black border-r border-r-black rounded-l-md rounded-r-none bg-white hover:bg-gray-50 text-sm w-auto min-w-0",
            className
          )}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-1">
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="text-xs font-medium whitespace-nowrap">
                {selectedCountry.dialCode}
              </span>
            </div>
          ) : (
            <span className="text-gray-500 text-xs">{placeholder}</span>
          )}
          <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 overflow-hidden"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        {/* Search Header */}
        <div className="sticky top-0 bg-white border-b p-2 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar país..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-gray-200 text-sm w-full"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Countries List */}
        <div className="max-h-60 overflow-y-auto overflow-x-hidden">
          {filteredCountries.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No se encontraron países
            </div>
          ) : (
            filteredCountries.map((country) => (
              <button
                key={country.code}
                className="w-full text-left p-2 hover:bg-gray-50 cursor-pointer border-none bg-transparent"
                onClick={() => handleCountrySelect(country.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                    <span className="text-lg flex-shrink-0">
                      {country.flag}
                    </span>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {country.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {country.dialCode}
                      </div>
                    </div>
                  </div>
                  {value === country.code && (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
