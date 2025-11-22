<template>
  <v-card
    class="pa-4 h-100"
    outlined
    :style="{ borderColor: registration.event.color }"
  >
    <div class="d-flex align-center mb-3">
      <div
        class="event-color-dot me-3"
        :style="{ backgroundColor: registration.event.color }"
      ></div>
      <div>
        <h4 class="text-h6">{{ registration.event.name }}</h4>
        <v-chip
          size="small"
          :color="registration.status ? 'success' : 'warning'"
          class="mt-1"
        >
          {{ registration.status ? 'ลงทะเบียนแล้ว' : 'ลา' }}
        </v-chip>
      </div>
    </div>

    <div class="d-flex align-center mb-2">
      <v-icon size="16" class="me-2">mdi-clock-outline</v-icon>
      <span class="text-body-2">{{ registration.event.time }}</span>
    </div>

    <div class="d-flex align-center mb-2">
      <v-icon size="16" class="me-2">mdi-calendar-plus</v-icon>
      <span class="text-body-2">ลงทะเบียนเมื่อ: {{ formatDate(registration.registeredAt) }}</span>
    </div>

    <!-- Show note if status is false (leave) -->
    <div v-if="!registration.status && registration.note" class="d-flex align-center mb-2">
      <v-icon size="16" class="me-2">mdi-note-text</v-icon>
      <span class="text-body-2 text-orange">หมายเหตุการลา: {{ registration.note }}</span>
    </div>

    <!-- Time Restriction Message -->
    <div v-if="isTimeRestricted && timeRestrictionMessage" class="text-center mt-2">
      <v-chip color="warning" size="small">{{ timeRestrictionMessage }}</v-chip>
    </div>

    <!-- Cancel Leave Button for leave status -->
    <v-btn
      v-if="!registration.status"
      color="success"
      variant="outlined"
      block
      class="mt-3"
      @click="$emit('cancel-leave', { event: registration.event })"
      :disabled="isTimeRestricted"
    >
      <v-icon class="me-2">mdi-account-check</v-icon>
      ยกเลิกการลา
    </v-btn>

    <!-- Unregister Button for registered status -->
    <v-btn
      v-else
      color="error"
      variant="outlined"
      block
      class="mt-3"
      @click="$emit('unregister', registration.event)"
      :disabled="isTimeRestricted"
    >
      <v-icon class="me-2">mdi-account-minus</v-icon>
      ยกเลิกการลงทะเบียน
    </v-btn>
  </v-card>
</template>

<script>
import { isRegistrationAllowed, getTimeRestrictionMessage } from '@/utils/format'

export default {
  name: 'RegistrationCard',
  props: {
    registration: {
      type: Object,
      required: true
    }
  },
  emits: ['unregister', 'cancel-leave'],
  computed: {
    isTimeRestricted() {
      return !isRegistrationAllowed(this.registration.registrationDate, this.registration.event.time)
    },
    timeRestrictionMessage() {
      return getTimeRestrictionMessage(this.registration.registrationDate, this.registration.event.time)
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'ไม่ระบุ'
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.event-color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.h-100 {
  height: 100%;
}
</style>