import type { FurnitureCatalogItem, FurnitureType } from '../types';

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // Bathroom
  { type: 'bathtub', name: 'Bathtub', category: 'bathroom', defaultWidth: 1.7, defaultDepth: 0.75, defaultHeight: 0.55, icon: 'Bath' },
  { type: 'shower', name: 'Shower Unit', category: 'bathroom', defaultWidth: 0.9, defaultDepth: 0.9, defaultHeight: 2.1, icon: 'Shwr' },
  { type: 'toilet', name: 'Toilet', category: 'bathroom', defaultWidth: 0.4, defaultDepth: 0.65, defaultHeight: 0.4, icon: 'WC' },
  { type: 'bathroom-sink', name: 'Basin', category: 'bathroom', defaultWidth: 0.5, defaultDepth: 0.4, defaultHeight: 0.85, icon: 'Sink' },
  { type: 'mirror-plain', name: 'Mirror', category: 'bathroom', defaultWidth: 0.6, defaultDepth: 0.04, defaultHeight: 0.8, icon: 'Mirr' },
  { type: 'mirror-led', name: 'LED Mirror', category: 'bathroom', defaultWidth: 0.7, defaultDepth: 0.06, defaultHeight: 0.9, icon: 'LED' },

  // Kitchen
  { type: 'kitchen-sink', name: 'Kitchen Sink', category: 'kitchen', defaultWidth: 0.6, defaultDepth: 0.6, defaultHeight: 0.9, icon: 'Sink' },
  { type: 'countertop', name: 'Countertop', category: 'kitchen', defaultWidth: 1.2, defaultDepth: 0.6, defaultHeight: 0.9, icon: 'Cntr' },
  { type: 'stove', name: 'Stove/Hob', category: 'kitchen', defaultWidth: 0.6, defaultDepth: 0.6, defaultHeight: 0.9, icon: 'Stov' },
  { type: 'oven', name: 'Oven', category: 'kitchen', defaultWidth: 0.6, defaultDepth: 0.6, defaultHeight: 0.6, icon: 'Oven' },
  { type: 'microwave', name: 'Microwave', category: 'kitchen', defaultWidth: 0.5, defaultDepth: 0.35, defaultHeight: 0.3, icon: 'MW' },
  { type: 'fridge', name: 'Fridge', category: 'kitchen', defaultWidth: 0.6, defaultDepth: 0.65, defaultHeight: 1.8, icon: 'Frdg' },
  { type: 'dishwasher', name: 'Dishwasher', category: 'kitchen', defaultWidth: 0.6, defaultDepth: 0.6, defaultHeight: 0.85, icon: 'DW' },
  { type: 'extractor-hood', name: 'Extractor Hood', category: 'kitchen', defaultWidth: 0.6, defaultDepth: 0.4, defaultHeight: 0.2, icon: 'Hood' },

  // Living
  { type: 'sofa', name: 'Sofa', category: 'living', defaultWidth: 2.0, defaultDepth: 0.85, defaultHeight: 0.8, icon: 'Sofa' },
  { type: 'armchair', name: 'Armchair', category: 'living', defaultWidth: 0.8, defaultDepth: 0.8, defaultHeight: 0.8, icon: 'Chair' },
  { type: 'coffee-table', name: 'Coffee Table', category: 'living', defaultWidth: 1.0, defaultDepth: 0.5, defaultHeight: 0.45, icon: 'Tbl' },
  { type: 'tv-unit', name: 'TV Unit', category: 'living', defaultWidth: 1.5, defaultDepth: 0.4, defaultHeight: 0.5, icon: 'TV' },
  { type: 'bookshelf', name: 'Bookshelf', category: 'living', defaultWidth: 0.8, defaultDepth: 0.3, defaultHeight: 1.8, icon: 'Book' },
  { type: 'rug', name: 'Rug', category: 'living', defaultWidth: 2.0, defaultDepth: 1.4, defaultHeight: 0.01, icon: 'Rug' },
  { type: 'plant-pot', name: 'Plant Pot', category: 'living', defaultWidth: 0.3, defaultDepth: 0.3, defaultHeight: 0.8, icon: 'Plnt' },

  // Bedroom
  { type: 'bed-single', name: 'Single Bed', category: 'bedroom', defaultWidth: 0.9, defaultDepth: 1.9, defaultHeight: 0.5, icon: 'Bed' },
  { type: 'bed-double', name: 'Double Bed', category: 'bedroom', defaultWidth: 1.5, defaultDepth: 2.0, defaultHeight: 0.5, icon: 'Bed' },
  { type: 'wardrobe', name: 'Wardrobe', category: 'bedroom', defaultWidth: 1.2, defaultDepth: 0.6, defaultHeight: 2.0, icon: 'Wrdb' },
  { type: 'nightstand', name: 'Nightstand', category: 'bedroom', defaultWidth: 0.45, defaultDepth: 0.4, defaultHeight: 0.55, icon: 'NS' },
  { type: 'desk', name: 'Desk', category: 'bedroom', defaultWidth: 1.2, defaultDepth: 0.6, defaultHeight: 0.75, icon: 'Desk' },
  { type: 'dresser', name: 'Dresser', category: 'bedroom', defaultWidth: 1.0, defaultDepth: 0.5, defaultHeight: 0.8, icon: 'Drsr' },

  // Dining
  { type: 'dining-table', name: 'Dining Table', category: 'dining', defaultWidth: 1.4, defaultDepth: 0.8, defaultHeight: 0.75, icon: 'Tbl' },
  { type: 'dining-chair', name: 'Dining Chair', category: 'dining', defaultWidth: 0.45, defaultDepth: 0.45, defaultHeight: 0.9, icon: 'Chr' },

  // Lighting
  { type: 'pendant-light', name: 'Pendant Light', category: 'lighting', defaultWidth: 0.35, defaultDepth: 0.35, defaultHeight: 0.3, icon: 'Pend' },
  { type: 'downlight-single', name: 'Downlight', category: 'lighting', defaultWidth: 0.12, defaultDepth: 0.12, defaultHeight: 0.08, icon: 'DnL' },
  { type: 'downlight-triple', name: '3x Downlights', category: 'lighting', defaultWidth: 1.2, defaultDepth: 0.12, defaultHeight: 0.08, icon: '3xDL' },
  { type: 'wall-uplight', name: 'Wall Uplight', category: 'lighting', defaultWidth: 0.2, defaultDepth: 0.1, defaultHeight: 0.15, icon: 'WUp' },
  { type: 'wall-downlight', name: 'Wall Downlight', category: 'lighting', defaultWidth: 0.2, defaultDepth: 0.1, defaultHeight: 0.15, icon: 'WDn' },
  { type: 'floor-lamp', name: 'Floor Lamp', category: 'lighting', defaultWidth: 0.3, defaultDepth: 0.3, defaultHeight: 1.6, icon: 'FLmp' },
  { type: 'table-lamp', name: 'Table Lamp', category: 'lighting', defaultWidth: 0.2, defaultDepth: 0.2, defaultHeight: 0.45, icon: 'TLmp' },

  // Stairs
  { type: 'staircase-straight', name: 'Straight Staircase', category: 'stairs', defaultWidth: 1.0, defaultDepth: 3.0, defaultHeight: 2.7, icon: 'Str' },
  { type: 'staircase-spiral', name: 'Spiral Staircase', category: 'stairs', defaultWidth: 1.8, defaultDepth: 1.8, defaultHeight: 2.7, icon: 'Spr' },
];

export function getCatalogItem(type: FurnitureType): FurnitureCatalogItem {
  return FURNITURE_CATALOG.find(f => f.type === type) || {
    type, name: type, category: 'living',
    defaultWidth: 0.5, defaultDepth: 0.5, defaultHeight: 0.5, icon: '?',
  };
}

export const FURNITURE_CATEGORIES = ['bathroom', 'kitchen', 'living', 'bedroom', 'dining', 'lighting', 'stairs'] as const;
