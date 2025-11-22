<template>
  <v-card class="pa-4" outlined>
    <h3 class="text-h6 font-weight-bold mb-4">กิจกรรมที่ลงทะเบียนแล้ว</h3>

    <div v-if="registrations.length === 0" class="text-center text-grey pa-8">
      <v-icon size="64" class="mb-4">mdi-calendar-check</v-icon>
      <p>ยังไม่ได้ลงทะเบียนกิจกรรมใดๆ</p>
    </div>

    <div v-else>
      <v-row>
        <v-col
          v-for="registration in registrations"
          :key="registration._id"
          cols="12"
          md="6"
          lg="4"
          class="mb-3"
        >
          <RegistrationCard
            :registration="registration"
            @unregister="$emit('unregister', $event)"
            @cancel-leave="$emit('cancel-leave', $event)"
          />
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script>
import RegistrationCard from './RegistrationCard.vue'

export default {
  name: 'MyRegistrationsList',
  components: {
    RegistrationCard
  },
  props: {
    registrations: {
      type: Array,
      required: true
    }
  },
  emits: ['unregister', 'cancel-leave']
}
</script>