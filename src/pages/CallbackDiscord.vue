<template>
  <v-container
    class="fill-height d-flex flex-column justify-center align-center text-center"
  >
    <!-- Logo -->
    <v-avatar size="80" class="mb-6">
      <img src="/img/BTD-Tech-logo.png" alt="Logo" class="logo"/>
    </v-avatar>

    <!-- ข้อความ -->
    <h2 class="font-weight-bold mb-2">กำลังเข้าสู่ระบบ...</h2>
    <p class="text-subtitle-1 mb-6">กรุณารอสักครู่ กำลังตรวจสอบข้อมูล</p>

    <!-- Loading -->
    <v-progress-circular
      indeterminate
      color="primary"
      size="60"
      width="6"
    />

    <!-- Hint เล็ก -->
    <p class="text-caption text-grey mt-6">
      หากหน้านี้ค้างนานเกินไป กรุณารีเฟรชหรือกลับไปหน้าเข้าสู่ระบบ
    </p>
  </v-container>
</template>
  
  <script>
import axios from 'axios'
import config from '../config'
export default {
    mounted() {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const token = params.get("access_token")
      const keyapi = localStorage.getItem('keyapi')
  
      if (token) {
        axios.get(config.discordApi + "/users/@me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
          .then(res => {
            const data = res.data
            data.keyId = keyapi
            axios.post(config.payload + '/auth/register', res.data).then(resp => {
              if(resp.data.data.registered){
                axios.post(config.payload + '/auth/login', {
                  _id: resp.data.data._id,
                  keyId: keyapi
                }).then(resp => {
                  localStorage.setItem('token', resp.data.data.token)
                  this.$router.push("/")
                }).catch(err => {
                  this.$swal({
                    title: 'เกิดข้อผิดพลาด',
                    text: err.response.data.error,
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                  })
                  this.$router.push("/")
                })
              }else{
                this.$swal({
                  title: 'เกิดข้อผิดพลาด',
                  text: resp.data.error,
                  icon: 'error',
                  confirmButtonText: 'ตกลง'
                })
                this.$router.push("/")
              }
            }).catch(err => {
              this.$swal({
                title: 'เกิดข้อผิดพลาด',
                text: err.response.data.error,
                icon: 'error',
                confirmButtonText: 'ตกลง'
              })
              this.$router.push("/")
            })
          })
          .catch(err => {
            this.$swal({
              title: 'เกิดข้อผิดพลาด',
              text: err.response.data.error,
              icon: 'error',
              confirmButtonText: 'ตกลง'
            })
            this.$router.push("/")
          })
      } else {
        this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่พบ token',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
        this.$router.push("/")
      }
    }
  }
  </script>
  <style scoped>
  .logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  </style>
  