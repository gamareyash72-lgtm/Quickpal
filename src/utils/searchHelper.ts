import { Product, Category } from '../types';

/**
 * Normalizes a string for search matching:
 * - Lowercases
 * - Strips diacritics / accents
 * - Normalizes apostrophes (' ’ `) so "lay's" becomes "lays"
 * - Replaces hyphens, underscores, slashes, and periods with spaces so "coca-cola" becomes "coca cola"
 * - Collapses multiple whitespace characters
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"`’]/g, '')
    .replace(/[-_.,/()&:+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common synonym / alias mappings for Indian grocery items in Saphale
 */
const COMMON_ALIASES: Record<string, string[]> = {
  lays: ['chips', 'potato chips', 'magic masala', 'namkeen'],
  lay: ['lays', 'chips', 'potato chips'],
  coke: ['coca-cola', 'cola', 'cold drinks', 'soda'],
  cola: ['coca-cola', 'coke', 'cold drink'],
  pepsi: ['cold drink', 'soda', 'coca-cola'],
  milk: ['dairy', 'taaza', 'amul', 'doodh'],
  doodh: ['milk', 'amul'],
  curd: ['dahi', 'yogurt', 'dairy'],
  dahi: ['curd', 'dairy'],
  butter: ['amul', 'dairy', 'makhan'],
  makhan: ['butter'],
  egg: ['eggs', 'anda'],
  eggs: ['egg', 'anda'],
  anda: ['egg', 'eggs'],
  bread: ['toast', 'sandwich', 'bakery', 'harvest'],
  tomato: ['tomatoes', 'tamatar', 'veg'],
  tomatoes: ['tomato', 'tamatar', 'veg'],
  tamatar: ['tomato', 'tomatoes'],
  apple: ['apples', 'seb', 'fruits'],
  apples: ['apple', 'seb', 'fruits'],
  potato: ['potatoes', 'aloo', 'chips'],
  potatoes: ['potato', 'aloo', 'chips'],
  aloo: ['potato', 'potatoes'],
  candy: ['candies', 'gums', 'toffee', 'sweet', 'chupa chups'],
  candies: ['candy', 'toffee', 'sweets', 'gums'],
  gum: ['gums', 'chewing gum', 'happydent', 'mint'],
  gums: ['gum', 'chewing gum', 'happydent'],
  sweets: ['mithai', 'ladoo', 'kaju katli', 'sweet'],
  sweet: ['sweets', 'mithai', 'ladoo', 'kaju katli', 'chocolate'],
  mithai: ['sweets', 'ladoo', 'kaju katli'],
  veggie: ['vegetables', 'veggies', 'sabzi', 'fruits'],
  veggies: ['vegetables', 'veggie', 'sabzi'],
  sabzi: ['vegetables', 'veggies'],
  vegan: ['plant based', 'pure veg', 'dairy free'],
  organic: ['farm fresh', 'certified organic', 'natural', 'pure'],
  gluten: ['gluten free', 'wheat free'],
  sugarfree: ['sugar free', 'zero sugar', 'no added sugar'],
};

/**
 * Checks whether a single token matches a target text,
 * considering prefix, stem (singular/plural), and aliases.
 */
function tokenMatches(targetText: string, token: string): boolean {
  if (!token || !targetText) return false;

  // Direct substring match
  if (targetText.includes(token)) return true;

  // Plural/singular stem check (e.g. eggs -> egg, chips -> chip, candies -> candy)
  if (token.endsWith('s') && targetText.includes(token.slice(0, -1))) {
    return true;
  }
  if (token.endsWith('es') && targetText.includes(token.slice(0, -2))) {
    return true;
  }
  if (token.endsWith('ies') && targetText.includes(token.slice(0, -3) + 'y')) {
    return true;
  }

  // Target word stems: target has 's' and token doesn't
  if (targetText.split(' ').some(w => w.startsWith(token) || (w.endsWith('s') && w.slice(0, -1) === token))) {
    return true;
  }

  // Synonym check
  const aliases = COMMON_ALIASES[token];
  if (aliases && aliases.some(alias => targetText.includes(alias))) {
    return true;
  }

  return false;
}

/**
 * Matches a product against a search query
 */
export function matchProductWithQuery(
  product: Product,
  searchQuery: string,
  categories: Category[] = []
): boolean {
  if (!product || product.isHidden) return false;
  const rawQuery = searchQuery.trim();
  if (!rawQuery) return true;

  const normalizedQuery = normalizeSearchText(rawQuery);
  if (!normalizedQuery) return true;

  // Build full searchable text representation of the product
  const catObj = categories.find(c => c.id === product.category);
  const catName = catObj ? catObj.name : '';

  const searchableFields = [
    product.name,
    product.description || '',
    product.category,
    catName,
    product.weightUnit || '',
    product.isFeatured ? 'featured best seller popular' : '',
    Array.isArray(product.dietaryTags) ? product.dietaryTags.join(' ') : '',
  ];

  const fullNormalizedProductText = normalizeSearchText(searchableFields.join(' '));

  // 1. Exact or contiguous phrase match (e.g. "amul milk", "kaju katli", "sour bites")
  if (fullNormalizedProductText.includes(normalizedQuery)) {
    return true;
  }

  // 2. Tokenized match: every word in the query must match something in the product text or synonyms
  const queryTokens = normalizedQuery.split(' ').filter(t => t.length > 0);
  if (queryTokens.length === 0) return true;

  const allTokensMatch = queryTokens.every(token => tokenMatches(fullNormalizedProductText, token));
  if (allTokensMatch) {
    return true;
  }

  // 3. Reverse alias check: if the product text contains any alias of the query
  for (const token of queryTokens) {
    const aliases = COMMON_ALIASES[token];
    if (aliases) {
      for (const alias of aliases) {
        if (fullNormalizedProductText.includes(alias)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Matches a category against a search query
 */
export function matchCategoryWithQuery(category: Category, searchQuery: string): boolean {
  if (!category || !category.name) return false;
  const rawQuery = searchQuery.trim();
  if (!rawQuery) return true;

  const normalizedQuery = normalizeSearchText(rawQuery);
  const catText = normalizeSearchText(`${category.name} ${category.id}`);

  if (catText.includes(normalizedQuery)) return true;

  const queryTokens = normalizedQuery.split(' ').filter(t => t.length > 0);
  return queryTokens.every(token => tokenMatches(catText, token));
}

/**
 * Ranks matched products so exact name matches appear first
 */
export function filterAndRankProducts(
  products: Product[],
  searchQuery: string,
  categories: Category[] = []
): Product[] {
  const query = searchQuery.trim();
  if (!query) {
    return products.filter(p => !p.isHidden);
  }

  const normalizedQuery = normalizeSearchText(query);

  const matched = products.filter(p => matchProductWithQuery(p, query, categories));

  return matched.sort((a, b) => {
    const normA = normalizeSearchText(a.name);
    const normB = normalizeSearchText(b.name);

    // Exact name match first
    if (normA === normalizedQuery && normB !== normalizedQuery) return -1;
    if (normB === normalizedQuery && normA !== normalizedQuery) return 1;

    // Starts with query
    if (normA.startsWith(normalizedQuery) && !normB.startsWith(normalizedQuery)) return -1;
    if (normB.startsWith(normalizedQuery) && !normA.startsWith(normalizedQuery)) return 1;

    // Name contains query
    const aContains = normA.includes(normalizedQuery);
    const bContains = normB.includes(normalizedQuery);
    if (aContains && !bContains) return -1;
    if (bContains && !aContains) return 1;

    // Featured items prioritized
    if (a.isFeatured && !b.isFeatured) return -1;
    if (b.isFeatured && !a.isFeatured) return 1;

    return 0;
  });
}
