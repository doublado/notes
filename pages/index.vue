<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const router = useRouter()

const navigateToAuth = (tab: 'signin' | 'signup' = 'signin') => {
  router.push(`/auth?tab=${tab}`)
}

// Video modal for demo purposes
const showVideoModal = ref(false)
const youtubeVideoId = ref('dQw4w9WgXcQ')

// Dynamic copyright year
const currentYear = new Date().getFullYear()

// FAQ data for accordion
const accordionItems = ref([
  {
    header: 'How do I get started?',
    content: 'Simply click "Start Writing Now" and register an account. You can start organizing your thoughts immediately.',
    icon: 'pi pi-play'
  },
  {
    header: 'Can I share my notes with others?',
    content: 'Yes! You can share individual notes with specific people using their email, or make them public for anyone to view and collaborate on.',
    icon: 'pi pi-share-alt'
  },
  {
    header: 'Is my data secure?',
    content: 'Your private notes are protected with user authentication. Only you can access your personal notes unless you choose to share them.',
    icon: 'pi pi-shield'
  },
  {
    header: 'Can I access my notes from anywhere?',
    content: 'Absolutely! NikJak Notes is web-based, so you can access your notes from any device with a web browser - no downloads required.',
    icon: 'pi pi-globe'
  }
])

// Marketing stats to build trust
const stats = ref([
  { number: '100%', label: 'Free', icon: 'pi pi-gift' },
  { number: '∞', label: 'Notes', icon: 'pi pi-pen-to-square' },
  { number: '24/7', label: 'Access', icon: 'pi pi-clock' },
  { number: '0', label: 'Ads', icon: 'pi pi-ban' }
])
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative overflow-hidden surface-section">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-flex items-center px-4 py-2 bg-primary-alpha-10 text-primary rounded-full text-sm font-medium mb-6">
              <i class="pi pi-star mr-2" />
              Free Forever - No Hidden Costs
            </div>
            <h1 class="text-5xl md:text-6xl font-bold text-color mb-6 leading-tight">
              Your Ideas,
              <span class="text-primary block">Organized</span>
            </h1>
            <p class="text-xl text-color-secondary mb-8 leading-relaxed">
              Capture thoughts, share knowledge, and collaborate seamlessly. 
              A simple, powerful notes platform built for students and creators alike.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <Button 
                label="Start Writing Now" 
                size="large"
                class="px-8 py-4 text-lg font-semibold"
                @click="navigateToAuth('signup')"
              >
                <template #icon>
                  <i class="pi pi-pencil mr-2" />
                </template>
              </Button>
              <Button 
                label="See How It Works" 
                severity="secondary" 
                outlined
                size="large"
                class="px-8 py-4 text-lg"
                @click="showVideoModal = true"
              >
                <template #icon>
                  <i class="pi pi-play mr-2" />
                </template>
              </Button>
            </div>
          </div>
          <div class="relative">
            <Card class="border-0 shadow-4">
              <template #content>
                <div class="p-8">
                  <div class="flex items-center mb-6">
                    <div class="w-3 h-3 bg-red-500 rounded-full mr-2" />
                    <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                    <div class="w-3 h-3 bg-green-500 rounded-full mr-4" />
                    <div class="text-color-secondary text-sm">notes.nikjak.com</div>
                  </div>
                  <div class="space-y-4">
                    <div class="h-4 bg-gray-200 rounded w-3/4" />
                    <div class="h-4 bg-gray-200 rounded w-1/2" />
                    <div class="h-4 bg-gray-200 rounded w-5/6" />
                    <div class="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </template>
            </Card>
            <!-- Floating elements -->
            <div class="absolute -top-4 -right-4 w-8 h-8 bg-primary-alpha-20 rounded-full" />
            <div class="absolute -bottom-4 -left-4 w-6 h-6 bg-secondary-alpha-20 rounded-full" />
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 surface-ground">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="w-16 h-16 bg-primary-alpha-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i :class="`${stat.icon} text-3xl text-primary`" />
            </div>
            <div class="text-3xl font-bold text-color mb-2">{{ stat.number }}</div>
            <div class="text-color-secondary">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 surface-section">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-color mb-4">
            Everything You Need
          </h2>
          <p class="text-xl text-color-secondary max-w-2xl mx-auto">
            Powerful features that make note-taking simple and collaborative.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card class="border-0 shadow-2 hover:shadow-4 transition-all duration-300 hover:-translate-y-1">
            <template #content>
              <div class="p-6">
                <div class="w-12 h-12 bg-primary-alpha-10 rounded-lg flex items-center justify-center mb-4">
                  <i class="pi pi-lock text-xl text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-color mb-3">Private & Secure</h3>
                <p class="text-color-secondary">
                  Your personal notes stay private with secure authentication. Share only what you want to share.
                </p>
              </div>
            </template>
          </Card>

          <Card class="border-0 shadow-2 hover:shadow-4 transition-all duration-300 hover:-translate-y-1">
            <template #content>
              <div class="p-6">
                <div class="w-12 h-12 bg-primary-alpha-10 rounded-lg flex items-center justify-center mb-4">
                  <i class="pi pi-users text-xl text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-color mb-3">Collaborate</h3>
                <p class="text-color-secondary">
                  Share notes with classmates, study groups, or make them public for the community.
                </p>
              </div>
            </template>
          </Card>

          <Card class="border-0 shadow-2 hover:shadow-4 transition-all duration-300 hover:-translate-y-1">
            <template #content>
              <div class="p-6">
                <div class="w-12 h-12 bg-primary-alpha-10 rounded-lg flex items-center justify-center mb-4">
                  <i class="pi pi-tags text-xl text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-color mb-3">Organize</h3>
                <p class="text-color-secondary">
                  Use tags, categories, and search to find your notes instantly. Keep everything organized.
                </p>
              </div>
            </template>
          </Card>

          <Card class="border-0 shadow-2 hover:shadow-4 transition-all duration-300 hover:-translate-y-1">
            <template #content>
              <div class="p-6">
                <div class="w-12 h-12 bg-primary-alpha-10 rounded-lg flex items-center justify-center mb-4">
                  <i class="pi pi-mobile text-xl text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-color mb-3">Responsive</h3>
                <p class="text-color-secondary">
                  Works perfectly on desktop, tablet, and mobile. Access your notes from any device.
                </p>
              </div>
            </template>
          </Card>

          <Card class="border-0 shadow-2 hover:shadow-4 transition-all duration-300 hover:-translate-y-1">
            <template #content>
              <div class="p-6">
                <div class="w-12 h-12 bg-primary-alpha-10 rounded-lg flex items-center justify-center mb-4">
                  <i class="pi pi-bolt text-xl text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-color mb-3">Fast & Simple</h3>
                <p class="text-color-secondary">
                  Clean, distraction-free interface. Focus on your content, not the tool.
                </p>
              </div>
            </template>
          </Card>

          <Card class="border-0 shadow-2 hover:shadow-4 transition-all duration-300 hover:-translate-y-1">
            <template #content>
              <div class="p-6">
                <div class="w-12 h-12 bg-primary-alpha-10 rounded-lg flex items-center justify-center mb-4">
                  <i class="pi pi-cloud text-xl text-primary" />
                </div>
                <h3 class="text-xl font-semibold text-color mb-3">Always Available</h3>
                <p class="text-color-secondary">
                  Cloud-based storage means your notes are always backed up and accessible.
                </p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- FAQ Section with Accordion -->
    <section class="py-20 surface-ground">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-color mb-4">
            Frequently Asked Questions
          </h2>
          <p class="text-xl text-color-secondary">
            Everything you need to know about NikJak Notes.
          </p>
        </div>

        <Accordion class="shadow-2">
          <AccordionPanel v-for="(item, index) in accordionItems" :key="item.header" :value="index">
            <AccordionHeader>
              <div class="flex items-center">
                <i :class="item.icon" class="text-primary mr-3" />
                <span>{{ item.header }}</span>
              </div>
            </AccordionHeader>
            <AccordionContent>
              <p class="m-0 text-color-secondary leading-relaxed">{{ item.content }}</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 surface-primary">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl font-bold text-primary-color mb-4">
          Ready to Get Started?
        </h2>
        <p class="text-xl text-primary-color-secondary mb-8">
          Join other students and creators who are already organizing their thoughts with NikJak Notes.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            label="Start Writing Now" 
            size="large"
            class="px-8 py-4 text-lg font-semibold"
            @click="navigateToAuth('signup')"
          >
            <template #icon>
              <i class="pi pi-pencil mr-2" />
            </template>
          </Button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <Divider class="my-0" />
    <footer class="surface-ground py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center">
          <p class="text-color-secondary text-sm mb-4 sm:mb-0">&copy; {{ currentYear }} NikJak Notes. All rights reserved.</p>
          <div class="flex items-center space-x-4">
            <a href="/privacy-policy" class="text-sm text-color-secondary hover:text-color transition-colors">Privacy Policy</a>
            <Divider layout="vertical" class="hidden sm:flex" />
            <a href="/terms-of-service" class="text-sm text-color-secondary hover:text-color transition-colors">Terms of Service</a>
            <Divider layout="vertical" class="hidden sm:flex" />
            <a href="/contact" class="text-sm text-color-secondary hover:text-color transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Video Modal -->
    <Dialog 
      v-model:visible="showVideoModal" 
      modal 
      :style="{ width: '90vw', maxWidth: '800px' }"
      :closable="true"
      :dismissable-mask="true"
      class="video-modal"
    >
      <template #header>
        <div class="flex items-center">
          <i class="pi pi-play-circle text-primary mr-2" />
          <span class="text-lg font-semibold">How NikJak Notes Works</span>
        </div>
      </template>
      
      <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe
          v-if="showVideoModal"
          :src="`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`"
          class="absolute top-0 left-0 w-full h-full rounded-lg"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </Dialog>
  </div>
</template>
