"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Grid2X2,
  Palette,
  GraduationCap,
  AlertTriangle,
  Heart,
  Leaf,
  Stethoscope,
} from "lucide-react";

const categories = [
  { id: "todas", label: "Todas", icon: Grid2X2 },
  { id: "cultura", label: "Cultura y arte", icon: Palette },
  { id: "educacion", label: "Educación", icon: GraduationCap },
  { id: "emergencia", label: "Emergencia", icon: AlertTriangle },
  { id: "igualdad", label: "Igualdad", icon: Heart },
  { id: "medioambiente", label: "Medioambiente", icon: Leaf },
  { id: "salud", label: "Salud", icon: Stethoscope },
];

export function CategorySelector() {
  const [selectedCategory, setSelectedCategory] = useState("todas");

  return (
    <div className="flex flex-wrap gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <button
            type="button"
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
              "hover:border-[#2c6e49] hover:shadow-sm",
              "min-w-[120px] aspect-[4/3]",
              selectedCategory === category.id
                ? "border-[#2c6e49] bg-[#e8f0e9]"
                : "border-gray-200 bg-white"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 mb-2",
                selectedCategory === category.id
                  ? "text-[#2c6e49]"
                  : "text-gray-600"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium text-center",
                selectedCategory === category.id
                  ? "text-[#2c6e49]"
                  : "text-gray-600"
              )}
            >
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
