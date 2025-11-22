<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="800">
    <v-card>
      <v-card-title class="text-h6">
        {{ isEditing ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="activityForm">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="localForm.name"
                label="ชื่อกิจกรรม"
                placeholder="เช่น Airdrop, การประชุม"
                variant="outlined"
                :rules="[v => !!v || 'กรุณาใส่ชื่อกิจกรรม']"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="6">
                  <v-select
                    v-model="selectedHour"
                    :items="hourOptions"
                    label="ชั่วโมง"
                    variant="outlined"
                    prepend-inner-icon="mdi-clock-outline"
                    :rules="[v => v !== null && v !== undefined || 'กรุณาเลือกชั่วโมง']"
                    required
                  />
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="selectedMinute"
                    :items="minuteOptions"
                    label="นาที"
                    variant="outlined"
                    :rules="[v => v !== null && v !== undefined || 'กรุณาเลือกนาที']"
                    required
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="localForm.duration"
                label="ระยะเวลา (นาที)"
                placeholder="30"
                variant="outlined"
                type="number"
                min="1"
                max="1440"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-row align="center">
                <v-col cols="auto">
                  <span class="text-subtitle-2">สี:</span>
                </v-col>
                <v-col>
                  <div class="d-flex gap-2">
                    <div
                      v-for="color in activityColors"
                      :key="color"
                      class="color-picker"
                      :class="{ active: localForm.color === color }"
                      :style="{ backgroundColor: color }"
                      @click="localForm.color = color"
                    ></div>
                  </div>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="localForm.description"
                label="รายละเอียด"
                placeholder="รายละเอียดเพิ่มเติมของกิจกรรม"
                variant="outlined"
                rows="3"
              />
            </v-col>

            <v-col cols="12">
              <v-divider class="mb-4" />
              <h4 class="text-subtitle-1 mb-3">เลือกวันที่ต้องการทำกิจกรรม</h4>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="day in dayOptions"
                  :key="day.value"
                  :color="localForm.activeDays.includes(day.value) ? 'primary' : 'default'"
                  :variant="localForm.activeDays.includes(day.value) ? 'flat' : 'outlined'"
                  @click="toggleDay(day.value)"
                  clickable
                >
                  <v-icon start>{{ day.icon }}</v-icon>
                  {{ day.label }}
                </v-chip>
              </div>
              <small class="text-caption text-grey mt-2">
                * คลิกเพื่อเลือก/ยกเลิกวัน (ต้องเลือกอย่างน้อย 1 วัน)
              </small>
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="localForm.isActive"
                label="เปิดใช้งานกิจกรรมนี้"
                color="success"
                hide-details
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('cancel')">ยกเลิก</v-btn>
        <v-btn color="primary" @click="handleSave">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ActivityForm',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    activityForm: {
      type: Object,
      required: true
    },
    activityColors: {
      type: Array,
      required: true
    },
    dayOptions: {
      type: Array,
      required: true
    }
  },
  emits: ['update:show', 'save', 'cancel'],
  data() {
    return {
      localForm: { ...this.activityForm },
      selectedHour: null,
      selectedMinute: null,
      hourOptions: this.generateHourOptions(),
      minuteOptions: this.generateMinuteOptions()
    }
  },
  watch: {
    activityForm: {
      handler(newForm) {
        this.localForm = { ...newForm }
        // Parse time when form data changes
        if (newForm.time) {
          this.parseTime(newForm.time)
        } else {
          // Set current time for new activity
          const now = new Date()
          this.selectedHour = now.getHours()
          this.selectedMinute = now.getMinutes()
        }
      },
      deep: true
    },
    selectedHour() {
      this.updateTime()
    },
    selectedMinute() {
      this.updateTime()
    }
  },
  mounted() {
    // Parse initial time if exists, otherwise set current time
    if (this.activityForm.time) {
      this.parseTime(this.activityForm.time)
    } else {
      // Set current time for new activity
      const now = new Date()
      this.selectedHour = now.getHours()
      this.selectedMinute = now.getMinutes()
      this.updateTime()
    }
  },
  methods: {
    toggleDay(dayValue) {
      const index = this.localForm.activeDays.indexOf(dayValue)
      if (index > -1) {
        // ถ้าเหลือวันเดียว ไม่ให้ยกเลิก
        if (this.localForm.activeDays.length === 1) {
          this.$swal({
            title: 'ไม่สามารถยกเลิกได้',
            text: 'ต้องเลือกอย่างน้อย 1 วัน',
            icon: 'warning',
            confirmButtonText: 'ตกลง'
          })
          return
        }
        this.localForm.activeDays.splice(index, 1)
      } else {
        this.localForm.activeDays.push(dayValue)
      }
    },
    async handleSave() {
      const { valid } = await this.$refs.activityForm.validate()
      if (!valid) return

      // Validate active days
      if (this.localForm.activeDays.length === 0) {
        this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: 'กรุณาเลือกวันที่ต้องการทำกิจกรรมอย่างน้อย 1 วัน',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
        return
      }

      this.$emit('save', this.localForm)
    },
    generateHourOptions() {
      const options = []
      for (let hour = 0; hour < 24; hour++) {
        const hourString = String(hour).padStart(2, '0')
        options.push({
          title: hourString,
          value: hour
        })
      }
      return options
    },
    generateMinuteOptions() {
      const options = []
      for (let minute = 0; minute < 60; minute++) {
        const minuteString = String(minute).padStart(2, '0')
        options.push({
          title: minuteString,
          value: minute
        })
      }
      return options
    },
    parseTime(timeString) {
      if (timeString && timeString.includes(':')) {
        const [hourStr, minuteStr] = timeString.split(':')
        this.selectedHour = parseInt(hourStr, 10)
        this.selectedMinute = parseInt(minuteStr, 10)
      }
    },
    updateTime() {
      if (this.selectedHour !== null && this.selectedMinute !== null) {
        const hourString = String(this.selectedHour).padStart(2, '0')
        const minuteString = String(this.selectedMinute).padStart(2, '0')
        this.localForm.time = `${hourString}:${minuteString}`
      }
    }
  }
}
</script>

<style scoped>
.color-picker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.color-picker:hover {
  transform: scale(1.1);
}

.color-picker.active {
  border-color: #333;
}

</style>