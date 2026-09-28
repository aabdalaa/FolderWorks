import { useState, useEffect } from 'react';

export interface IconColorOption {
  id: string;
  name: string;
  hex: string;
  category?: string;
  tailwindText?: string;
  tailwindBg?: string;
  tailwindRing?: string;
}

export const ICON_COLOR_OPTIONS: IconColorOption[] = [
  // Azuis & Cianos
  { id: 'indigo', name: 'Índigo Entropy (Padrão)', hex: '#5b5fc7', category: 'Azuis & Cianos' },
  { id: 'blue', name: 'Azul Safira', hex: '#2563eb', category: 'Azuis & Cianos' },
  { id: 'sky', name: 'Azul Céu', hex: '#0284c7', category: 'Azuis & Cianos' },
  { id: 'cyan', name: 'Ciano Tech', hex: '#0891b2', category: 'Azuis & Cianos' },
  { id: 'navy', name: 'Azul Meia-Noite', hex: '#1e3a8a', category: 'Azuis & Cianos' },

  // Verdes & Petróleo
  { id: 'teal', name: 'Verde Petróleo', hex: '#0d9488', category: 'Verdes' },
  { id: 'emerald', name: 'Verde Esmeralda', hex: '#059669', category: 'Verdes' },
  { id: 'green', name: 'Verde Floresta', hex: '#16a34a', category: 'Verdes' },
  { id: 'lime', name: 'Verde Lima', hex: '#65a30d', category: 'Verdes' },

  // Amarelos & Laranjas
  { id: 'amber', name: 'Dourado Âmbar', hex: '#d97706', category: 'Laranjas & Dourados' },
  { id: 'yellow', name: 'Amarelo Ouro', hex: '#ca8a04', category: 'Laranjas & Dourados' },
  { id: 'orange', name: 'Laranja Solar', hex: '#ea580c', category: 'Laranjas & Dourados' },
  { id: 'rust', name: 'Laranja Terracota', hex: '#c2410c', category: 'Laranjas & Dourados' },
  { id: 'copper', name: 'Cobre Corporativo', hex: '#b45309', category: 'Laranjas & Dourados' },

  // Vermelhos & Rosas
  { id: 'red', name: 'Vermelho Carmim', hex: '#dc2626', category: 'Vermelhos & Rosas' },
  { id: 'ruby', name: 'Vermelho Rubi', hex: '#b91c1c', category: 'Vermelhos & Rosas' },
  { id: 'rose', name: 'Rosa Vibrante', hex: '#e11d48', category: 'Vermelhos & Rosas' },
  { id: 'pink', name: 'Rosa Pink', hex: '#db2777', category: 'Vermelhos & Rosas' },

  // Roxos & Violetas
  { id: 'fuchsia', name: 'Magenta Elétrico', hex: '#c026d3', category: 'Roxos & Violetas' },
  { id: 'purple', name: 'Púrpura Imperial', hex: '#9333ea', category: 'Roxos & Violetas' },
  { id: 'violet', name: 'Violeta Noturno', hex: '#7c3aed', category: 'Roxos & Violetas' },
  { id: 'grape', name: 'Uva Profundo', hex: '#6b21a8', category: 'Roxos & Violetas' },

  // Neutros & Metais
  { id: 'slate', name: 'Ardósia Grafite', hex: '#475569', category: 'Neutros' },
  { id: 'zinc', name: 'Cinza Titânio', hex: '#52525b', category: 'Neutros' },
];

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function mix(c1: Rgb, c2: Rgb, weight: number): Rgb {
  return {
    r: Math.round(c1.r * (1 - weight) + c2.r * weight),
    g: Math.round(c1.g * (1 - weight) + c2.g * weight),
    b: Math.round(c1.b * (1 - weight) + c2.b * weight),
  };
}

export function generateShades(baseHex: string) {
  const base = hexToRgb(baseHex);
  const white: Rgb = { r: 255, g: 255, b: 255 };
  const dark: Rgb = { r: 10, g: 15, b: 25 };

  return {
    50: mix(base, white, 0.92),
    100: mix(base, white, 0.85),
    200: mix(base, white, 0.70),
    300: mix(base, white, 0.50),
    400: mix(base, white, 0.30),
    500: mix(base, white, 0.15),
    600: base,
    700: mix(base, dark, 0.20),
    800: mix(base, dark, 0.40),
    900: mix(base, dark, 0.60),
    950: mix(base, dark, 0.80),
  };
}

export function applyThemeColorToDocument(hex: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const shades = generateShades(hex);

  root.style.setProperty('--color-teams-50-rgb', `${shades[50].r} ${shades[50].g} ${shades[50].b}`);
  root.style.setProperty('--color-teams-100-rgb', `${shades[100].r} ${shades[100].g} ${shades[100].b}`);
  root.style.setProperty('--color-teams-200-rgb', `${shades[200].r} ${shades[200].g} ${shades[200].b}`);
  root.style.setProperty('--color-teams-300-rgb', `${shades[300].r} ${shades[300].g} ${shades[300].b}`);
  root.style.setProperty('--color-teams-400-rgb', `${shades[400].r} ${shades[400].g} ${shades[400].b}`);
  root.style.setProperty('--color-teams-500-rgb', `${shades[500].r} ${shades[500].g} ${shades[500].b}`);
  root.style.setProperty('--color-teams-600-rgb', `${shades[600].r} ${shades[600].g} ${shades[600].b}`);
  root.style.setProperty('--color-teams-700-rgb', `${shades[700].r} ${shades[700].g} ${shades[700].b}`);
  root.style.setProperty('--color-teams-800-rgb', `${shades[800].r} ${shades[800].g} ${shades[800].b}`);
  root.style.setProperty('--color-teams-900-rgb', `${shades[900].r} ${shades[900].g} ${shades[900].b}`);
  root.style.setProperty('--color-teams-950-rgb', `${shades[950].r} ${shades[950].g} ${shades[950].b}`);

  root.style.setProperty('--app-icon-accent', hex);
}

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
    applyThemeColorToDocument(currentColor.hex);
  }, [currentColor]);

  const setIconColor = (id: string) => {
    const target = ICON_COLOR_OPTIONS.find((c) => c.id === id);
    if (target) {
      setSelectedColorId(id);
      localStorage.setItem('fw_icon_color', id);
      applyThemeColorToDocument(target.hex);
    }
  };

  return {
    selectedColorId,
    currentColor,
    availableColors: ICON_COLOR_OPTIONS,
    setIconColor,
  };
}
