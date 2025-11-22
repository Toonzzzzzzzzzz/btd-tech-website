<template>
  <v-card class="pa-4" outlined>
    <h3 class="text-h6 font-weight-bold mb-4">กิจกรรมที่ตั้งไว้</h3>

    <div v-if="activities.length === 0" class="text-center text-grey pa-8">
      <v-icon size="64" class="mb-4">mdi-calendar-blank-outline</v-icon>
      <p>ยังไม่มีกิจกรรมที่ตั้งไว้</p>
      <v-btn color="primary" variant="outlined" @click="$emit('add-activity')">
        เพิ่มกิจกรรมแรก
      </v-btn>
    </div>

    <div v-else>
      <v-row>
        <v-col
          v-for="activity in activities"
          :key="activity.id || activity._id"
          cols="12"
          md="4"
          class="mb-3"
        >
          <ActivityCard
            :activity="activity"
            :day-options="dayOptions"
            @edit="$emit('edit-activity', activity)"
            @toggle="$emit('toggle-activity', activity)"
            @delete="$emit('delete-activity', $event)"
          />
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script>
import ActivityCard from './ActivityCard.vue'

export default {
  name: 'ActivitiesList',
  components: {
    ActivityCard
  },
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
  emits: ['add-activity', 'edit-activity', 'toggle-activity', 'delete-activity']
}
</script>