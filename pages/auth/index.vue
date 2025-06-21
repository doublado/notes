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

// Get route and query parameters
const route = useRoute()

// Form data
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: true
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Form validation
const loginErrors = ref({
  email: '',
  password: ''
})

const registerErrors = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Loading states
const isLoggingIn = ref(false)
const isRegistering = ref(false)

// Message states with type and content
const loginMessage = ref<{ type: 'error' | 'warning' | 'info' | 'success'; content: string; hasLink?: boolean } | null>(null)
const registerMessage = ref<{ type: 'error' | 'warning' | 'info' | 'success'; content: string; hasLink?: boolean } | null>(null)

// Active tab - initialize based on URL parameter
const activeTab = ref(0)

// Set initial tab based on URL parameter
onMounted(() => {
  const tabParam = route.query.tab as string
  if (tabParam === 'signup') {
    activeTab.value = 1
  } else {
    activeTab.value = 0 // Default to signin
  }
})

// Watch for route changes to update tab
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'signup') {
    activeTab.value = 1
  } else {
    activeTab.value = 0
  }
})

// Validation functions
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string) => {
  return password.length >= 8
}

const validateLoginForm = () => {
  let isValid = true
  loginErrors.value = { email: '', password: '' }
  loginMessage.value = null // Clear previous message

  if (!loginForm.value.email) {
    loginErrors.value.email = 'Email is required'
    isValid = false
  } else if (!validateEmail(loginForm.value.email)) {
    loginErrors.value.email = 'Please enter a valid email'
    isValid = false
  }

  if (!loginForm.value.password) {
    loginErrors.value.password = 'Password is required'
    isValid = false
  }

  return isValid
}

const validateRegisterForm = () => {
  let isValid = true
  registerErrors.value = { name: '', email: '', password: '', confirmPassword: '' }
  registerMessage.value = null // Clear previous message

  if (!registerForm.value.name.trim()) {
    registerErrors.value.name = 'Name is required'
    isValid = false
  }

  if (!registerForm.value.email) {
    registerErrors.value.email = 'Email is required'
    isValid = false
  } else if (!validateEmail(registerForm.value.email)) {
    registerErrors.value.email = 'Please enter a valid email'
    isValid = false
  }

  if (!registerForm.value.password) {
    registerErrors.value.password = 'Password is required'
    isValid = false
  } else if (!validatePassword(registerForm.value.password)) {
    registerErrors.value.password = 'Password must be at least 8 characters'
    isValid = false
  }

  if (!registerForm.value.confirmPassword) {
    registerErrors.value.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerErrors.value.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

// Helper function to determine message type based on error
const getMessageType = (error: AuthError): 'error' | 'warning' | 'info' | 'success' => {
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code?.toLowerCase() || ''
  
  // Check for specific error types - be more specific about email verification
  if (errorCode === 'email_not_verified' || 
      errorMessage.includes('email not verified') || 
      errorMessage.includes('verify your email') ||
      errorMessage.includes('email verification required')) {
    return 'warning' // Email verification needed
  }
  
  if (errorCode === 'invalid_credentials' || 
      errorMessage.includes('invalid') || 
      errorMessage.includes('incorrect') ||
      errorMessage.includes('wrong password')) {
    return 'error' // Invalid credentials
  }
  
  if (errorCode === 'user_not_found' || 
      errorMessage.includes('user not found') ||
      errorMessage.includes('no user found') ||
      errorMessage.includes('account not found')) {
    return 'error' // User doesn't exist
  }
  
  if (errorCode === 'email_already_exists' || 
      errorMessage.includes('email already exists') ||
      errorMessage.includes('email is already registered')) {
    return 'warning' // Email already registered
  }
  
  if (errorCode === 'password_too_weak' || 
      errorMessage.includes('password too weak') ||
      errorMessage.includes('password is too short')) {
    return 'error' // Password issues
  }
  
  // Default to error for unknown issues
  return 'error'
}

// Helper function to get user-friendly error message
const getErrorMessage = (error: AuthError): { content: string; hasLink: boolean } => {
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code?.toLowerCase() || ''
  
  // Email verification needed - be more specific
  if (errorCode === 'email_not_verified' || 
      errorMessage.includes('email not verified') || 
      errorMessage.includes('verify your email') ||
      errorMessage.includes('email verification required')) {
    return {
      content: 'Please verify your email address first.',
      hasLink: true
    }
  }
  
  // Invalid credentials
  if (errorCode === 'invalid_credentials' || 
      errorMessage.includes('invalid') || 
      errorMessage.includes('incorrect') ||
      errorMessage.includes('wrong password')) {
    return {
      content: 'Invalid email or password. Please check your credentials and try again.',
      hasLink: false
    }
  }
  
  // User not found
  if (errorCode === 'user_not_found' || 
      errorMessage.includes('user not found') ||
      errorMessage.includes('no user found') ||
      errorMessage.includes('account not found')) {
    return {
      content: 'No account found with this email address. Please check your email or create a new account.',
      hasLink: false
    }
  }
  
  // Email already exists
  if (errorCode === 'email_already_exists' || 
      errorMessage.includes('email already exists') ||
      errorMessage.includes('email is already registered')) {
    return {
      content: 'An account with this email already exists. Please sign in instead or use a different email.',
      hasLink: false
    }
  }
  
  // Password too weak
  if (errorCode === 'password_too_weak' || 
      errorMessage.includes('password too weak') ||
      errorMessage.includes('password is too short')) {
    return {
      content: 'Password is too weak. Please choose a stronger password (at least 6 characters).',
      hasLink: false
    }
  }
  
  // Rate limiting
  if (errorCode === 'rate_limit_exceeded' || errorMessage.includes('rate limit')) {
    return {
      content: 'Too many attempts. Please wait a few minutes before trying again.',
      hasLink: false
    }
  }
  
  // Network/server errors
  if (errorCode === 'network_error' || errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      content: 'Network error. Please check your internet connection and try again.',
      hasLink: false
    }
  }
  
  // Default fallback
  return {
    content: error.message || 'An unexpected error occurred. Please try again.',
    hasLink: false
  }
}

// Form submission handlers
const handleLogin = async () => {
  if (!validateLoginForm()) return

  isLoggingIn.value = true
  try {
    const result = await authClient.signIn.email({
      email: loginForm.value.email,
      password: loginForm.value.password,
      rememberMe: loginForm.value.rememberMe,
      callbackURL: '/dashboard'
    })
    
    if (result.error) {
      // Handle login error
      console.error('Login error:', result.error)
      
      const messageType = getMessageType(result.error)
      const { content, hasLink } = getErrorMessage(result.error)
      
      loginMessage.value = {
        type: messageType,
        content,
        hasLink
      }
    } else {
      // Login successful - Better Auth will handle the redirect automatically
      console.log('Login successful')
    }
  } catch (error) {
    console.error('Login error:', error)
    loginMessage.value = {
      type: 'error',
      content: 'An unexpected error occurred. Please try again.',
      hasLink: false
    }
  } finally {
    isLoggingIn.value = false
  }
}

const handleRegister = async () => {
  if (!validateRegisterForm()) return

  isRegistering.value = true
  try {
    const result = await authClient.signUp.email({
      email: registerForm.value.email,
      password: registerForm.value.password,
      name: registerForm.value.name,
      callbackURL: '/dashboard'
    })
    
    if (result.error) {
      // Handle registration error
      console.error('Registration error:', result.error)
      
      const messageType = getMessageType(result.error)
      const { content, hasLink } = getErrorMessage(result.error)
      
      registerMessage.value = {
        type: messageType,
        content,
        hasLink
      }
    } else {
      // Registration successful, switch to login tab
      activeTab.value = 0
      // Clear register form
      registerForm.value = { name: '', email: '', password: '', confirmPassword: '' }
      // Show success message
      loginMessage.value = {
        type: 'info',
        content: 'Account created successfully! Please check your email for verification.',
        hasLink: false
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    registerMessage.value = {
      type: 'error',
      content: 'An unexpected error occurred. Please try again.',
      hasLink: false
    }
  } finally {
    isRegistering.value = false
  }
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (activeTab.value === 0) {
      handleLogin()
    } else if (activeTab.value === 1) {
      handleRegister()
    }
  }
}
</script>

<template>
  <div class="h-[calc(100vh-5rem)] surface-ground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Auth Forms -->
      <Card class="border-0 shadow-4">
        <template #content>
          <TabView v-model:active-index="activeTab" class="mb-6">
            <!-- Sign In Tab -->
            <TabPanel value="signin" header="Sign In" class="p-0">
              <form class="space-y-6" @submit.prevent="handleLogin" @keydown="handleKeydown">
                <!-- Message display -->
                <div 
                  v-if="loginMessage" 
                  class="p-4 rounded-lg border" 
                  :class="{
                    'bg-red-50 border-red-200': loginMessage.type === 'error',
                    'bg-yellow-50 border-yellow-200': loginMessage.type === 'warning',
                    'bg-blue-50 border-blue-200': loginMessage.type === 'info',
                    'bg-green-50 border-green-200': loginMessage.type === 'success'
                  }"
                >
                  <div class="flex items-start">
                    <i 
                      :class="{
                        'pi pi-exclamation-triangle text-red-500': loginMessage.type === 'error',
                        'pi pi-exclamation-circle text-yellow-500': loginMessage.type === 'warning',
                        'pi pi-info-circle text-blue-500': loginMessage.type === 'info',
                        'pi pi-check-circle text-green-500': loginMessage.type === 'success'
                      }" 
                      class="mr-2 mt-0.5" 
                    />
                    <div 
                      :class="{
                        'text-red-600': loginMessage.type === 'error',
                        'text-yellow-600': loginMessage.type === 'warning',
                        'text-blue-600': loginMessage.type === 'info',
                        'text-green-600': loginMessage.type === 'success'
                      }" 
                      class="text-sm"
                    >
                      <p>{{ loginMessage.content }}</p>
                      <button 
                        v-if="loginMessage.hasLink"
                        type="button"
                        class="text-primary hover:underline font-medium mt-1"
                        @click="$router.push('/auth/verify')"
                      >
                        Click here to request a new verification email
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label for="login-email" class="block text-sm font-medium text-color mb-2">
                    Email Address
                  </label>
                  <InputText
                    id="login-email"
                    v-model="loginForm.email"
                    type="email"
                    placeholder="Enter your email"
                    :class="{ 'p-invalid': loginErrors.email }"
                    class="w-full"
                    autocomplete="email"
                  />
                  <small v-if="loginErrors.email" class="p-error block mt-1">
                    {{ loginErrors.email }}
                  </small>
                </div>

                <div>
                  <label for="login-password" class="block text-sm font-medium text-color mb-2">
                    Password
                  </label>
                  <Password
                    id="login-password"
                    v-model="loginForm.password"
                    placeholder="Enter your password"
                    :class="{ 'p-invalid': loginErrors.password }"
                    class="w-full"
                    autocomplete="current-password"
                    :feedback="false"
                    :toggle-mask="true"
                    fluid
                  />
                  <small v-if="loginErrors.password" class="p-error block mt-1">
                    {{ loginErrors.password }}
                  </small>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Checkbox 
                      id="remember-me" 
                      v-model="loginForm.rememberMe"
                      :binary="true" 
                    />
                    <label for="remember-me" class="ml-2 text-sm text-color-secondary">
                      Remember me
                    </label>
                  </div>
                  <button 
                    type="button"
                    class="text-sm text-primary hover:underline"
                    @click="$router.push('/auth/reset')"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  label="Sign In"
                  :loading="isLoggingIn"
                  class="w-full"
                  size="large"
                >
                  <template #icon>
                    <i class="pi pi-sign-in mr-2" />
                  </template>
                </Button>
              </form>
            </TabPanel>

            <!-- Sign Up Tab -->
            <TabPanel value="signup" header="Sign Up" class="p-0">
              <form class="space-y-6" @submit.prevent="handleRegister" @keydown="handleKeydown">
                <!-- Message display -->
                <div 
                  v-if="registerMessage" 
                  class="p-4 rounded-lg border" 
                  :class="{
                    'bg-red-50 border-red-200': registerMessage.type === 'error',
                    'bg-yellow-50 border-yellow-200': registerMessage.type === 'warning',
                    'bg-blue-50 border-blue-200': registerMessage.type === 'info',
                    'bg-green-50 border-green-200': registerMessage.type === 'success'
                  }"
                >
                  <div class="flex items-start">
                    <i 
                      :class="{
                        'pi pi-exclamation-triangle text-red-500': registerMessage.type === 'error',
                        'pi pi-exclamation-circle text-yellow-500': registerMessage.type === 'warning',
                        'pi pi-info-circle text-blue-500': registerMessage.type === 'info',
                        'pi pi-check-circle text-green-500': registerMessage.type === 'success'
                      }" 
                      class="mr-2 mt-0.5" 
                    />
                    <div 
                      :class="{
                        'text-red-600': registerMessage.type === 'error',
                        'text-yellow-600': registerMessage.type === 'warning',
                        'text-blue-600': registerMessage.type === 'info',
                        'text-green-600': registerMessage.type === 'success'
                      }" 
                      class="text-sm"
                    >
                      <p>{{ registerMessage.content }}</p>
                      <button 
                        v-if="registerMessage.hasLink"
                        type="button"
                        class="text-primary hover:underline font-medium mt-1"
                        @click="$router.push('/auth/verify')"
                      >
                        Click here to request a new verification email
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label for="register-name" class="block text-sm font-medium text-color mb-2">
                    Full Name
                  </label>
                  <InputText
                    id="register-name"
                    v-model="registerForm.name"
                    type="text"
                    placeholder="Enter your full name"
                    :class="{ 'p-invalid': registerErrors.name }"
                    class="w-full"
                    autocomplete="name"
                  />
                  <small v-if="registerErrors.name" class="p-error block mt-1">
                    {{ registerErrors.name }}
                  </small>
                </div>

                <div>
                  <label for="register-email" class="block text-sm font-medium text-color mb-2">
                    Email Address
                  </label>
                  <InputText
                    id="register-email"
                    v-model="registerForm.email"
                    type="email"
                    placeholder="Enter your email"
                    :class="{ 'p-invalid': registerErrors.email }"
                    class="w-full"
                    autocomplete="email"
                  />
                  <small v-if="registerErrors.email" class="p-error block mt-1">
                    {{ registerErrors.email }}
                  </small>
                </div>

                <div>
                  <label for="register-password" class="block text-sm font-medium text-color mb-2">
                    Password
                  </label>
                  <Password
                    id="register-password"
                    v-model="registerForm.password"
                    placeholder="Create a password"
                    :class="{ 'p-invalid': registerErrors.password }"
                    class="w-full"
                    autocomplete="new-password"
                    :toggle-mask="true"
                    fluid
                  />
                  <small v-if="registerErrors.password" class="p-error block mt-1">
                    {{ registerErrors.password }}
                  </small>
                </div>

                <div>
                  <label for="register-confirm-password" class="block text-sm font-medium text-color mb-2">
                    Confirm Password
                  </label>
                  <Password
                    id="register-confirm-password"
                    v-model="registerForm.confirmPassword"
                    placeholder="Confirm your password"
                    :class="{ 'p-invalid': registerErrors.confirmPassword }"
                    class="w-full"
                    autocomplete="new-password"
                    :feedback="false"
                    :toggle-mask="true"
                    fluid
                  />
                  <small v-if="registerErrors.confirmPassword" class="p-error block mt-1">
                    {{ registerErrors.confirmPassword }}
                  </small>
                </div>

                <div class="flex items-center">
                  <Checkbox id="agree-terms" :binary="true" required />
                  <label for="agree-terms" class="ml-2 text-sm text-color-secondary">
                    I agree to the 
                    <a href="/terms-of-service" class="text-primary hover:underline">Terms of Service</a>
                    and 
                    <a href="/privacy-policy" class="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <Button
                  type="submit"
                  label="Create Account"
                  :loading="isRegistering"
                  class="w-full"
                  size="large"
                >
                  <template #icon>
                    <i class="pi pi-user-plus mr-2" />
                  </template>
                </Button>
              </form>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </div>
  </div>
</template>
