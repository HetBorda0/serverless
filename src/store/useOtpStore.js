import { defineStore } from 'pinia'
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

export const useOtpStore = defineStore('otp', {
  state: () => ({
    email: '',
    phoneNumber: '',
    emailOtp: '',
    phoneOtp: '',
    status: '', // e.g. 'idle', 'otp_sent', 'verified', 'error'
    loading: false,
    emailVerified: false,
    phoneVerified: false,
    emailOtpSent: false,
    phoneOtpSent: false
  }),

  actions: {
    async generateOTP() {
      console.log('🚀 Frontend: Starting OTP generation...')
      console.log('📧 Email:', this.email)
      console.log('📱 Phone:', this.phoneNumber)
      
      this.loading = true
      this.status = ''
      this.emailOtpSent = false
      this.phoneOtpSent = false

      try {
        const payload = {}
        if (this.email) payload.email = this.email
        if (this.phoneNumber) payload.phoneNumber = this.phoneNumber

        console.log('📤 Frontend: Sending request to API:', payload)
        const response = await axios.post(`${baseURL}/generate-otp`, payload)
        console.log('✅ Frontend: API response received:', response.data)
        
        if (response.data.results.email) {
          this.emailOtpSent = true
          console.log('📧 Frontend: Email OTP sent successfully')
        }
        if (response.data.results.phone) {
          this.phoneOtpSent = true
          console.log('📱 Frontend: Phone OTP sent successfully')
        }

        this.status = 'otp_sent'
        console.log('🎯 Frontend: OTP generation completed successfully')
        return response.data
      } catch (error) {
        console.error('💥 Frontend: Error generating OTP:', error)
        console.error('❌ Frontend: Error details:', error.response?.data || error.message)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to generate OTP'
        this.status = 'error'
        throw new Error(errorMessage)
      } finally {
        this.loading = false
        console.log('🏁 Frontend: OTP generation process finished')
      }
    },

    async verifyOTP(type) {
      console.log('🔍 Frontend: Starting OTP verification...')
      console.log('🏷️ Verification type:', type)
      console.log('🔢 Email OTP:', this.emailOtp)
      console.log('🔢 Phone OTP:', this.phoneOtp)
      
      this.loading = true
      this.status = ''

      try {
        const payload = {
          otp: type === 'email' ? this.emailOtp : this.phoneOtp,
          type: type
        }

        if (type === 'email') {
          payload.email = this.email
        } else {
          payload.phoneNumber = this.phoneNumber
        }

        console.log('📤 Frontend: Sending verification request:', payload)
        const response = await axios.post(`${baseURL}/verify-otp`, payload)
        console.log('✅ Frontend: Verification response received:', response.data)
        
        if (type === 'email') {
          this.emailVerified = true
          console.log('📧 Frontend: Email verification successful')
        } else {
          this.phoneVerified = true
          console.log('📱 Frontend: Phone verification successful')
        }

        this.status = 'verified'
        console.log('🎉 Frontend: OTP verification completed successfully')
        return response.data
      } catch (error) {
        console.error('💥 Frontend: Error verifying OTP:', error)
        console.error('❌ Frontend: Error details:', error.response?.data || error.message)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP'
        this.status = 'error'
        throw new Error(errorMessage)
      } finally {
        this.loading = false
        console.log('🏁 Frontend: OTP verification process finished')
      }
    },

    clearMessages() {
      console.log('🧹 Frontend: Clearing status messages')
      this.status = ''
    },

    resetState() {
      console.log('🔄 Frontend: Resetting store state')
      this.email = ''
      this.phoneNumber = ''
      this.emailOtp = ''
      this.phoneOtp = ''
      this.status = ''
      this.emailVerified = false
      this.phoneVerified = false
      this.emailOtpSent = false
      this.phoneOtpSent = false
      console.log('✅ Frontend: Store state reset completed')
    }
  }
}) 