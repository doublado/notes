<script setup lang="ts">
import { authClient } from "~/lib/auth-client"

definePageMeta({
  layout: "default",
})

// Test email for development purposes
const testEmail = ref('test@example.com')

// Loading states
const isTestingReset = ref(false)

// Test password reset functionality for development
const testPasswordReset = async () => {
  if (!testEmail.value) return
  
  isTestingReset.value = true
  try {
    const result = await authClient.requestPasswordReset({
      email: testEmail.value,
      redirectTo: '/auth/reset'
    })
    
    if (result.error) {
      console.error('Test reset error:', result.error)
    } else {
      console.log('✅ Test password reset email sent successfully!')
    }
  } catch (error) {
    console.error('Test reset error:', error)
  } finally {
    isTestingReset.value = false
  }
}
</script>

<template>
  <div class="min-h-screen surface-ground">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-color mb-4">Dashboard</h1>
        <p class="text-color-secondary text-lg">
          Welcome to your notes dashboard. The theme switcher in the navigation bar works on all pages!
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Quick Stats -->
        <Card class="border-0 shadow-2">
          <template #content>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-color">Total Notes</h3>
                <i class="pi pi-file text-2xl text-primary" />
              </div>
              <p class="text-3xl font-bold text-color">0</p>
              <p class="text-color-secondary text-sm mt-2">Start creating your first note</p>
            </div>
          </template>
        </Card>

        <Card class="border-0 shadow-2">
          <template #content>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-color">Shared Notes</h3>
                <i class="pi pi-share-alt text-2xl text-primary" />
              </div>
              <p class="text-3xl font-bold text-color">0</p>
              <p class="text-color-secondary text-sm mt-2">No shared notes yet</p>
            </div>
          </template>
        </Card>

        <Card class="border-0 shadow-2">
          <template #content>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-color">Recent Activity</h3>
                <i class="pi pi-clock text-2xl text-primary" />
              </div>
              <p class="text-3xl font-bold text-color">-</p>
              <p class="text-color-secondary text-sm mt-2">No recent activity</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold text-color mb-6">Quick Actions</h2>
        <div class="flex flex-wrap gap-4">
          <Button 
            label="Create New Note" 
            icon="pi pi-plus"
            class="px-6 py-3"
          />
          <Button 
            label="Import Notes" 
            icon="pi pi-upload"
            severity="secondary"
            outlined
            class="px-6 py-3"
          />
          <Button 
            label="View All Notes" 
            icon="pi pi-list"
            severity="secondary"
            outlined
            class="px-6 py-3"
          />
        </div>
      </div>

      <!-- Development testing section -->
      <div class="mt-12">
        <Card class="border-0 shadow-2">
          <template #header>
            <div class="flex items-center">
              <i class="pi pi-cog text-xl text-primary mr-3" />
              <h2 class="text-xl font-semibold text-color">Auth Testing</h2>
            </div>
          </template>
          <template #content>
            <div class="p-6">
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-color mb-4">Test Password Reset</h3>
                <p class="text-color-secondary mb-4">
                  Use this button to test the password reset functionality. 
                  <strong>For developers:</strong> Check your browser console to see the detailed logs.
                </p>
                
                <div class="mb-4">
                  <label for="test-email" class="block text-sm font-medium text-color mb-2">
                    Test Email Address
                  </label>
                  <InputText
                    id="test-email"
                    v-model="testEmail"
                    type="email"
                    placeholder="Enter email to test"
                    class="w-full max-w-md"
                  />
                </div>

                <div class="flex flex-wrap gap-4">
                  <Button 
                    label="Test Password Reset" 
                    icon="pi pi-lock"
                    :loading="isTestingReset"
                    severity="secondary"
                    class="px-6 py-3"
                    @click="testPasswordReset"
                  />
                </div>
              </div>

              <Divider />

              <div class="mt-6">
                <h4 class="text-md font-semibold text-color mb-3">How to Test:</h4>
                <div class="space-y-3 text-sm text-color-secondary">
                  <div class="flex items-start">
                    <i class="pi pi-check-circle text-green-500 mr-2 mt-0.5" />
                    <div>
                      <strong>Password Reset:</strong> Click "Test Password Reset" and check the browser console (F12) for detailed logs showing the reset email details.
                    </div>
                  </div>
                  <div class="flex items-start">
                    <i class="pi pi-info-circle text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <strong>Email Verification:</strong> Use the dedicated verification page at <code class="bg-gray-100 px-1 rounded">/auth/verify</code> to test email verification.
                    </div>
                  </div>
                  <div class="flex items-start">
                    <i class="pi pi-info-circle text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <strong>Real Implementation:</strong> Replace the console.log statements in <code class="bg-gray-100 px-1 rounded">lib/auth.ts</code> with actual email sending logic.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>