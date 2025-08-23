<template>
  <v-app>
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="pa-6" elevation="6" rounded="lg" v-if="!checkKeyApi">
              <v-card-title class=" text-center">
                Login
              </v-card-title>
              <v-card-text>
                <v-form v-model="valid" ref="form" @submit.prevent="login">
                  <v-text-field
                    v-model="keyId"
                    label="กรุณากรอก Key ID"
                    type="text"
                    prepend-inner-icon="mdi-lock"
                    :rules="[rules.required]"
                    variant="outlined"
                    dense
                  ></v-text-field>
                  <v-btn
                    :disabled="!valid"
                    color="primary"
                    block
                    class="mt-4"
                    type="submit"
                  >
                    เข้าสู่ระบบ
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
            <v-card class="pa-6" elevation="6" rounded="lg" v-if="checkKeyApi">
              <v-card-title class=" text-center">
                Login {{ keyId }} with Discord
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block @click="loginWithDiscord">
                  <v-icon left>mdi-discord</v-icon>
                  เข้าสู่ระบบด้วย Discord
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios'
import config from '@/config'
export default {
  name: "LoginPage",
  data() {
    return {
      keyId: "",
      valid: false,
      rules: {
        required: v => !!v || "กรุณากรอกข้อมูล",
      },
      checkKeyApi: false,
    };
  },
  methods: {
    login() {
      if (this.$refs.form.validate()) {
        axios.post(config.payload + '/groups/check', {
          keyId: this.keyId,
        })
        .then((response) => {
          localStorage.setItem('keyapi', response.data.keyId)
          this.checkKeyApi = true
        })
        .catch((error) => {
          this.$swal({
            title: 'เกิดข้อผิดพลาด',
            text: error.response.data.error,
            icon: 'error',
            confirmButtonText: 'ตกลง'
          })
        })
      }
    },
    loginWithDiscord() {
      const clientId = config.clientId    // 👈 จาก Discord Developer Portal
      const redirectUri = encodeURIComponent(config.redirectUri) 
      const scope = config.scope       // 👈 ขอข้อมูล user basic + email

      window.location.href =
        `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`
    }
  },
};
</script>
