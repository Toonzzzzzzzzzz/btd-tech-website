<template>
  <v-container fluid class="pa-6 bg-grey-lighten-3" style="background-color: #000000;">
    <LoadingOverlay v-if="loading" />

    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <RegistrationPageHeader @refresh="refreshEvents" />
      </v-col>
    </v-row>

    <!-- My Registrations -->
    <v-row class="mb-6">
      <v-col cols="12">
        <MyRegistrationsList
          :registrations="myRegistrations"
          @unregister="unregisterFromEvent"
          @cancel-leave="cancelLeaveFromEvent"
        />
      </v-col>
    </v-row>

    <!-- Available Events -->
    <v-row class="mb-4">
      <v-col cols="12">
        <AvailableEventsList
          :events="availableEvents"
          :registered-event-ids="registeredEventIds"
          :registered-date-event-keys="registeredDateEventKeys"
          :registration-status-map="registrationStatusMap"
          :selected-date="selectedDate"
          :day-options="dayOptions"
          @register="registerForEvent"
          @unregister="unregisterFromEvent"
          @leave="leaveFromEvent"
          @cancel-leave="cancelLeaveFromEvent"
          @date-changed="handleDateChange"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import RegistrationPageHeader from '@/components/pages/EventRegistration/RegistrationPageHeader.vue'
import AvailableEventsList from '@/components/pages/EventRegistration/AvailableEventsList.vue'
import MyRegistrationsList from '@/components/pages/EventRegistration/MyRegistrationsList.vue'
import api from '@/api'
import { formatDateForAPI } from '@/utils/format'

export default {
  name: 'EventRegistrationPage',
  components: {
    LoadingOverlay,
    RegistrationPageHeader,
    AvailableEventsList,
    MyRegistrationsList
  },

  data() {
    return {
      loading: false,
      availableEvents: [],
      myRegistrations: [],
      selectedDate: new Date().toISOString().split('T')[0],
      dayOptions: [
        { value: 'monday', label: 'จันทร์' },
        { value: 'tuesday', label: 'อังคาร' },
        { value: 'wednesday', label: 'พุธ' },
        { value: 'thursday', label: 'พฤหัสบดี' },
        { value: 'friday', label: 'ศุกร์' },
        { value: 'saturday', label: 'เสาร์' },
        { value: 'sunday', label: 'อาทิตย์' }
      ]
    }
  },

  computed: {
    registeredEventIds() {
      return this.myRegistrations.map(reg => reg.event._id)
    },
    registeredDateEventKeys() {
      return this.myRegistrations.map(reg => `${reg.registrationDate}_${reg.event._id}`)
    },
    registrationStatusMap() {
      const map = {}
      this.myRegistrations.forEach(reg => {
        const key = `${reg.registrationDate}_${reg.event._id}`
        map[key] = {
          status: reg.status,
          note: reg.note
        }
      })
      return map
    }
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      await Promise.all([
        this.fetchAvailableEvents(),
        this.fetchMyRegistrations()
      ])
    },

    async fetchAvailableEvents() {
      this.loading = true
      try {
        const response = await api().post('/event/list-by-date', {
          date: formatDateForAPI(this.selectedDate)
        })
        if (response.data && Array.isArray(response.data)) {
          this.availableEvents = response.data.filter(event => event.isActive)
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          this.availableEvents = response.data.data.filter(event => event.isActive)
        } else {
          this.availableEvents = []
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลกิจกรรมได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
        this.availableEvents = []
      } finally {
        this.loading = false
      }
    },

    async fetchMyRegistrations() {
      try {
        const response = await api().post('/event/my-registrations', {
          date: formatDateForAPI(this.selectedDate)
        })
        if (response.data && response.data.registrations && Array.isArray(response.data.registrations)) {
          this.myRegistrations = response.data.registrations
        } else {
          this.myRegistrations = []
        }
      } catch (error) {
        console.error('Error fetching my registrations:', error)
        this.myRegistrations = []
      }
    },

    handleDateChange(newDate) {
      this.selectedDate = newDate
      this.fetchData() // Fetch both available events and my registrations
    },

    async registerForEvent(registerData) {
      const { event, registrationDate } = registerData

      try {
        this.loading = true
        const response = await api().post('/event/register', {
          eventId: event._id,
          registrationDate: formatDateForAPI(registrationDate)
        })

        if (response.data) {
          await this.fetchData()
          this.$swal({
            title: 'สำเร็จ',
            text: `ลงทะเบียนเข้าร่วม "${event.name}" เรียบร้อยแล้ว`,
            icon: 'success',
            confirmButtonText: 'ตกลง'
          })
        }
      } catch (error) {
        console.error('Error registering for event:', error)
        this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
      } finally {
        this.loading = false
      }
    },

    async unregisterFromEvent(event) {
      this.$swal({
        title: 'ยืนยันการยกเลิก',
        text: `คุณต้องการยกเลิกการลงทะเบียน "${event.name}" หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยกเลิกการลงทะเบียน',
        cancelButtonText: 'ไม่ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            this.loading = true
            const response = await api().post('/event/unregister', {
              eventId: event._id,
              registrationDate: formatDateForAPI(this.selectedDate)
            })

            if (response.data) {
              await this.fetchData()
              this.$swal({
                title: 'ยกเลิกเรียบร้อย',
                text: `ยกเลิกการลงทะเบียน "${event.name}" เรียบร้อยแล้ว`,
                icon: 'success',
                confirmButtonText: 'ตกลง'
              })
            }
          } catch (error) {
            console.error('Error unregistering from event:', error)
            this.$swal({
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถยกเลิกการลงทะเบียนได้',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            })
          } finally {
            this.loading = false
          }
        }
      })
    },


    async leaveFromEvent(leaveData) {
      const { event, note } = leaveData

      try {
        this.loading = true
        const response = await api().post('/event/leave', {
          eventId: event._id,
          date: formatDateForAPI(this.selectedDate),
          note: note
        })

        if (response.data) {
          await this.fetchData()
          this.$swal({
            title: 'ลาเรียบร้อย',
            text: `ลากิจกรรม "${event.name}" เรียบร้อยแล้ว`,
            icon: 'success',
            confirmButtonText: 'ตกลง'
          })
        }
      } catch (error) {
        console.error('Error leaving event:', error)
        this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลาได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
      } finally {
        this.loading = false
      }
    },

    async cancelLeaveFromEvent(cancelLeaveData) {
      const { event } = cancelLeaveData

      this.$swal({
        title: 'ยืนยันการยกเลิกการลา',
        text: `คุณต้องการยกเลิกการลา "${event.name}" หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยกเลิกการลา',
        cancelButtonText: 'ไม่ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            this.loading = true
            const response = await api().post('/event/cancel-leave', {
              eventId: event._id,
              date: formatDateForAPI(this.selectedDate)
            })

            if (response.data) {
              await this.fetchData()
              this.$swal({
                title: 'ยกเลิกการลาเรียบร้อย',
                text: `ยกเลิกการลา "${event.name}" เรียบร้อยแล้ว`,
                icon: 'success',
                confirmButtonText: 'ตกลง'
              })
            }
          } catch (error) {
            console.error('Error canceling leave from event:', error)
            this.$swal({
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถยกเลิกการลาได้',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            })
          } finally {
            this.loading = false
          }
        }
      })
    },

    async refreshEvents() {
      await this.fetchData()
      this.$swal({
        title: 'รีเฟรชเรียบร้อย',
        text: 'ข้อมูลได้รับการอัปเดตแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        timer: 2000,
        timerProgressBar: true
      })
    }
  }
}
</script>

