import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    /**
     * Represents the user's explicit theme choice.
     * `null`: follow system preference.
     * `true`: dark mode.
     * `false`: light mode.
     */
    const userPreference = ref<boolean | null>(null)

    /**
     * A computed property that determines if the dark theme should be active.
     * It prioritizes the user's preference, falling back to the system setting.
     */
    const isDark = computed(() => {
      if (userPreference.value !== null) {
        return userPreference.value
      }
      if (import.meta.server) {
        return false // Default to light theme on server
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    /**
     * Applies the theme to the DOM by adding or removing the '.dark' class.
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
     * Initializes the theme on the client side.
     */
    function initTheme() {
      if (import.meta.client) {
        _applyTheme(isDark.value)
      }
    }

    /**
     * Toggles the theme and sets the user's preference.
     */
    function toggleTheme() {
      if (import.meta.client) {
        userPreference.value = !isDark.value
        _applyTheme(userPreference.value)
      }
    }

    /**
     * Watches for system preference changes and updates the theme if needed.
     * @returns A cleanup function to remove the event listener.
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
