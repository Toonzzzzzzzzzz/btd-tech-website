<template>
  <v-card class="pa-4" outlined>
    <h3 class="text-h6 font-weight-bold mb-4">ตารางประจำสัปดาห์</h3>

    <div class="weekly-schedule">
      <div
        v-for="day in weekDays"
        :key="day.value"
        class="day-column"
      >
        <div class="day-header">
          <h4 class="text-subtitle-1 font-weight-bold">{{ day.name }}</h4>
          <small class="text-caption text-grey">{{ day.fullDate }}</small>
        </div>

        <div class="time-slots">
          <div
            v-for="activity in getActivitiesForDay(day.value)"
            :key="`${day.value}-${activity.id || activity._id}`"
            class="activity-slot"
            :style="{ backgroundColor: activity.color + '20', borderColor: activity.color }"
          >
            <div class="activity-name">{{ activity.name }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>

          <div v-if="getActivitiesForDay(day.value).length === 0" class="no-activity">
            <small class="text-grey">ไม่มีกิจกรรม</small>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'WeeklySchedule',
  props: {
    activities: {
      type: Array,
      required: true
    },
    dayOptions: {
      type: Array,
      required: true
    }
  },
  computed: {
    weekDays() {
      const today = new Date()
      const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const monday = new Date(today)
      monday.setDate(today.getDate() - currentDay + 1)

      return this.dayOptions.map((day, index) => {
        const date = new Date(monday)
        date.setDate(monday.getDate() + index)

        return {
          ...day,
          date: date.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit'
          }),
          fullDate: date.toLocaleDateString('th-TH', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
          })
        }
      })
    }
  },
  methods: {
    getActivitiesForDay(dayKey) {
      return this.activities.filter(activity =>
        activity.isActive && activity.activeDays.includes(dayKey)
      ).sort((a, b) => a.time.localeCompare(b.time))
    }
  }
}
</script>

<style scoped>
.weekly-schedule {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.day-column {
  min-height: 200px;
}

.day-header {
  text-align: center;
  padding: 12px 8px;
  background-color: #f5f5f5;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid #e0e0e0;
}

.time-slots {
  padding: 8px;
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
  min-height: 150px;
}

.activity-slot {
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 6px;
  border-left: 4px solid;
  transition: all 0.2s;
}

.activity-slot:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.activity-name {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.activity-time {
  font-size: 0.75rem;
  color: #666;
}

.no-activity {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

@media (max-width: 768px) {
  .weekly-schedule {
    grid-template-columns: 1fr;
  }

  .day-column {
    min-height: auto;
  }
}
</style>