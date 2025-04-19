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

export interface CategoryItem {
  name: string;
  count: number;
}

interface CategorySelectorProps {
  categories: CategoryItem[];
  selectedCategory?: string;
  onSelectCategory: (category: string | undefined) => void;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    selectedCategory
  );

  const handleCategoryClick = (category: string | undefined) => {
    setActiveCategory(category);
    onSelectCategory(category);
  };

  // Default categories if none are provided
  const defaultCategories: CategoryItem[] = [
    { name: "Medio ambiente", count: 42 },
    { name: "Educación", count: 35 },
    { name: "Salud", count: 28 },
    { name: "Igualdad", count: 21 },
    { name: "Cultura y arte", count: 15 },
    { name: "Deporte", count: 12 },
  ];

  // Use provided categories or defaults if empty
  const displayCategories =
    categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="mt-16">
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => handleCategoryClick(undefined)}
          className={`px-6 py-4 border-2 rounded-full transition-all ${
            activeCategory === undefined
              ? "border-[#2c6e49] bg-[#2c6e49] text-white"
              : "border-gray-300 hover:border-[#2c6e49] text-[#333333]"
          }`}
        >
          Todas las categorías
        </button>

        {displayCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
            className={`px-6 py-4 border-2 rounded-full transition-all flex items-center ${
              activeCategory === category.name
                ? "border-[#2c6e49] bg-[#2c6e49] text-white"
                : "border-gray-300 hover:border-[#2c6e49] text-[#333333]"
            }`}
          >
            <span>{category.name}</span>
            <span className="ml-2 bg-white bg-opacity-20 text-sm px-2 py-0.5 rounded-full">
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
