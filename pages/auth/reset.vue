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
const resetResult = ref<{ success: boolean; message: string } | null>(null)
const emailResult = ref<{ success: boolean; message: string } | null>(null)

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

// Handle password reset
const handleResetPassword = async () => {
  if (!token) {
    resetResult.value = {
      success: false,
      message: 'No reset token provided.'
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
      resetResult.value = {
        success: false,
        message: result.error.message || 'Password reset failed. Please try again.'
      }
    } else {
      console.log('✅ Password reset successfully!')
      resetResult.value = {
        success: true,
        message: 'Password reset successfully! You can now sign in with your new password.'
      }
    }
  } catch (error) {
    console.error('❌ Password reset error:', error)
    resetResult.value = {
      success: false,
      message: 'An unexpected error occurred during password reset.'
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
      emailResult.value = {
        success: false,
        message: result.error.message || 'Failed to send reset email. Please try again.'
      }
    } else {
      console.log('✅ Password reset email sent successfully!')
      emailResult.value = {
        success: true,
        message: 'Password reset email sent! Check your email and console logs for details.'
      }
      emailForm.value.email = '' // Clear form
    }
  } catch (error) {
    console.error('❌ Password reset request error:', error)
    emailResult.value = {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
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
  <div class="min-h-screen surface-ground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <Card class="border-0 shadow-4">
        <template #content>
          <div class="p-6">
            <!-- Password Reset Form (when token is provided) -->
            <div v-if="token">
              <!-- Success/Error message -->
              <div v-if="resetResult" class="mb-6">
                <div v-if="resetResult.success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex items-center">
                    <i class="pi pi-check-circle text-green-500 mr-2" />
                    <p class="text-sm text-green-600">{{ resetResult.message }}</p>
                  </div>
                </div>
                <div v-else class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div class="flex items-center">
                    <i class="pi pi-exclamation-triangle text-red-500 mr-2" />
                    <p class="text-sm text-red-600">{{ resetResult.message }}</p>
                  </div>
                </div>
              </div>

              <!-- Reset form -->
              <div v-if="!resetResult?.success">
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
              <div v-if="!resetResult?.success" class="text-center mt-6">
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

            <!-- Email Request Form (when no token is provided) -->
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