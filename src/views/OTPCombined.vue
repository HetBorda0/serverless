<template>
  <div class="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">OTP Verification System</h1>
    
    <!-- Step Indicator -->
    <div class="flex justify-center mb-8">
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
               :class="currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
            1
          </div>
          <span class="ml-2 text-sm font-medium" :class="currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'">
            Request OTP
          </span>
        </div>
        <div class="w-12 h-0.5 bg-gray-300"></div>
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
               :class="currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
            2
          </div>
          <span class="ml-2 text-sm font-medium" :class="currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'">
            Verify OTP
          </span>
        </div>
      </div>
    </div>

    <!-- Step 1: Request OTP -->
    <div v-if="currentStep === 1" class="space-y-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Request Your OTP</h2>
        <p class="text-gray-600">Enter your email and/or phone number to receive verification codes</p>
      </div>

      <form @submit.prevent="generateOTP" class="max-w-md mx-auto space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address (Optional)
          </label>
          <input
            id="email"
            v-model="otpStore.email"
            type="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email address"
          />
        </div>
        
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            v-model="otpStore.phoneNumber"
            type="tel"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>
        
        <button
          type="submit"
          :disabled="otpStore.loading || (!otpStore.email && !otpStore.phoneNumber)"
          class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="otpStore.loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating OTP...
          </span>
          <span v-else>Generate OTP</span>
        </button>
      </form>

      <!-- Success Messages -->
      <div v-if="otpStore.status === 'otp_sent'" class="max-w-md mx-auto space-y-3">
        <div v-if="otpStore.emailOtpSent" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-green-800 font-medium">Email OTP sent successfully!</span>
          </div>
        </div>
        <div v-if="otpStore.phoneOtpSent" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-green-800 font-medium">Phone OTP sent successfully!</span>
          </div>
        </div>
        
        <button
          @click="currentStep = 2"
          class="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Continue to Verification →
        </button>
      </div>
      
      <!-- Error Message -->
      <div v-if="otpStore.status === 'error'" class="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-red-800">Failed to generate OTP. Please try again.</span>
        </div>
      </div>
    </div>

    <!-- Step 2: Verify OTP -->
    <div v-if="currentStep === 2" class="space-y-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Verify Your OTP</h2>
        <p class="text-gray-600">Enter the verification codes sent to your email and phone</p>
      </div>

      <!-- Email Verification Section -->
      <div v-if="otpStore.emailOtpSent" class="max-w-md mx-auto p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <span class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-3">
            📧
          </span>
          Email Verification
          <span v-if="otpStore.emailVerified" class="ml-2 text-green-600">✅</span>
        </h3>
        
        <div v-if="!otpStore.emailVerified" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email: {{ otpStore.email }}
            </label>
            <input
              v-model="otpStore.emailOtp"
              type="text"
              maxlength="6"
              placeholder="Enter 6-digit OTP"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
              :disabled="emailOtpExpired || verifyingEmail"
            />
          </div>
          
          <!-- Email Timer -->
          <div v-if="!emailOtpExpired" class="text-sm text-gray-600">
            Time remaining: <span class="font-bold text-red-600">{{ emailTimeLeft }}</span> seconds
          </div>
          
          <div v-if="emailOtpExpired" class="text-sm text-red-600">
            OTP expired. Please request a new one.
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="verifyEmailOTP"
              :disabled="verifyingEmail || emailOtpExpired || otpStore.emailOtp.length !== 6"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="verifyingEmail">Verifying...</span>
              <span v-else>Verify Email</span>
            </button>
            
            <button
              @click="resendEmailOTP"
              :disabled="verifyingEmail"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Resend
            </button>
          </div>
        </div>
        
        <div v-else class="text-green-600 font-medium">
          ✅ Email verified successfully!
        </div>
      </div>
      
      <!-- Phone Verification Section -->
      <div v-if="otpStore.phoneOtpSent" class="max-w-md mx-auto p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <span class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mr-3">
            📱
          </span>
          Phone Verification
          <span v-if="otpStore.phoneVerified" class="ml-2 text-green-600">✅</span>
        </h3>
        
        <div v-if="!otpStore.phoneVerified" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Phone: {{ otpStore.phoneNumber }}
            </label>
            <input
              v-model="otpStore.phoneOtp"
              type="text"
              maxlength="6"
              placeholder="Enter 6-digit OTP"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
              :disabled="phoneOtpExpired || verifyingPhone"
            />
          </div>
          
          <!-- Phone Timer -->
          <div v-if="!phoneOtpExpired" class="text-sm text-gray-600">
            Time remaining: <span class="font-bold text-red-600">{{ phoneTimeLeft }}</span> seconds
          </div>
          
          <div v-if="phoneOtpExpired" class="text-sm text-red-600">
            OTP expired. Please request a new one.
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="verifyPhoneOTP"
              :disabled="verifyingPhone || phoneOtpExpired || otpStore.phoneOtp.length !== 6"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="verifyingPhone">Verifying...</span>
              <span v-else>Verify Phone</span>
            </button>
            
            <button
              @click="resendPhoneOTP"
              :disabled="verifyingPhone"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Resend
            </button>
          </div>
        </div>
        
        <div v-else class="text-green-600 font-medium">
          ✅ Phone verified successfully!
        </div>
      </div>
      
      <!-- No OTPs Sent Message -->
      <div v-if="!otpStore.emailOtpSent && !otpStore.phoneOtpSent" class="text-center py-8">
        <p class="text-gray-600 mb-4">No OTPs have been requested yet.</p>
        <button
          @click="currentStep = 1"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Go Back to Request OTP
        </button>
      </div>
      
      <!-- Success Message -->
      <div v-if="otpStore.status === 'verified'" class="max-w-md mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-green-800">OTP verified successfully!</span>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="otpStore.status === 'error'" class="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-red-800">Verification failed. Please check your OTP and try again.</span>
        </div>
      </div>
      
      <!-- Complete Verification Message -->
      <div v-if="otpStore.emailVerified && otpStore.phoneVerified" class="max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 class="text-lg font-semibold text-green-800 mb-2">🎉 Verification Complete!</h3>
        <p class="text-green-700 mb-4">Both email and phone have been successfully verified.</p>
        <button
          @click="resetAndStartOver"
          class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useOtpStore } from '../store/useOtpStore'

const otpStore = useOtpStore()

const currentStep = ref(1)
const emailTimeLeft = ref(30)
const phoneTimeLeft = ref(30)
const emailOtpExpired = ref(false)
const phoneOtpExpired = ref(false)
const verifyingEmail = ref(false)
const verifyingPhone = ref(false)

let emailTimer = null
let phoneTimer = null

const startEmailTimer = () => {
  clearEmailTimer()
  emailTimeLeft.value = 30
  emailOtpExpired.value = false
  emailTimer = setInterval(() => {
    if (emailTimeLeft.value > 0) {
      emailTimeLeft.value--
    }
    if (emailTimeLeft.value === 0) {
      emailOtpExpired.value = true
      clearEmailTimer()
    }
  }, 1000)
}

const startPhoneTimer = () => {
  clearPhoneTimer()
  phoneTimeLeft.value = 30
  phoneOtpExpired.value = false
  phoneTimer = setInterval(() => {
    if (phoneTimeLeft.value > 0) {
      phoneTimeLeft.value--
    }
    if (phoneTimeLeft.value === 0) {
      phoneOtpExpired.value = true
      clearPhoneTimer()
    }
  }, 1000)
}

const clearEmailTimer = () => {
  if (emailTimer) {
    clearInterval(emailTimer)
    emailTimer = null
  }
}

const clearPhoneTimer = () => {
  if (phoneTimer) {
    clearInterval(phoneTimer)
    phoneTimer = null
  }
}

// Start timers when OTPs are sent
watch(
  () => otpStore.emailOtpSent,
  (sent) => {
    if (sent && !otpStore.emailVerified) {
      startEmailTimer()
    }
  },
  { immediate: true }
)

watch(
  () => otpStore.phoneOtpSent,
  (sent) => {
    if (sent && !otpStore.phoneVerified) {
      startPhoneTimer()
    }
  },
  { immediate: true }
)

// Clear timers when verified
watch(
  () => otpStore.emailVerified,
  (verified) => {
    if (verified) {
      clearEmailTimer()
    }
  }
)

watch(
  () => otpStore.phoneVerified,
  (verified) => {
    if (verified) {
      clearPhoneTimer()
    }
  }
)

onUnmounted(() => {
  clearEmailTimer()
  clearPhoneTimer()
})

const generateOTP = async () => {
  if (!otpStore.email && !otpStore.phoneNumber) {
    return
  }
  
  try {
    await otpStore.generateOTP()
  } catch (e) {
    // Error handled by store status
  }
}

const verifyEmailOTP = async () => {
  if (emailOtpExpired.value) return
  
  verifyingEmail.value = true
  try {
    await otpStore.verifyOTP('email')
  } catch (e) {
    // Error handled by store
  } finally {
    verifyingEmail.value = false
  }
}

const verifyPhoneOTP = async () => {
  if (phoneOtpExpired.value) return
  
  verifyingPhone.value = true
  try {
    await otpStore.verifyOTP('phone')
  } catch (e) {
    // Error handled by store
  } finally {
    verifyingPhone.value = false
  }
}

const resendEmailOTP = async () => {
  try {
    await otpStore.generateOTP()
    startEmailTimer()
  } catch (e) {
    // Error handled by store
  }
}

const resendPhoneOTP = async () => {
  try {
    await otpStore.generateOTP()
    startPhoneTimer()
  } catch (e) {
    // Error handled by store
  }
}

const resetAndStartOver = () => {
  otpStore.resetState()
  currentStep.value = 1
  clearEmailTimer()
  clearPhoneTimer()
}
</script> 