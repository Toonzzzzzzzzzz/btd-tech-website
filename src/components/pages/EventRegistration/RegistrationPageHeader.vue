<template>
  <v-card class="pa-4" outlined>
    <div class="d-flex align-center justify-space-between">
      <div>
        <h2 class="text-h5 font-weight-bold">
          <v-icon class="me-2">mdi-account-plus</v-icon>
          ลงทะเบียนเข้าร่วมกิจกรรม
        </h2>
        <p class="text-caption text-grey mt-1">เลือกกิจกรรมที่ต้องการเข้าร่วมและลงทะเบียน</p>
      </div>
      <div class="d-flex gap-2">
        <v-btn color="success" @click="$emit('refresh')" prepend-icon="mdi-refresh">
          รีเฟรช
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'RegistrationPageHeader',
  emits: ['refresh']
}
</script>