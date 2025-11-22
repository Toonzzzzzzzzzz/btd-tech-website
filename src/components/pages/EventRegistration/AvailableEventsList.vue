<template>
  <v-card class="pa-4" outlined>
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-bold">กิจกรรมที่เปิดรับสมัคร (ระบบปิดลงทะเบียนก่อน 30 นาที)</h3>

      <!-- Date Filter -->
      <div class="d-flex align-center gap-3">
        <span class="text-subtitle-2 me-3">ค้นหาตามวันที่:</span>
        <v-menu v-model="datePickerMenu" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-bind="props"
              :model-value="formatDisplayDate"
              variant="outlined"
              density="compact"
              style="min-width: 200px;"
              hide-details
              readonly
              placeholder="เลือกวันที่"
              append-inner-icon="mdi-calendar"
            />
          </template>
          <v-date-picker
            v-model="internalSelectedDate"
            @update:model-value="datePickerMenu = false"
            color="primary"
            header="เลือกวันที่"
          />
        </v-menu>
      </div>
    </div>

    <!-- Event Count Info -->
    <div class="mb-4">
      <v-chip
        :color="eventsSummary.total > 0 ? 'primary' : 'grey'"
        size="small"
        class="me-2"
      >
        <v-icon start size="16">mdi-calendar-today</v-icon>
        {{ selectedDateLabel }}: {{ eventsSummary.total }} กิจกรรม
      </v-chip>

      <!-- Registration Status Summary -->
      <v-chip
        v-if="eventsSummary.available > 0"
        color="success"
        size="small"
        class="me-2"
      >
        <v-icon start size="16">mdi-check-circle</v-icon>
        เปิดลงทะเบียน: {{ eventsSummary.available }}
      </v-chip>

      <v-chip
        v-if="eventsSummary.closingSoon > 0"
        color="warning"
        size="small"
        class="me-2"
      >
        <v-icon start size="16">mdi-clock-alert</v-icon>
        ใกล้ปิด: {{ eventsSummary.closingSoon }}
      </v-chip>

      <v-chip
        v-if="eventsSummary.closed > 0"
        color="error"
        size="small"
        class="me-2"
      >
        <v-icon start size="16">mdi-lock</v-icon>
        ปิดแล้ว: {{ eventsSummary.closed }}
      </v-chip>
    </div>

    <div v-if="filteredEvents.length === 0" class="text-center text-grey pa-8">
      <v-icon size="64" class="mb-4">mdi-calendar-remove</v-icon>
      <p>ไม่มีกิจกรรมในวันที่ {{ formatSelectedDate }}</p>
    </div>

    <div v-else>
      <v-row>
        <v-col
          v-for="event in availableEvents"
          :key="event._id"
          cols="12"
          md="6"
          lg="4"
          class="mb-3"
        >
          <EventCard
            :event="event"
            :is-registered="isRegisteredAnyDate(event._id)"
            :registration-status="getRegistrationStatus(event._id)"
            :day-options="dayOptions"
            :selected-date="internalSelectedDate"
            @register="$emit('register', $event)"
            @unregister="$emit('unregister', $event)"
            @leave="$emit('leave', $event)"
            @cancel-leave="$emit('cancel-leave', $event)"
          />
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script>
import EventCard from './EventCard.vue'
import { isRegistrationAllowed, getTimeRestrictionMessage } from '@/utils/format'

export default {
  name: 'AvailableEventsList',
  components: {
    EventCard
  },
  props: {
    events: {
      type: Array,
      required: true
    },
    registeredEventIds: {
      type: Array,
      default: () => []
    },
    registeredDateEventKeys: {
      type: Array,
      default: () => []
    },
    registrationStatusMap: {
      type: Object,
      default: () => ({})
    },
    selectedDate: {
      type: String,
      required: true
    },
    dayOptions: {
      type: Array,
      required: true
    }
  },
  emits: ['register', 'unregister', 'leave', 'cancel-leave', 'date-changed'],
  data() {
    return {
      internalSelectedDate: this.selectedDate || new Date().toISOString().split('T')[0],
      datePickerMenu: false
    }
  },
  mounted() {
    // Emit initial date on component mount
    this.$emit('date-changed', this.internalSelectedDate)
  },
  watch: {
    selectedDate(newDate) {
      this.internalSelectedDate = newDate
    },
    internalSelectedDate(newDate) {
      this.$emit('date-changed', newDate)
    }
  },
  computed: {
    selectedDateLabel() {
      return this.formatSelectedDate
    },
    formatSelectedDate() {
      if (!this.internalSelectedDate) return ''
      const date = new Date(this.internalSelectedDate)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    },
    formatDisplayDate() {
      if (!this.internalSelectedDate) return ''
      const date = new Date(this.internalSelectedDate)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    filteredEvents() {
      // Always filter by selected date (no "show all" option)
      return this.events.filter(event => {
        // First check if event occurs on selected date
        let eventOccursOnDate = false

        // If event has specific dates, check if selected date is in those dates
        if (event.eventDates && Array.isArray(event.eventDates)) {
          eventOccursOnDate = event.eventDates.some(eventDate => {
            const eventDateStr = new Date(eventDate).toISOString().split('T')[0]
            return eventDateStr === this.internalSelectedDate
          })
        }

        // If event has activeDays (recurring), check if selected date's day of week matches
        if (event.activeDays && Array.isArray(event.activeDays)) {
          const selectedDate = new Date(this.internalSelectedDate)
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
          const dayOfWeek = dayNames[selectedDate.getDay()]
          eventOccursOnDate = event.activeDays.includes(dayOfWeek)
        }

        // If event doesn't occur on this date, exclude it
        if (!eventOccursOnDate) {
          return false
        }

        // For past dates, don't show any events
        const now = new Date()
        const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
        const currentYear = thaiTime.getUTCFullYear()
        const currentMonth = String(thaiTime.getUTCMonth() + 1).padStart(2, '0')
        const currentDay = String(thaiTime.getUTCDate()).padStart(2, '0')
        const currentDate = `${currentYear}-${currentMonth}-${currentDay}`

        if (this.internalSelectedDate < currentDate) {
          return false
        }

        return true
      })
    },
    availableEvents() {
      // Sort events by registration availability based on time (create new array to avoid mutation)
      return [...this.filteredEvents].sort((a, b) => {
        const aCanRegister = isRegistrationAllowed(this.internalSelectedDate, a.time)
        const bCanRegister = isRegistrationAllowed(this.internalSelectedDate, b.time)

        // Available events first, then closed events
        if (aCanRegister && !bCanRegister) return -1
        if (!aCanRegister && bCanRegister) return 1

        // Within the same availability status, sort by time
        return a.time.localeCompare(b.time)
      })
    },
    eventsSummary() {
      const total = this.filteredEvents.length
      let available = 0
      let closingSoon = 0
      let closed = 0

      this.filteredEvents.forEach(event => {
        if (isRegistrationAllowed(this.internalSelectedDate, event.time)) {
          available++
        } else {
          const restrictionMessage = getTimeRestrictionMessage(this.internalSelectedDate, event.time)
          if (restrictionMessage.includes('ภายใน 30 นาที')) {
            closingSoon++
          } else {
            closed++
          }
        }
      })

      return { total, available, closingSoon, closed }
    }
  },
  methods: {
    isRegistered(eventId) {
      return this.registeredEventIds.includes(eventId)
    },
    isRegisteredForDate(eventId) {
      const dateEventKey = `${this.internalSelectedDate}_${eventId}`
      return this.registeredDateEventKeys.includes(dateEventKey)
    },
    isRegisteredAnyDate(eventId) {
      // Check if registered for this event on any date
      return this.registeredDateEventKeys.some(key => key.endsWith(`_${eventId}`))
    },
    getRegistrationStatus(eventId) {
      const dateEventKey = `${this.internalSelectedDate}_${eventId}`
      const statusInfo = this.registrationStatusMap[dateEventKey]

      if (!statusInfo) return null

      return {
        status: statusInfo.status,
        note: statusInfo.note
      }
    }
  }
}
</script>