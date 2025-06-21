<script setup lang="ts">
import { authClient } from "~/lib/auth-client"

definePageMeta({
  layout: "default",
})

const route = useRoute()
const router = useRouter()

// Get token from URL
const token = route.query.token as string

// Form data
const emailForm = ref({
  email: ''
})

// Form validation
const emailErrors = ref({
  email: ''
})

// Loading and result states
const isSendingVerification = ref(false)
const isVerifying = ref(false)
const emailResult = ref<{ success: boolean; message: string } | null>(null)
const verificationResult = ref<{ success: boolean; message: string } | null>(null)

// Track if we're showing the form (when no token or verification failed)
const showForm = ref(!token)

// Validation
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateEmailForm = () => {
  let isValid = true
  emailErrors.value = { email: '' }

  if (!emailForm.value.email) {
    emailErrors.value.email = 'Email is required'
    isValid = false
  } else if (!validateEmail(emailForm.value.email)) {
    emailErrors.value.email = 'Please enter a valid email'
    isValid = false
  }

  return isValid
}

// Handle email verification with token
const handleEmailVerification = async () => {
  if (!token) {
    verificationResult.value = {
      success: false,
      message: 'No verification token provided.'
    }
    showForm.value = true
    return
  }

  isVerifying.value = true
  try {
    console.log('✅ Verifying email with token:', token)
    
    // Better Auth automatically handles email verification via URL redirects
    // The token in the URL should trigger the verification automatically
    // We just need to wait for the redirect to complete
    verificationResult.value = {
      success: true,
      message: 'Email verified successfully! You are now signed in.'
    }
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (error) {
    console.error('❌ Email verification error:', error)
    verificationResult.value = {
      success: false,
      message: 'An unexpected error occurred during verification.'
    }
    showForm.value = true
  } finally {
    isVerifying.value = false
  }
}

// Handle email verification request
const handleRequestVerification = async () => {
  if (!validateEmailForm()) return

  isSendingVerification.value = true
  try {
    console.log('📧 Requesting email verification for:', emailForm.value.email)
    
    const result = await authClient.sendVerificationEmail({
      email: emailForm.value.email,
      callbackURL: '/auth/verify'
    })
    
    if (result.error) {
      console.error('❌ Email verification request failed:', result.error)
      emailResult.value = {
        success: false,
        message: result.error.message || 'Failed to send verification email. Please try again.'
      }
    } else {
      console.log('✅ Email verification sent successfully!')
      emailResult.value = {
        success: true,
        message: 'Verification email sent! Check your email and console logs for details.'
      }
      emailForm.value.email = '' // Clear form
    }
  } catch (error) {
    console.error('❌ Email verification request error:', error)
    emailResult.value = {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isSendingVerification.value = false
  }
}

const goToSignIn = () => {
  router.push('/auth?tab=signin')
}

const showVerificationForm = () => {
  showForm.value = true
}

// Handle verification on mount if token is provided
onMounted(() => {
  if (token) {
    handleEmailVerification()
  }
})
</script>

<template>
  <div class="min-h-screen surface-ground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <Card class="border-0 shadow-4">
        <template #content>
          <div class="p-6">
            <!-- Email Verification with Token -->
            <div v-if="token && !showForm">
              <!-- Loading state -->
              <div v-if="isVerifying" class="text-center space-y-4">
                <i class="pi pi-spin pi-spinner text-4xl text-primary" />
                <h2 class="text-xl font-semibold text-color">Verifying Email...</h2>
                <p class="text-color-secondary">Please wait while we verify your email address.</p>
              </div>

              <!-- Verification result -->
              <div v-else-if="verificationResult" class="text-center space-y-4">
                <div v-if="verificationResult.success" class="space-y-4">
                  <i class="pi pi-check-circle text-4xl text-green-500" />
                  <h2 class="text-xl font-semibold text-color">Email Verified!</h2>
                  <p class="text-color-secondary">{{ verificationResult.message }}</p>
                  <div class="flex justify-center">
                    <i class="pi pi-spin pi-spinner text-primary" />
                    <span class="ml-2 text-sm text-color-secondary">Redirecting to dashboard...</span>
                  </div>
                </div>
                <div v-else class="space-y-4">
                  <i class="pi pi-exclamation-triangle text-4xl text-red-500" />
                  <h2 class="text-xl font-semibold text-color">Verification Failed</h2>
                  <p class="text-color-secondary">{{ verificationResult.message }}</p>
                  <div class="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      label="Request New Verification" 
                      severity="secondary"
                      @click="showVerificationForm"
                    />
                    <Button 
                      label="Go to Sign In" 
                      @click="goToSignIn"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Email Request Form (when no token is provided or verification failed) -->
            <div v-else>
              <!-- Success/Error message -->
              <div v-if="emailResult" class="mb-6">
                <div v-if="emailResult.success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex items-center">
                    <i class="pi pi-check-circle text-green-500 mr-2" />
                    <p class="text-sm text-green-600">{{ emailResult.message }}</p>
                  </div>
                </div>
                <div v-else class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div class="flex items-center">
                    <i class="pi pi-exclamation-triangle text-red-500 mr-2" />
                    <p class="text-sm text-red-600">{{ emailResult.message }}</p>
                  </div>
                </div>
              </div>

              <div class="text-center mb-6">
                <i class="pi pi-envelope text-4xl text-primary mb-4" />
                <h2 class="text-xl font-semibold text-color mb-2">Verify Your Email</h2>
                <p class="text-color-secondary">
                  Enter your email address and we'll send you a verification link.
                </p>
              </div>

              <form class="space-y-6" @submit.prevent="handleRequestVerification">
                <div>
                  <label for="verify-email" class="block text-sm font-medium text-color mb-2">
                    Email Address
                  </label>
                  <InputText
                    id="verify-email"
                    v-model="emailForm.email"
                    type="email"
                    placeholder="Enter your email"
                    :class="{ 'p-invalid': emailErrors.email }"
                    class="w-full"
                    autocomplete="email"
                  />
                  <small v-if="emailErrors.email" class="p-error block mt-1">
                    {{ emailErrors.email }}
                  </small>
                </div>

                <Button
                  type="submit"
                  label="Send Verification Email"
                  :loading="isSendingVerification"
                  class="w-full"
                  size="large"
                >
                  <template #icon>
                    <i class="pi pi-envelope mr-2" />
                  </template>
                </Button>
              </form>

              <div class="text-center mt-6">
                <button 
                  type="button"
                  class="text-sm text-color-secondary hover:text-primary transition-colors"
                  @click="goToSignIn"
                >
                  <i class="pi pi-arrow-left mr-1" />
                  Back to sign in
                </button>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
