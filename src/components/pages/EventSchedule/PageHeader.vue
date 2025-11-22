<template>
  <v-card class="pa-4" outlined>
    <div class="d-flex align-center justify-space-between">
      <div>
        <h2 class="text-h5 font-weight-bold">
          <v-icon class="me-2">mdi-calendar-edit</v-icon>
          ตั้งค่ากิจกรรมประจำสัปดาห์
        </h2>
        <p class="text-caption text-grey mt-1">กำหนดกิจกรรมที่จะทำซ้ำทุกวัน และเลือกวันที่ต้องการหยุด</p>
      </div>
      <div class="d-flex gap-2">
        <v-btn color="primary" @click="$emit('add-activity')" prepend-icon="mdi-plus">
          เพิ่มกิจกรรม
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'PageHeader',
  emits: ['add-activity']
}
</script>