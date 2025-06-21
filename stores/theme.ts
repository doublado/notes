import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    /**
     * User's explicit theme choice - null means follow system preference
     */
    const userPreference = ref<boolean | null>(null)

    /**
     * Determines active theme by prioritizing user choice over system preference
     */
    const isDark = computed(() => {
      if (userPreference.value !== null) {
        return userPreference.value
      }
      if (import.meta.server) {
        return false // Server-side rendering default
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    /**
     * Applies theme to DOM - only runs on client to avoid SSR issues
     */
    function _applyTheme(dark: boolean) {
      if (import.meta.server) return
      const html = document.documentElement
      if (dark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }

    /**
     * Initializes theme on client mount
     */
    function initTheme() {
      if (import.meta.client) {
        _applyTheme(isDark.value)
      }
    }

    /**
     * Toggles theme and persists user preference
     */
    function toggleTheme() {
      if (import.meta.client) {
        userPreference.value = !isDark.value
        _applyTheme(userPreference.value)
      }
    }

    /**
     * Watches system preference changes when user hasn't set explicit preference
     */
    function watchSystemPreference() {
      if (import.meta.server) {
        return () => {}
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        if (userPreference.value === null) {
          _applyTheme(e.matches)
        }
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }

    return {
      userPreference,
      isDark,
      initTheme,
      toggleTheme,
      watchSystemPreference,
    }
  }, {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  }
)
