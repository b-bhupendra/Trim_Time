import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 'haircut-classic',
    name: 'Classic Haircut',
    description: 'A precision haircut tailored to your style, finished with a straight razor neck shave.',
    price: 30,
    duration: 30,
    category: 'Haircut',
  },
  {
    id: 'beard-trim',
    name: 'Beard Trim & Shape',
    description: 'Expert beard grooming, including shaping, trimming, and a hot towel finish.',
    price: 20,
    duration: 20,
    category: 'Beard',
  },
  {
    id: 'luxury-shave',
    name: 'Luxury Hot Towel Shave',
    description: 'Traditional straight razor shave with multiple hot towels and premium oils.',
    price: 40,
    duration: 45,
    category: 'Shave',
  },
  {
    id: 'hair-beard-combo',
    name: 'Haircut & Beard Combo',
    description: 'The ultimate grooming package. Full haircut and expert beard styling.',
    price: 45,
    duration: 60,
    category: 'Combo',
  },
];

export const BUSINESS_HOURS = {
  start: '09:00',
  end: '20:00',
};

export const CATEGORIES = ['Haircut', 'Beard', 'Shave', 'Combo'];
