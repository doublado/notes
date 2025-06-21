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

const route = useRoute()
const router = useRouter()

// Get token from URL for password reset
const token = route.query.token as string

// Form data
const resetForm = ref({
  password: '',
  confirmPassword: ''
})

const emailForm = ref({
  email: ''
})

// Form validation
const resetErrors = ref({
  password: '',
  confirmPassword: ''
})

const emailErrors = ref({
  email: ''
})

// Loading and result states
const isResetting = ref(false)
const isSendingReset = ref(false)
const resetResult = ref<{ type: 'error' | 'warning' | 'info' | 'success'; content: string } | null>(null)
const emailResult = ref<{ type: 'error' | 'warning' | 'info' | 'success'; content: string } | null>(null)

// Validation
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string) => {
  return password.length >= 8
}

const validateResetForm = () => {
  let isValid = true
  resetErrors.value = { password: '', confirmPassword: '' }

  if (!resetForm.value.password) {
    resetErrors.value.password = 'Password is required'
    isValid = false
  } else if (!validatePassword(resetForm.value.password)) {
    resetErrors.value.password = 'Password must be at least 8 characters'
    isValid = false
  }

  if (!resetForm.value.confirmPassword) {
    resetErrors.value.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (resetForm.value.password !== resetForm.value.confirmPassword) {
    resetErrors.value.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
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
  
  // Invalid token
  if (errorCode === 'invalid_token' || 
      errorMessage.includes('invalid token') ||
      errorMessage.includes('expired token')) {
    return {
      content: 'Invalid or expired reset link. Please request a new password reset email.',
      type: 'warning'
    }
  }
  
  // Password too weak
  if (errorCode === 'password_too_weak' || 
      errorMessage.includes('password too weak') ||
      errorMessage.includes('password is too short')) {
    return {
      content: 'Password is too weak. Please choose a stronger password (at least 8 characters).',
      type: 'error'
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

// Handle password reset
const handleResetPassword = async () => {
  if (!token) {
    resetResult.value = {
      type: 'error',
      content: 'No reset token provided.'
    }
    return
  }

  if (!validateResetForm()) return

  isResetting.value = true
  try {
    console.log('🔐 Resetting password with token:', token)
    
    const result = await authClient.resetPassword({
      newPassword: resetForm.value.password,
      token
    })
    
    if (result.error) {
      console.error('❌ Password reset failed:', result.error)
      const { content, type } = getErrorMessage(result.error)
      resetResult.value = {
        type,
        content
      }
    } else {
      console.log('✅ Password reset successfully!')
      resetResult.value = {
        type: 'success',
        content: 'Password reset successfully! You can now sign in with your new password.'
      }
    }
  } catch (error) {
    console.error('❌ Password reset error:', error)
    const { content, type } = getErrorMessage(error as AuthError)
    resetResult.value = {
      type,
      content
    }
  } finally {
    isResetting.value = false
  }
}

// Handle email reset request
const handleRequestReset = async () => {
  if (!validateEmailForm()) return

  isSendingReset.value = true
  try {
    console.log('📧 Requesting password reset for:', emailForm.value.email)
    
    const result = await authClient.requestPasswordReset({
      email: emailForm.value.email,
      redirectTo: '/auth/reset'
    })
    
    if (result.error) {
      console.error('❌ Password reset request failed:', result.error)
      const { content, type } = getErrorMessage(result.error)
      emailResult.value = {
        type,
        content
      }
    } else {
      console.log('✅ Password reset email sent successfully!')
      emailResult.value = {
        type: 'success',
        content: 'Password reset email sent! Please check your email inbox and click the reset link.'
      }
      emailForm.value.email = '' // Clear form
    }
  } catch (error) {
    console.error('❌ Password reset request error:', error)
    const { content, type } = getErrorMessage(error as AuthError)
    emailResult.value = {
      type,
      content
    }
  } finally {
    isSendingReset.value = false
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
            <!-- Password Reset Form (when token is provided) -->
            <div v-if="token">
              <!-- Success/Error message -->
              <div v-if="resetResult" class="mb-6">
                <div 
                  class="p-4 rounded-lg border" 
                  :class="{
                    'bg-red-50 border-red-200': resetResult.type === 'error',
                    'bg-yellow-50 border-yellow-200': resetResult.type === 'warning',
                    'bg-blue-50 border-blue-200': resetResult.type === 'info',
                    'bg-green-50 border-green-200': resetResult.type === 'success'
                  }"
                >
                  <div class="flex items-start">
                    <i 
                      :class="{
                        'pi pi-exclamation-triangle text-red-500': resetResult.type === 'error',
                        'pi pi-exclamation-circle text-yellow-500': resetResult.type === 'warning',
                        'pi pi-info-circle text-blue-500': resetResult.type === 'info',
                        'pi pi-check-circle text-green-500': resetResult.type === 'success'
                      }" 
                      class="mr-2 mt-0.5" 
                    />
                    <p 
                      :class="{
                        'text-red-600': resetResult.type === 'error',
                        'text-yellow-600': resetResult.type === 'warning',
                        'text-blue-600': resetResult.type === 'info',
                        'text-green-600': resetResult.type === 'success'
                      }" 
                      class="text-sm"
                    >
                      {{ resetResult.content }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Reset form -->
              <div v-if="!resetResult?.type || resetResult.type !== 'success'">
                <div class="text-center mb-6">
                  <i class="pi pi-lock text-4xl text-primary mb-4" />
                  <h2 class="text-xl font-semibold text-color mb-2">Reset Your Password</h2>
                  <p class="text-color-secondary">
                    Enter your new password below.
                  </p>
                </div>

                <form class="space-y-6" @submit.prevent="handleResetPassword">
                  <div>
                    <label for="reset-password" class="block text-sm font-medium text-color mb-2">
                      New Password
                    </label>
                    <Password
                      id="reset-password"
                      v-model="resetForm.password"
                      placeholder="Enter your new password"
                      :class="{ 'p-invalid': resetErrors.password }"
                      class="w-full"
                      autocomplete="new-password"
                      :toggle-mask="true"
                      fluid
                    />
                    <small v-if="resetErrors.password" class="p-error block mt-1">
                      {{ resetErrors.password }}
                    </small>
                  </div>

                  <div>
                    <label for="reset-confirm-password" class="block text-sm font-medium text-color mb-2">
                      Confirm New Password
                    </label>
                    <Password
                      id="reset-confirm-password"
                      v-model="resetForm.confirmPassword"
                      placeholder="Confirm your new password"
                      :class="{ 'p-invalid': resetErrors.confirmPassword }"
                      class="w-full"
                      autocomplete="new-password"
                      :feedback="false"
                      :toggle-mask="true"
                      fluid
                    />
                    <small v-if="resetErrors.confirmPassword" class="p-error block mt-1">
                      {{ resetErrors.confirmPassword }}
                    </small>
                  </div>

                  <Button
                    type="submit"
                    label="Reset Password"
                    :loading="isResetting"
                    class="w-full"
                    size="large"
                  >
                    <template #icon>
                      <i class="pi pi-key mr-2" />
                    </template>
                  </Button>
                </form>
              </div>

              <!-- Success actions -->
              <div v-else class="text-center">
                <Button 
                  label="Sign In" 
                  class="mt-4"
                  @click="goToSignIn"
                />
              </div>

              <!-- Back to sign in -->
              <div v-if="!resetResult?.type || resetResult.type !== 'success'" class="text-center mt-6">
                <button 
                  type="button"
                  class="text-sm text-color-secondary hover:text-primary transition-colors"
                  @click="goToSignIn"
                >
                  <i class="pi pi-arrow-left mr-1"/><span class="hover:underline">Back to sign in</span>
                </button>
              </div>
            </div>

            <!-- Email Request Form (when no token is provided) -->
            <div v-else>
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
                <i class="pi pi-lock text-4xl text-primary mb-4" />
                <h2 class="text-xl font-semibold text-color mb-2">Reset Your Password</h2>
                <p class="text-color-secondary">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form class="space-y-6" @submit.prevent="handleRequestReset">
                <div>
                  <label for="reset-email" class="block text-sm font-medium text-color mb-2">
                    Email Address
                  </label>
                  <InputText
                    id="reset-email"
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
                  label="Send Reset Link"
                  :loading="isSendingReset"
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
          </div>
        </template>
      </Card>
    </div>
  </div>
</template> 