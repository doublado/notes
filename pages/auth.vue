<script setup lang="ts">
import { authClient } from "~/lib/auth-client"

definePageMeta({
  layout: "default",
})

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

// Error states
const loginError = ref('')
const registerError = ref('')

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
  return password.length >= 6
}

const validateLoginForm = () => {
  let isValid = true
  loginErrors.value = { email: '', password: '' }
  loginError.value = '' // Clear previous error

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
  registerError.value = '' // Clear previous error

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
    registerErrors.value.password = 'Password must be at least 6 characters'
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
      loginError.value = result.error.message || 'Login failed. Please check your credentials.'
    } else {
      // Login successful - Better Auth will handle the redirect automatically
      console.log('Login successful')
    }
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = 'An unexpected error occurred. Please try again.'
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
      registerError.value = result.error.message || 'Registration failed. Please try again.'
    } else {
      // Registration successful, switch to login tab
      activeTab.value = 0
      // Clear register form
      registerForm.value = { name: '', email: '', password: '', confirmPassword: '' }
      // Show success message
      loginError.value = 'Account created successfully! Please sign in.'
    }
  } catch (error) {
    console.error('Registration error:', error)
    registerError.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isRegistering.value = false
  }
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (activeTab.value === 0) {
      handleLogin()
    } else {
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
                <!-- Error message -->
                <div v-if="loginError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-600">{{ loginError }}</p>
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
                  <a href="#" class="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
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
                <!-- Error message -->
                <div v-if="registerError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-600">{{ registerError }}</p>
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
