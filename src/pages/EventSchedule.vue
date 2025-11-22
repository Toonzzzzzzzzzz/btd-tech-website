<template>
  <v-container fluid class="pa-6 bg-grey-lighten-3" style="background-color: #000000;">
    <LoadingOverlay v-if="loading" />

    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <PageHeader @add-activity="addNewActivity" />
      </v-col>
    </v-row>

    <!-- Activities List -->
    <v-row class="mb-4">
      <v-col cols="12">
        <ActivitiesList
          :activities="activities"
          :day-options="dayOptions"
          @add-activity="addNewActivity"
          @edit-activity="editActivity"
          @toggle-activity="toggleActivity"
          @delete-activity="deleteActivity"
        />
      </v-col>
    </v-row>

    <!-- Weekly Schedule Overview -->
    <v-row>
      <v-col cols="12">
        <WeeklySchedule
          :activities="activities"
          :day-options="dayOptions"
        />
      </v-col>
    </v-row>

    <!-- Activity Form Dialog -->
    <ActivityForm
      :show="activityDialog"
      :is-editing="!!editingActivity"
      :activity-form="activityForm"
      :activity-colors="activityColors"
      :day-options="dayOptions"
      @update:show="activityDialog = $event"
      @save="saveActivity"
      @cancel="activityDialog = false"
    />
  </v-container>
</template>

<script>
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PageHeader from '@/components/pages/EventSchedule/PageHeader.vue'
import ActivitiesList from '@/components/pages/EventSchedule/ActivitiesList.vue'
import WeeklySchedule from '@/components/pages/EventSchedule/WeeklySchedule.vue'
import ActivityForm from '@/components/pages/EventSchedule/ActivityForm.vue'
import api from '@/api'

export default {
  name: 'EventSchedulePage',
  components: {
    LoadingOverlay,
    PageHeader,
    ActivitiesList,
    WeeklySchedule,
    ActivityForm
  },

  data() {
    return {
      loading: false,
      activityDialog: false,
      editingActivity: null,

      // Activity form data
      activityForm: {
        name: '',
        time: '',
        duration: 30,
        description: '',
        color: '#2196F3',
        activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        isActive: true
      },

      // Activities data from API
      activities: [],

      // Color options for activities
      activityColors: [
        '#2196F3', // Blue
        '#4CAF50', // Green
        '#FF9800', // Orange
        '#F44336', // Red
        '#9C27B0', // Purple
        '#00BCD4', // Cyan
        '#795548', // Brown
        '#607D8B'  // Blue Grey
      ],

      // Day options
      dayOptions: [
        { value: 'monday', label: 'จันทร์', icon: 'mdi-numeric-1' },
        { value: 'tuesday', label: 'อังคาร', icon: 'mdi-numeric-2' },
        { value: 'wednesday', label: 'พุธ', icon: 'mdi-numeric-3' },
        { value: 'thursday', label: 'พฤหัสบดี', icon: 'mdi-numeric-4' },
        { value: 'friday', label: 'ศุกร์', icon: 'mdi-numeric-5' },
        { value: 'saturday', label: 'เสาร์', icon: 'mdi-numeric-6' },
        { value: 'sunday', label: 'อาทิตย์', icon: 'mdi-numeric-7' }
      ]
    }
  },


  async mounted() {
    await this.fetchActivities()
  },

  methods: {
    async fetchActivities() {
      this.loading = true
      try {
        const response = await api().get('/event/list')
        if (response.data && Array.isArray(response.data)) {
          this.activities = response.data
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          this.activities = response.data.data
        } else {
          this.activities = []
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
        this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลกิจกรรมได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
        this.activities = []
      } finally {
        this.loading = false
      }
    },


    addNewActivity() {
      this.editingActivity = null
      this.activityForm = {
        name: '',
        time: '',
        duration: 30,
        description: '',
        color: '#2196F3',
        activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        isActive: true
      }
      this.activityDialog = true
    },

    editActivity(activity) {
      this.editingActivity = activity
      this.activityForm = { ...activity }
      this.activityDialog = true
    },


    async saveActivity(formData) {
      this.loading = true
      const activityData = { ...formData }

      try {
        if (this.editingActivity) {
          // Update existing activity - send to API
          const response = await api().put('/event/update', {
            id: this.editingActivity.id || this.editingActivity._id,
            name: activityData.name,
            time: activityData.time,
            duration: activityData.duration,
            description: activityData.description,
            color: activityData.color,
            activeDays: activityData.activeDays,
            isActive: activityData.isActive
          })

          // If API call is successful, refresh the activities list
          if (response.data) {
            await this.fetchActivities()
          }
        } else {
          // Add new activity - send to API
          const response = await api().post('/event/add', {
            name: activityData.name,
            time: activityData.time,
            duration: activityData.duration,
            description: activityData.description,
            color: activityData.color,
            activeDays: activityData.activeDays,
            isActive: activityData.isActive
          })

          // If API call is successful, refresh the activities list
          if (response.data) {
            await this.fetchActivities()
          }
        }

        this.activityDialog = false
        this.$swal({
          title: 'สำเร็จ',
          text: 'บันทึกกิจกรรมเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        })
      } catch (error) {
        console.error('Error saving activity:', error)
        this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกกิจกรรมได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
      } finally {
        this.loading = false
      }
    },

    async toggleActivity(activity) {
      const newStatus = !activity.isActive
      console.log(activity);
      
      try {
        this.loading = true
        const response = await api().put('/event/toggle', {
          eventId: activity._id,
          isActive: newStatus
        })

        if (response.data) {
          await this.fetchActivities()
          this.$swal({
            title: newStatus ? 'เปิดใช้งานแล้ว' : 'หยุดชั่วคราวแล้ว',
            text: `กิจกรรม "${activity.name}" ${newStatus ? 'จะทำงานตามเวลาที่กำหนด' : 'จะหยุดทำงานชั่วคราว'}`,
            icon: 'success',
            confirmButtonText: 'ตกลง'
          })
        }
      } catch (error) {
        console.error('Error toggling activity:', error)
        this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเปลี่ยนสถานะกิจกรรมได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
      } finally {
        this.loading = false
      }
    },

    deleteActivity(activityId) {
      this.$swal({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบกิจกรรมนี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            this.loading = true
            const response = await api().delete('/event/delete', {
              data: { id: activityId }
            })

            if (response.data) {
              await this.fetchActivities()
              this.$swal({
                title: 'ลบเรียบร้อย',
                text: 'ลบกิจกรรมเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              })
            }
          } catch (error) {
            console.error('Error deleting activity:', error)
            this.$swal({
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถลบกิจกรรมได้',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            })
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

