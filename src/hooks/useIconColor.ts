import { useState, useEffect } from 'react';

export interface IconColorOption {
  id: string;
  name: string;
  hex: string;
  tailwindText: string;
  tailwindBg: string;
  tailwindRing: string;
}

export const ICON_COLOR_OPTIONS: IconColorOption[] = [
  {
    id: 'indigo',
    name: 'Entropy Índigo (Padrão)',
    hex: '#4f46e5',
    tailwindText: 'text-indigo-600 dark:text-indigo-400',
    tailwindBg: 'bg-indigo-600',
    tailwindRing: 'ring-indigo-500',
  },
  {
    id: 'sky',
    name: 'Azul Corporativo',
    hex: '#0284c7',
    tailwindText: 'text-sky-600 dark:text-sky-400',
    tailwindBg: 'bg-sky-600',
    tailwindRing: 'ring-sky-500',
  },
  {
    id: 'emerald',
    name: 'Verde Esmeralda',
    hex: '#059669',
    tailwindText: 'text-emerald-600 dark:text-emerald-400',
    tailwindBg: 'bg-emerald-600',
    tailwindRing: 'ring-emerald-500',
  },
  {
    id: 'orange',
    name: 'Laranja Solar',
    hex: '#ea580c',
    tailwindText: 'text-orange-600 dark:text-orange-400',
    tailwindBg: 'bg-orange-600',
    tailwindRing: 'ring-orange-500',
  },
  {
    id: 'purple',
    name: 'Roxo Violeta',
    hex: '#7c3aed',
    tailwindText: 'text-purple-600 dark:text-purple-400',
    tailwindBg: 'bg-purple-600',
    tailwindRing: 'ring-purple-500',
  },
  {
    id: 'rose',
    name: 'Rosa Vibrante',
    hex: '#e11d48',
    tailwindText: 'text-rose-600 dark:text-rose-400',
    tailwindBg: 'bg-rose-600',
    tailwindRing: 'ring-rose-500',
  },
  {
    id: 'cyan',
    name: 'Ciano Tech',
    hex: '#0891b2',
    tailwindText: 'text-cyan-600 dark:text-cyan-400',
    tailwindBg: 'bg-cyan-600',
    tailwindRing: 'ring-cyan-500',
  },
];

export function useIconColor() {
  const [selectedColorId, setSelectedColorId] = useState<string>(() => {
    const saved = localStorage.getItem('fw_icon_color');
    if (saved && ICON_COLOR_OPTIONS.some((c) => c.id === saved)) {
      return saved;
    }
    return 'indigo';
  });

  const currentColor = ICON_COLOR_OPTIONS.find((c) => c.id === selectedColorId) || ICON_COLOR_OPTIONS[0];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-icon-accent', currentColor.hex);
  }, [currentColor]);

  const setIconColor = (id: string) => {
    if (ICON_COLOR_OPTIONS.some((c) => c.id === id)) {
      setSelectedColorId(id);
      localStorage.setItem('fw_icon_color', id);
    }
  };

  return {
    selectedColorId,
    currentColor,
    availableColors: ICON_COLOR_OPTIONS,
    setIconColor,
  };
}
