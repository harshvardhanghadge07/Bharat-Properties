import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, favoriteApi } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Email/password login
      login: async (credentials) => {
        const { user, token } = await authApi.login(credentials)
        localStorage.setItem('bp_token', token)
        set({ user, token, isAuthenticated: true })
        return user
      },

      register: async (data) => {
        const res = await authApi.register(data)
        if (res.token) {
          localStorage.setItem('bp_token', res.token)
          set({ user: res.user, token: res.token, isAuthenticated: true })
        }
        return res
      },

      logout: () => {
        localStorage.removeItem('bp_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      fetchMe: async () => {
        try {
          const user = await authApi.me()
          set({ user, isAuthenticated: true })
        } catch {
          get().logout()
        }
      },

      isFavorite: (propertyId) => {
        const favs = get().user?.favorites || []
        return favs.some((f) => (f.id || f) === propertyId)
      },

      // Optimistically toggle a property's favorited state and sync with the server
      toggleFavorite: async (propertyId) => {
        const user = get().user
        if (!user) return
        const wasFavorite = get().isFavorite(propertyId)
        const prevFavorites = user.favorites || []

        // Optimistic update
        set({
          user: {
            ...user,
            favorites: wasFavorite
              ? prevFavorites.filter((f) => (f.id || f) !== propertyId)
              : [...prevFavorites, propertyId],
          },
        })

        try {
          const { favorites } = wasFavorite
            ? await favoriteApi.remove(propertyId)
            : await favoriteApi.add(propertyId)
          set({ user: { ...get().user, favorites } })
        } catch (err) {
          // Roll back on failure
          set({ user: { ...get().user, favorites: prevFavorites } })
          throw err
        }
      },
    }),
    { name: 'bp-auth', partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: !!s.token }) }
  )
)
