import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'
export const api = axios.create({ baseURL: BASE_URL })

export interface Category {
  id: number; name: string; slug: string; description: string | null; imageUrl: string | null
  subCategories: SubCategory[]
  _count: { subCategories: number }
}

export interface SubCategory {
  id: number; name: string; slug: string; imageUrl: string | null
  _count?: { items: number }
}

export interface Item {
  id: number; name: string; slug: string; description: string | null
  imageUrl: string | null; releaseYear: number | null; price: string | null
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  isLimited: boolean; officialLink: string | null
  subCategory: { id: number; name: string; slug: string; category: { id: number; name: string; slug: string } }
  tags: { id: number; name: string }[]
}

export interface ItemsResponse {
  data: Item[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface ItemFilters {
  category?: string; subCategory?: string; search?: string
  rarity?: string; isLimited?: boolean
  sortBy?: string; sortOrder?: string
  page?: number; limit?: number
}

export const getCategories = () => api.get<Category[]>('/categories').then(r => r.data)

export const getCategoryBySlug = (slug: string) =>
  api.get<Category>(`/categories/${slug}`).then(r => r.data)

export const getItems = (filters: ItemFilters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => v !== undefined && v !== '' && params.set(k, String(v)))
  return api.get<ItemsResponse>(`/items?${params}`).then(r => r.data)
}

export const getItemBySlug = (slug: string) =>
  api.get<Item>(`/items/${slug}`).then(r => r.data)
