<script setup lang="ts">
import { authClient } from "~/lib/auth-client"

definePageMeta({
  layout: "default",
})

// Define proper error type interface
interface AuthError {
  message?: string
  code?: string
  [key: string]: unknown
}

const router = useRouter()

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
const emailResult = ref<{ type: 'error' | 'warning' | 'info' | 'success'; content: string } | null>(null)

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

// Helper function to get user-friendly error message
const getErrorMessage = (error: AuthError): { content: string; type: 'error' | 'warning' | 'info' | 'success' } => {
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code?.toLowerCase() || ''
  
  // Validation errors (like "Invalid body parameters")
  if (errorCode === 'validation_error' || 
      errorMessage.includes('invalid body parameters') ||
      errorMessage.includes('validation failed') ||
      errorMessage.includes('invalid parameters') ||
      errorMessage.includes('missing required')) {
    return {
      content: 'Please check that you entered a valid email address and try again.',
      type: 'error'
    }
  }
  
  // User not found
  if (errorCode === 'user_not_found' || 
      errorMessage.includes('user not found') ||
      errorMessage.includes('no user found') ||
      errorMessage.includes('account not found')) {
    return {
      content: 'No account found with this email address. Please check your email or create a new account.',
      type: 'error'
    }
  }
  
  // Email already verified - check for various possible messages
  if (errorCode === 'email_already_verified' || 
      errorMessage.includes('already verified') ||
      errorMessage.includes('email is already verified') ||
      errorMessage.includes('already been verified') ||
      errorMessage.includes('email verified') ||
      errorMessage.includes('already confirmed') ||
      errorMessage.includes('already active')) {
    return {
      content: 'This email address is already verified. You can now sign in to your account.',
      type: 'info'
    }
  }
  
  // Rate limiting
  if (errorCode === 'rate_limit_exceeded' || errorMessage.includes('rate limit')) {
    return {
      content: 'Too many attempts. Please wait a few minutes before trying again.',
      type: 'warning'
    }
  }
  
  // Network/server errors
  if (errorCode === 'network_error' || errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      content: 'Connection error. Please check your internet connection and try again.',
      type: 'error'
    }
  }
  
  // Server errors
  if (errorCode === 'server_error' || 
      errorMessage.includes('server error') ||
      errorMessage.includes('internal error')) {
    return {
      content: 'A server error occurred. Please try again in a few moments.',
      type: 'error'
    }
  }
  
  // Default fallback - provide a more helpful message
  return {
    content: 'Something went wrong. Please check your email address and try again. If the problem persists, please contact support.',
    type: 'error'
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
      callbackURL: '/dashboard'
    })
    
    if (result.error) {
      console.error('❌ Email verification request failed:', result.error)
      const { content, type } = getErrorMessage(result.error)
      emailResult.value = {
        type,
        content
      }
    } else {
      console.log('✅ Email verification sent successfully!')
      emailResult.value = {
        type: 'success',
        content: 'Verification email sent! Please check your email inbox and click the verification link.'
      }
      emailForm.value.email = '' // Clear form
    }
  } catch (error) {
    console.error('❌ Email verification request error:', error)
    const { content, type } = getErrorMessage(error as AuthError)
    emailResult.value = {
      type,
      content
    }
  } finally {
    isSendingVerification.value = false
  }
}

const goToSignIn = () => {
  router.push('/auth?tab=signin')
}
</script>

<template>
  <div class="h-[calc(100vh-5rem)] surface-ground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <Card class="border-0 shadow-4">
        <template #content>
          <div class="p-6">
            <!-- Success/Error message -->
            <div v-if="emailResult" class="mb-6">
              <div 
                class="p-4 rounded-lg border" 
                :class="{
                  'bg-red-50 border-red-200': emailResult.type === 'error',
                  'bg-yellow-50 border-yellow-200': emailResult.type === 'warning',
                  'bg-blue-50 border-blue-200': emailResult.type === 'info',
                  'bg-green-50 border-green-200': emailResult.type === 'success'
                }"
              >
                <div class="flex items-start">
                  <i 
                    :class="{
                      'pi pi-exclamation-triangle text-red-500': emailResult.type === 'error',
                      'pi pi-exclamation-circle text-yellow-500': emailResult.type === 'warning',
                      'pi pi-info-circle text-blue-500': emailResult.type === 'info',
                      'pi pi-check-circle text-green-500': emailResult.type === 'success'
                    }" 
                    class="mr-2 mt-0.5" 
                  />
                  <p 
                    :class="{
                      'text-red-600': emailResult.type === 'error',
                      'text-yellow-600': emailResult.type === 'warning',
                      'text-blue-600': emailResult.type === 'info',
                      'text-green-600': emailResult.type === 'success'
                    }" 
                    class="text-sm"
                  >
                    {{ emailResult.content }}
                  </p>
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
                <i class="pi pi-arrow-left mr-1"/><span class="hover:underline">Back to sign in</span>
              </button>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
