<script setup lang="ts">
const themeStore = useThemeStore()

// Initialize theme on mount
onMounted(() => {
  themeStore.initTheme()
  
  // Watch for system preference changes
  const cleanup = themeStore.watchSystemPreference()
  
  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })
})

const router = useRouter()

const navigateToDashboard = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div>
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 border-b-1 surface-border backdrop-blur-md bg-surface-0/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <NuxtLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <i class="pi pi-book text-2xl text-primary" />
              <span class="text-xl font-bold text-color">NikJak Notes</span>
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle Button -->
            <Button 
              :icon="themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'"
              severity="secondary" 
              text
              :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              @click="themeStore.toggleTheme"
            />
            <Button 
              label="Sign In" 
              severity="secondary" 
              text 
              class="hidden sm:block"
              @click="navigateToDashboard"
            />
            <Button 
              label="Get Started"
              @click="navigateToDashboard"
            />
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <slot />
  </div>
</template>
