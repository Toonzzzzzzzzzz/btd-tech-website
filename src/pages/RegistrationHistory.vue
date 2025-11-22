<template>
  <div class="registration-history">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">ประวัติการลงทะเบียน</h1>

      <!-- Filter Controls -->
      <div class="d-flex align-center gap-3">
        <!-- Date Range Filter -->
        <v-menu v-model="dateRangeMenu" :close-on-content-click="false" max-width="400px">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              prepend-icon="mdi-calendar-range"
              class="me-3"
            >
              {{ dateRangeText }}
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="text-subtitle-1 d-flex align-center">
              <v-icon class="me-2">mdi-calendar-range</v-icon>
              เลือกช่วงวันที่
            </v-card-title>
            <v-card-text class="pa-0">
              <v-tabs v-model="datePickerTab" color="primary">
                <v-tab value="start">วันที่เริ่มต้น</v-tab>
                <v-tab value="end">วันที่สิ้นสุด</v-tab>
              </v-tabs>

              <v-tabs-window v-model="datePickerTab">
                <v-tabs-window-item value="start">
                  <v-date-picker
                    v-model="startDate"
                    color="primary"
                    header="เลือกวันที่เริ่มต้น"
                    show-adjacent-months
                    hide-actions
                  />
                </v-tabs-window-item>
                <v-tabs-window-item value="end">
                  <v-date-picker
                    v-model="endDate"
                    color="primary"
                    header="เลือกวันที่สิ้นสุด"
                    show-adjacent-months
                    hide-actions
                  />
                </v-tabs-window-item>
              </v-tabs-window>

              <!-- Selected Date Display -->
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-caption text-medium-emphasis">วันที่เริ่มต้น</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ startDate ? formatDateOnly(startDate) : 'ยังไม่เลือก' }}
                    </div>
                  </div>
                  <v-icon color="primary">mdi-arrow-right</v-icon>
                  <div class="text-end">
                    <div class="text-caption text-medium-emphasis">วันที่สิ้นสุด</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ endDate ? formatDateOnly(endDate) : 'ยังไม่เลือก' }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card-text>
            <v-card-actions>
              <v-btn variant="text" @click="clearDateFilter">ล้าง</v-btn>
              <v-spacer />
              <v-btn color="primary" @click="dateRangeMenu = false">ตกลง</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <!-- Search Button -->
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-magnify"
          @click="applyFilters"
        >
          ค้นหา
        </v-btn>
      </div>
    </div>

    <!-- Summary Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="text-center pa-4 elevation-2"
          color="primary"
          variant="tonal"
          rounded="lg"
        >
          <v-avatar color="primary" size="56" class="mb-3">
            <v-icon color="white" size="28">mdi-calendar-check</v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold mb-1">{{ summaryStats.total }}</div>
          <div class="text-body-2 text-medium-emphasis">รายการทั้งหมด</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="text-center pa-4 elevation-2"
          color="success"
          variant="tonal"
          rounded="lg"
        >
          <v-avatar color="success" size="56" class="mb-3">
            <v-icon color="white" size="28">mdi-check-circle</v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold mb-1">{{ summaryStats.registered }}</div>
          <div class="text-body-2 text-medium-emphasis">ลงทะเบียนแล้ว</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="text-center pa-4 elevation-2"
          color="warning"
          variant="tonal"
          rounded="lg"
        >
          <v-avatar color="warning" size="56" class="mb-3">
            <v-icon color="white" size="28">mdi-account-clock</v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold mb-1">{{ summaryStats.leave }}</div>
          <div class="text-body-2 text-medium-emphasis">ลา</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="text-center pa-4 elevation-2"
          color="error"
          variant="tonal"
          rounded="lg"
        >
          <v-avatar color="error" size="56" class="mb-3">
            <v-icon color="white" size="28">mdi-account-minus</v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold mb-1">{{ summaryStats.absent }}</div>
          <div class="text-body-2 text-medium-emphasis">ขาด</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- History List -->
    <v-card rounded="lg" elevation="2">
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <div class="d-flex align-center">
          <v-icon class="me-3" color="primary">mdi-history</v-icon>
          <span class="text-h6">ประวัติการลงทะเบียน</span>
        </div>
        <v-chip
          size="default"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-format-list-numbered"
        >
          {{ registrations.length }} รายการ
        </v-chip>
      </v-card-title>

      <v-divider />

      <div v-if="loading" class="d-flex flex-column align-center justify-center pa-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
          width="4"
        />
        <v-card-subtitle class="mt-4 text-center">กำลังโหลดประวัติการลงทะเบียน...</v-card-subtitle>
      </div>

      <v-empty-state
        v-else-if="registrations.length === 0"
        icon="mdi-history"
        title="ไม่พบประวัติการลงทะเบียน"
        text="ไม่พบประวัติการลงทะเบียนในช่วงเวลาที่เลือก ลองเปลี่ยนตัวกรองดู"
      />

      <div v-else>
        <v-list>
          <template v-for="(dayGroup, index) in groupedRegistrations" :key="dayGroup.date">
            <v-list-group>
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  class="py-4"
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="40" class="me-3">
                      <v-icon color="white" size="20">mdi-calendar</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="d-flex align-center justify-space-between">
                    <div>
                      <span class="text-h6">{{ formatDateOnly(dayGroup.date) }}</span>
                      <v-chip
                        size="small"
                        color="primary"
                        variant="tonal"
                        class="ms-3"
                      >
                        {{ dayGroup.events.length }} กิจกรรม
                      </v-chip>
                    </div>

                    <div class="d-flex gap-2">
                      <v-chip
                        v-if="dayGroup.summary.registered > 0"
                        size="small"
                        color="success"
                        variant="flat"
                      >
                        ลงทะเบียน: {{ dayGroup.summary.registered }}
                      </v-chip>
                      <v-chip
                        v-if="dayGroup.summary.leave > 0"
                        size="small"
                        color="warning"
                        variant="flat"
                      >
                        ลา: {{ dayGroup.summary.leave }}
                      </v-chip>
                      <v-chip
                        v-if="dayGroup.summary.absent > 0"
                        size="small"
                        color="error"
                        variant="flat"
                      >
                        ขาด: {{ dayGroup.summary.absent }}
                      </v-chip>
                    </div>
                  </v-list-item-title>
                </v-list-item>
              </template>

              <!-- Events for this day -->
              <template v-for="item in dayGroup.events" :key="item._id">
                <v-list-item class="ps-16 py-3">
                  <template v-slot:prepend>
                    <v-avatar
                      :color="item.event.color || 'grey'"
                      size="32"
                      class="me-3"
                    >
                      <v-icon
                        :color="getStatusIconColor(item.action)"
                        :icon="getStatusIcon(item.action)"
                        size="16"
                      />
                    </v-avatar>
                  </template>

                  <v-list-item-title class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <span class="text-subtitle-1 me-3">{{ item.event.name }}</span>
                      <v-chip
                        size="small"
                        :color="getStatusChipColor(item.action)"
                        variant="flat"
                      >
                        {{ getStatusText(item.action) }}
                      </v-chip>
                    </div>

                    <div class="d-flex align-center">
                      <v-icon size="16" class="me-1" color="primary">mdi-clock-outline</v-icon>
                      <span class="text-body-2">{{ item.event.time }}</span>
                    </div>
                  </v-list-item-title>

                  <!-- Show note if available -->
                  <v-list-item-subtitle v-if="item.note" class="mt-2">
                    <v-alert
                      type="warning"
                      variant="tonal"
                      density="compact"
                      :text="item.note"
                      prepend-icon="mdi-note-text"
                      title="หมายเหตุการลา"
                    />
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-list-group>

            <v-divider v-if="index < groupedRegistrations.length - 1" />
          </template>
        </v-list>

      </div>
    </v-card>
  </div>
</template>

<script>
import { formatDateForDisplay, formatDateTimeForDisplay } from '@/utils/format'
import api from '@/api'

export default {
  name: 'RegistrationHistory',
  data() {
    return {
      loading: true,
      registrations: [],
      dateRangeMenu: false,
      datePickerTab: 'start',
      startDate: null,
      endDate: null,
      summaryData: {
        total: 0,
        registered: 0,
        leave: 0,
        absent: 0
      }
    }
  },
  async mounted() {
    await this.fetchRegistrationHistory()
  },
  computed: {
    dateRangeText() {
      if (this.startDate && this.endDate) {
        return `${this.formatDateOnly(this.startDate)} - ${this.formatDateOnly(this.endDate)}`
      }
      if (this.startDate) {
        return `จาก ${this.formatDateOnly(this.startDate)}`
      }
      if (this.endDate) {
        return `ถึง ${this.formatDateOnly(this.endDate)}`
      }
      return 'เลือกช่วงเวลา'
    },
    summaryStats() {
      return this.summaryData
    },
    groupedRegistrations() {
      // Group registrations by date
      const grouped = {}

      this.registrations.forEach(item => {
        const date = item.registrationDate
        if (!grouped[date]) {
          grouped[date] = {
            date: date,
            events: [],
            summary: {
              registered: 0,
              leave: 0,
              absent: 0
            }
          }
        }

        grouped[date].events.push(item)

        // Count summary for this day
        if (item.action === 'register') {
          grouped[date].summary.registered++
        } else if (item.action === 'leave') {
          grouped[date].summary.leave++
        } else if (item.action === 'absent') {
          grouped[date].summary.absent++
        }
      })

      // Convert to array and sort by date (newest first)
      return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  },
  methods: {
    async fetchRegistrationHistory() {
      try {
        this.loading = true

        // Always use search endpoint
        const payload = {}

        if (this.startDate && this.endDate) {
          // Both dates must be present for filtering
          payload.startDate = this.startDate
          payload.endDate = this.endDate
        } else {
          // Default to today only (Thai timezone)
          const now = new Date()
          const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
          const today = thaiTime.toISOString().split('T')[0]
          payload.startDate = today
          payload.endDate = today
        }

        const response = await api().post('/event/registration-history/search', payload)

        const data = response.data

        // Transform nested structure to flat list
        const flatRegistrations = []
        let totalRegistered = 0
        let totalLeave = 0
        let totalAbsent = 0

        if (data.history && Array.isArray(data.history)) {
          data.history.forEach(dayData => {
            dayData.events.forEach(event => {
              let status, action

              if (event.status === 'registered') {
                status = true
                action = 'register'
                totalRegistered++
              } else if (event.status === 'leave') {
                status = false
                action = 'leave'
                totalLeave++
              } else { // event.status === 'absent' (default)
                status = null
                action = 'absent'
                totalAbsent++
              }

              flatRegistrations.push({
                _id: `${dayData.date}_${event.eventId}`,
                registrationDate: dayData.date,
                event: {
                  _id: event.eventId,
                  name: event.eventName,
                  time: event.eventTime,
                  color: '#1976d2' // Default color
                },
                status: status,
                action: action,
                note: event.note,
                createdAt: dayData.date // Use date as created timestamp
              })
            })
          })
        }

        this.registrations = flatRegistrations
        this.summaryData = {
          total: flatRegistrations.length,
          registered: totalRegistered,
          leave: totalLeave,
          absent: totalAbsent
        }
      } catch (error) {
        console.error('Error fetching registration history:', error)
        this.$emit('show-snackbar', {
          message: 'ไม่สามารถโหลดประวัติการลงทะเบียนได้',
          color: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    async applyFilters() {
      // Only allow search if both dates are selected
      if (!this.startDate || !this.endDate) {
        this.$emit('show-snackbar', {
          message: 'กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด',
          color: 'warning'
        })
        return
      }

      this.dateRangeMenu = false // Close date picker menu
      await this.fetchRegistrationHistory()
    },
    async clearDateFilter() {
      this.startDate = null
      this.endDate = null
      this.datePickerTab = 'start'
      this.dateRangeMenu = false
      await this.fetchRegistrationHistory()
    },
    getStatusIcon(action) {
      if (action === 'absent') return 'mdi-account-minus'
      if (action === 'leave') return 'mdi-account-clock'
      if (action === 'register') return 'mdi-check-circle'
      return 'mdi-help-circle'
    },
    getStatusIconColor(action) {
      if (action === 'absent') return 'error'
      if (action === 'leave') return 'warning'
      if (action === 'register') return 'success'
      return 'grey'
    },
    getStatusChipColor(action) {
      if (action === 'absent') return 'error'
      if (action === 'leave') return 'warning'
      if (action === 'register') return 'success'
      return 'grey'
    },
    getStatusText(action) {
      if (action === 'absent') return 'ขาด'
      if (action === 'leave') return 'ลา'
      if (action === 'register') return 'ลงทะเบียน'
      return 'ไม่ทราบ'
    },
    getActionText(action) {
      switch (action) {
        case 'register': return 'ลงทะเบียน'
        case 'leave': return 'ลา'
        case 'absent': return 'ขาด'
        case 'cancel-leave': return 'ยกเลิกการลา'
        default: return action
      }
    },
    formatDate(dateString) {
      return formatDateForDisplay(dateString)
    },
    formatDateTime(dateString) {
      return formatDateTimeForDisplay(dateString)
    },
    formatDateOnly(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.registration-history {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 600px) {
  .registration-history {
    padding: 16px;
  }
}
</style>