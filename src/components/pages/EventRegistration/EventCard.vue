<template>
  <v-card
    class="pa-4 h-100 event-card position-relative"
    outlined
    :style="{ borderColor: event.color }"
    hover
  >
    <!-- Status Tag in top-right corner -->
    <div
      v-if="getStatusTag"
      class="status-tag"
      :class="getStatusTagClass"
    >
      <v-icon :size="12" class="me-1">{{ getStatusTagIcon }}</v-icon>
      <span class="text-caption">{{ getStatusTag }}</span>
    </div>

    <div class="d-flex flex-column h-100">
      <div class="flex-grow-1">
        <div class="d-flex align-center mb-3">
          <div
            class="event-color-dot me-3"
            :style="{ backgroundColor: event.color }"
          ></div>
          <h4 class="text-h6">{{ event.name }}</h4>
        </div>

        <div class="d-flex align-center mb-2">
          <v-icon size="16" class="me-2">mdi-clock-outline</v-icon>
          <span class="text-body-2">
            <strong>{{ event.time }}</strong>
            <span v-if="event.duration"> ({{ event.duration }} นาที)</span>
          </span>
        </div>

        <div class="d-flex align-center mb-2">
          <v-icon size="16" class="me-2">mdi-calendar-week</v-icon>
          <span class="text-body-2">{{ formatActiveDays(event.activeDays) }}</span>
        </div>

        <div v-if="event.description" class="d-flex align-center mb-3">
          <v-icon size="16" class="me-2">mdi-text</v-icon>
          <span class="text-body-2 text-grey">{{ event.description }}</span>
        </div>

        <div class="d-flex align-center mb-2">
          <v-icon size="16" class="me-2">mdi-account-multiple</v-icon>
          <span class="text-body-2">
            ผู้ลงทะเบียน: {{ event.registeredCount || 0 }}
            <span v-if="event.maxParticipants"> / {{ event.maxParticipants }}</span> คน
          </span>
        </div>
      </div>

      <div class="mt-3">
        <!-- Buttons Row -->
        <div class="d-flex" style="gap: 12px;">
          <!-- Register Button -->
          <v-btn
            color="primary"
            variant="flat"
            style="flex: 1;"
            @click="openRegisterDialog"
            :disabled="isRegistered || (event.maxParticipants && event.registeredCount >= event.maxParticipants) || isTimeRestricted"
          >
            <v-icon class="me-2" size="small">mdi-account-plus</v-icon>
            ลงทะเบียน
          </v-btn>

          <!-- Leave Button -->
          <v-btn
            color="orange"
            variant="outlined"
            style="flex: 1;"
            @click="openLeaveDialog"
            :disabled="isRegistered || (event.maxParticipants && event.registeredCount >= event.maxParticipants) || isTimeRestricted"
          >
            <v-icon class="me-2" size="small">mdi-account-clock</v-icon>
            ลา
          </v-btn>
        </div>


      </div>
    </div>
  </v-card>

  <!-- Register Confirmation Dialog -->
  <v-dialog v-model="registerDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2" color="primary">mdi-account-plus</v-icon>
        ยืนยันการลงทะเบียน
      </v-card-title>

      <v-card-text>
        <p class="mb-2">คุณต้องการลงทะเบียนกิจกรรมหรือไม่?</p>
        <p class="mb-2">กิจกรรม: <strong>{{ event.name }}</strong></p>
        <p class="mb-4">เวลา: <strong>{{ event.time }}</strong></p>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="registerDialog = false"
        >
          ยกเลิก
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="confirmRegister"
        >
          ยืนยันลงทะเบียน
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Leave Dialog -->
  <v-dialog v-model="leaveDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2" color="orange">mdi-account-clock</v-icon>
        ลากิจกรรม
      </v-card-title>

      <v-card-text>
        <p class="mb-2">กิจกรรม: <strong>{{ event.name }}</strong></p>
        <p class="mb-4">เวลา: <strong>{{ event.time }}</strong></p>

        <v-textarea
          v-model="leaveNote"
          label="หมายเหตุการลา"
          placeholder="ระบุเหตุผลการลา (ไม่จำเป็น)"
          variant="outlined"
          rows="3"
          counter="500"
          maxlength="500"
          hide-details="auto"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="leaveDialog = false"
        >
          ยกเลิก
        </v-btn>
        <v-btn
          color="orange"
          variant="flat"
          @click="submitLeave"
        >
          ยืนยันการลา
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import { formatDateForAPI, isRegistrationAllowed, getTimeRestrictionMessage } from '@/utils/format'

export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    },
    isRegistered: {
      type: Boolean,
      default: false
    },
    registrationStatus: {
      type: Object,
      default: null
    },
    dayOptions: {
      type: Array,
      required: true
    },
    selectedDate: {
      type: String,
      required: true
    }
  },
  emits: ['register', 'unregister', 'leave', 'cancel-leave'],
  data() {
    return {
      registerDialog: false,
      leaveDialog: false,
      leaveNote: ''
    }
  },
  computed: {
    getStatusColor() {
      if (!this.registrationStatus) return 'success'
      return this.registrationStatus.status ? 'success' : 'warning'
    },
    getStatusText() {
      if (!this.registrationStatus) return 'ลงทะเบียนแล้ว'
      return this.registrationStatus.status ? 'ลงทะเบียนแล้ว' : 'ลา'
    },
    isOnLeave() {
      return this.registrationStatus && !this.registrationStatus.status
    },
    isTimeRestricted() {
      return !isRegistrationAllowed(this.selectedDate, this.event.time)
    },
    timeRestrictionMessage() {
      return getTimeRestrictionMessage(this.selectedDate, this.event.time)
    },
    getStatusTag() {
      // Priority order: Registered status > Time restrictions
      if (this.isRegistered) {
        if (this.registrationStatus && !this.registrationStatus.status) {
          return 'ลา'
        }
        return 'ลงทะเบียนแล้ว'
      }

      if (this.isTimeRestricted && this.timeRestrictionMessage) {
        return this.timeRestrictionMessage === 'เลยวันที่กิจกรรมแล้ว' ? 'เลยวันที่' : 'เลยเวลา'
      }

      if (!this.isRegistered && this.event.maxParticipants && this.event.registeredCount >= this.event.maxParticipants) {
        return 'เต็มแล้ว'
      }

      return null
    },
    getStatusTagClass() {
      if (this.isRegistered) {
        return this.registrationStatus && !this.registrationStatus.status ? 'status-tag-warning' : 'status-tag-success'
      }

      if (this.isTimeRestricted) {
        return 'status-tag-error'
      }

      if (!this.isRegistered && this.event.maxParticipants && this.event.registeredCount >= this.event.maxParticipants) {
        return 'status-tag-error'
      }

      return 'status-tag-default'
    },
    getStatusTagIcon() {
      if (this.isRegistered) {
        return this.registrationStatus && !this.registrationStatus.status ? 'mdi-account-clock' : 'mdi-check-circle'
      }

      if (this.isTimeRestricted) {
        return 'mdi-lock'
      }

      if (!this.isRegistered && this.event.maxParticipants && this.event.registeredCount >= this.event.maxParticipants) {
        return 'mdi-account-multiple-minus'
      }

      return 'mdi-information'
    }
  },
  methods: {
    formatActiveDays(activeDays) {
      if (!activeDays || activeDays.length === 0) return 'ไม่ระบุ'

      if (activeDays.length === 7) {
        return 'ทุกวัน'
      }

      if (activeDays.length === 6 && !activeDays.includes('sunday')) {
        return 'จันทร์ - เสาร์'
      }

      if (activeDays.length === 5 &&
          activeDays.includes('monday') &&
          activeDays.includes('tuesday') &&
          activeDays.includes('wednesday') &&
          activeDays.includes('thursday') &&
          activeDays.includes('friday')) {
        return 'จันทร์ - ศุกร์'
      }

      const dayLabels = activeDays.map(day => {
        const dayOption = this.dayOptions.find(d => d.value === day)
        return dayOption ? dayOption.label : day
      })

      return dayLabels.join(', ')
    },
    openRegisterDialog() {
      this.registerDialog = true
    },
    confirmRegister() {
      this.$emit('register', {
        event: this.event,
        registrationDate: formatDateForAPI(this.selectedDate)
      })
      this.registerDialog = false
    },
    openLeaveDialog() {
      this.leaveNote = ''
      this.leaveDialog = true
    },
    submitLeave() {
      this.$emit('leave', {
        event: this.event,
        note: this.leaveNote
      })
      this.leaveDialog = false
      this.leaveNote = ''
    },
    cancelLeave() {
      this.$emit('cancel-leave', {
        event: this.event
      })
    }
  }
}
</script>

<style scoped>
.event-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.event-color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.h-100 {
  height: 100%;
}

.status-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  z-index: 1;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-tag-success {
  background-color: #4CAF50;
  color: white;
}

.status-tag-warning {
  background-color: #FF9800;
  color: white;
}

.status-tag-error {
  background-color: #F44336;
  color: white;
}

.status-tag-default {
  background-color: #9E9E9E;
  color: white;
}
</style>