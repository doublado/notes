<script setup lang="ts">
const themeStore = useThemeStore()

// Dynamic icon based on current theme for better UX
const themeIcon = computed(() => {
  return themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'
})

// Initialize theme system and watch for system preference changes
onMounted(() => {
  themeStore.initTheme()
  
  const cleanup = themeStore.watchSystemPreference()
  
  onUnmounted(() => {
    cleanup()
  })
})

const router = useRouter()

const navigateToAuth = (tab: 'signin' | 'signup' = 'signin') => {
  router.push(`/auth?tab=${tab}`)
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
            <!-- ClientOnly prevents hydration mismatch with theme toggle -->
            <ClientOnly>
              <Button 
                :icon="themeIcon"
                severity="secondary" 
                text
                :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                @click="themeStore.toggleTheme"
              />
            </ClientOnly>
            <Button 
              label="Sign In" 
              severity="secondary" 
              text 
              class="hidden sm:block"
              @click="navigateToAuth('signin')"
            />
            <Button 
              label="Sign Up"
              @click="navigateToAuth('signup')"
            />
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <slot />
  </div>
</template>
