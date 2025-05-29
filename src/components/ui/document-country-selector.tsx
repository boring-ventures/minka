"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countryCodes, findCountryByCode } from "@/data/country-codes";

interface DocumentCountrySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DocumentCountrySelector({
  value = "BO",
  onValueChange,
  disabled = false,
  className,
}: DocumentCountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedCountry = findCountryByCode(value);

  return (
    <div className={cn("flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-10 px-3 border-black border-r border-r-black rounded-l-md rounded-r-none bg-white hover:bg-gray-50 justify-between min-w-[100px]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <div className="flex items-center">
              <span className="mr-2" aria-label={selectedCountry?.name}>
                {selectedCountry?.flag}
              </span>
              <span className="text-sm font-normal">
                {selectedCountry?.code}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar país..." className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontró ningún país.</CommandEmpty>
              <CommandGroup>
                {countryCodes.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code}`}
                    onSelect={() => {
                      onValueChange?.(country.code);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="mr-3" aria-label={country.name}>
                        {country.flag}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm">{country.name}</span>
                        <span className="text-xs text-gray-500 font-mono">
                          {country.code}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
