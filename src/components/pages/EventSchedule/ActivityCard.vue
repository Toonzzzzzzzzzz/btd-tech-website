<template>
  <v-card
    class="pa-4 h-100"
    outlined
    :style="{ borderColor: activity.color }"
  >
    <div class="d-flex align-center justify-space-between">
      <div class="flex-grow-1">
        <div class="d-flex align-center mb-2">
          <div
            class="activity-color-dot me-3"
            :style="{ backgroundColor: activity.color }"
          ></div>
          <h4 class="text-h6">{{ activity.name }}</h4>
          <v-chip
            class="ms-2"
            size="small"
            :color="activity.isActive ? 'success' : 'error'"
          >
            {{ activity.isActive ? 'เปิดใช้งาน' : 'หยุดชั่วคราว' }}
          </v-chip>
        </div>

        <div class="d-flex align-center mb-2">
          <v-icon size="16" class="me-2">mdi-clock-outline</v-icon>
          <span class="text-body-2">
            <strong>{{ activity.time }}</strong>
            <span v-if="activity.duration"> ({{ activity.duration }} นาที)</span>
          </span>
        </div>

        <div class="d-flex align-center mb-2">
          <v-icon size="16" class="me-2">mdi-calendar-week</v-icon>
          <span class="text-body-2">{{ formatActiveDays(activity.activeDays) }}</span>
        </div>

        <div v-if="activity.description" class="d-flex align-center">
          <v-icon size="16" class="me-2">mdi-text</v-icon>
          <span class="text-body-2 text-grey">{{ activity.description }}</span>
        </div>
      </div>

      <div class="d-flex flex-column gap-2">
        <v-btn
          icon
          size="small"
          color="primary"
          variant="text"
          @click="$emit('edit', activity)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          size="small"
          :color="activity.isActive ? 'warning' : 'success'"
          variant="text"
          @click="$emit('toggle', activity)"
        >
          <v-icon>{{ activity.isActive ? 'mdi-pause' : 'mdi-play' }}</v-icon>
        </v-btn>
        <v-btn
          icon
          size="small"
          color="error"
          variant="text"
          @click="$emit('delete', activity.id || activity._id)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ActivityCard',
  props: {
    activity: {
      type: Object,
      required: true
    },
    dayOptions: {
      type: Array,
      required: true
    }
  },
  emits: ['edit', 'toggle', 'delete'],
  methods: {
    formatActiveDays(activeDays) {
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
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: all 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.h-100 {
  height: 100%;
}

.activity-color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
</style>