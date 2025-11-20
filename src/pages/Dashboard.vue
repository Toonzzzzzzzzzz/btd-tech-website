<template>
  <v-container fluid class="pa-6 bg-grey-lighten-3" style="background-color: #000000;">
    <LoadingOverlay v-if="loading" />
    <!-- แถวแรก: รายวัน + เวลาในวันนั้น -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="pa-4" outlined>
          <h3 class="text-h6 font-weight-bold mb-4">
            📅 สรุปรายวัน (รวม {{ dailyValues.reduce((a, b) => a + b, 0).toFixed(2) }} ชั่วโมง)
            <small class="text-caption text-grey-darken-1">({{ todayLabel }})</small>
          </h3>
          <BarDaily :labels="dailyLabels" :values="dailyValues" />
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 d-flex flex-column" outlined style="height: 100%;">
          <h3 class="text-h6 font-weight-bold mb-4">🙍🏻‍♂️ กำลังเข้าเวรอยู่ {{ userOnline.length }} คน</h3>
          <v-text-field
            v-model="search"
            placeholder="ค้นหาชื่อ..."
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            style="max-height: 40px;"
            v-if="userOnline.length > 0"
          />
          <v-list class="flex-grow-1 user-list" v-if="userOnline.length > 0">
            <v-list-item
              v-for="(user, i) in filteredUsers"
              :key="i"
              class="mb-2 rounded-lg"
            >
              <v-row align="center" no-gutters>
                <v-col cols="auto">
                  <div class="status-dot"></div>
                </v-col>
                <v-col cols="auto" class="mx-2">
                  <v-avatar size="40">
                    <img
                      :src="`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`"
                      alt="avatar"
                      style="width: 100%; height: 100%; object-fit: contain;"
                    />
                  </v-avatar>
                </v-col>
                <v-col>
                  <div class="d-flex flex-column">
                    <span class="font-weight-medium">{{ user.name }}</span>
                    <span class="text-caption text-grey">
                      เข้าเวรเมื่อ {{ formatTime(user.check_in) }}
                    </span>
                  </div>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
          <div v-else>
            <p class="text-center text-grey-darken-1">ไม่มีผู้ใช้ที่กำลังเข้าเวร</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- แถวสอง: รายสัปดาห์ -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card class="pa-4" outlined>
          <h3 class="text-h6 font-weight-bold mb-4">
            📊 สรุปรายสัปดาห์ (รวม {{ weeklyValues.reduce((a, b) => a + b, 0).toFixed(2) }} ชั่วโมง)
            <small class="text-caption text-grey-darken-1">({{ weekRangeLabel }})</small>
          </h3>
          <LineWeekly :labels="weeklyLabels" :values="weeklyValues" />
        </v-card>
      </v-col>
    </v-row>

    <!-- แถวสาม: บล็อกว่าง -->
    <v-row class="mt-6">
    <v-col cols="12">
      <v-card class="pa-6" outlined>
        <h3 class="text-h6 font-weight-bold mb-4">📋 ตารางบันทึกเวร</h3>

        <!-- ฟิลเตอร์ช่วงวันที่ (ส่งไป API) -->
        <v-row class="mb-4" align="center">
          <v-col cols="12" md="3" class="mr-md-4 mb-2 mb-md-0">
            <v-menu
              v-model="menus.start"
              :close-on-content-click="false"
              transition="scale-transition"
              max-width="290"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="displayStart"
                  label="วันที่เริ่ม (yyyy/mm/dd)"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  hide-details
                />
              </template>
              <v-date-picker v-model="filters.start" @update:modelValue="menus.start=false" />
            </v-menu>
          </v-col>

          <!-- วันที่สิ้นสุด -->
          <v-col cols="12" md="3" class="mr-md-4 mb-2 mb-md-0">
            <v-menu
              v-model="menus.end"
              :close-on-content-click="false"
              transition="scale-transition"
              max-width="290"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="displayEnd"
                  label="วันที่สิ้นสุด (yyyy/mm/dd)"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  hide-details
                />
              </template>
              <v-date-picker v-model="filters.end" @update:modelValue="menus.end=false" />
            </v-menu>
          </v-col>

          <!-- ปุ่ม -->
          <v-col cols="12" md="6" class="d-flex gap-2">
            <v-btn color="primary" @click="fetchRecords">ค้นหา</v-btn>
            <v-btn color="secondary" variant="tonal" @click="applyToday">วันนี้</v-btn>
            <v-btn color="default" variant="text" @click="clearFilters">ล้างตัวกรอง</v-btn>
          </v-col>
        </v-row>

        <!-- ตาราง -->
        <v-data-table
          :headers="table.headers"
          :items="table.data"
          :items-per-page="25"
          :items-per-page-options="[]"
          hide-default-footer
          :loading="loading"
          class="elevation-1 my-custom-table"
        >
          <!-- รวมชั่วโมง -->
          <template v-slot:[`item.total_hours`]="{ item }">
            {{ Number(item.total_hours).toFixed(2) }} ชม.
          </template>

          <!-- สถานะ -->
          <template v-slot:[`item.type`]="{ item }">
            <v-chip :color="item.type === 'active' ? 'success' : 'error'">
              {{ item.type === 'active' ? 'เข้าเวรอยู่' : 'ออกเวรแล้ว' }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>

  </v-container>
</template>

<script>
import BarDaily from '@/components/BarDaily.vue'
import LineWeekly from '@/components/LineWeekly.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import api from '@/api'

// ---------- Date helpers ----------
const toISO = (d) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const formatThaiDate = (date) => {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyyTH = date.getFullYear() + 543
  return `${dd}/${mm}/${yyyyTH}`
}

const startOfWeekMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay() // 0=อา ... 6=ส
  const diffToMon = (day + 6) % 7
  d.setDate(d.getDate() - diffToMon)
  d.setHours(0, 0, 0, 0)
  return d
}
const endOfWeekSunday = (date) => {
  const startMon = startOfWeekMonday(date)
  const end = new Date(startMon)
  end.setDate(startMon.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

// ---------- Aggregation helpers (สัปดาห์) ----------
function aggregateDailyHours(records) {
  const arr = Array.isArray(records) ? records : []
  const map = {}
  for (const r of arr) {
    const dayStr = r.check_in?.split(' ')[0] || '' // "22/8/2568"
    if (!dayStr) continue
    map[dayStr] = (map[dayStr] || 0) + (Number(r.total_hours) || 0)
  }
  const labels = Object.keys(map).sort((a, b) => {
    const [ad, am, ayTH] = a.split('/').map(Number)
    const [bd, bm, byTH] = b.split('/').map(Number)
    const aDate = new Date(ayTH - 543, am - 1, ad).getTime()
    const bDate = new Date(byTH - 543, bm - 1, bd).getTime()
    return aDate - bDate
  })
  const values = labels.map(k => +(Number(map[k] || 0)).toFixed(2))
  return { labels, values }
}

function aggregateWeeklyHours(records) {
  const arr = Array.isArray(records) ? records : []
  const { labels, values } = aggregateDailyHours(arr)
  const TH_BUDDHA_OFFSET = 543
  const dayName = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
  const weekMap = { 'อา': 0, 'จ': 0, 'อ': 0, 'พ': 0, 'พฤ': 0, 'ศ': 0, 'ส': 0 }

  labels.forEach((d, idx) => {
    const [dd, mm, yyyyTH] = d.split('/').map(n => parseInt(n, 10))
    if (!dd || !mm || !yyyyTH) return
    const jsDate = new Date(yyyyTH - TH_BUDDHA_OFFSET, mm - 1, dd)
    const dow = dayName[jsDate.getDay()]
    weekMap[dow] += values[idx]
  })

  const weeklyLabels = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'] // จันทร์นำ
  const weeklyValues = weeklyLabels.map(lbl => +Number(weekMap[lbl] || 0).toFixed(2))
  return { weeklyLabels, weeklyValues }
}

// ---------- Aggregation helpers (รายวัน: ช่วงเวลาเข้า-ออก) ----------
/**
 * แปลงสตริง "dd/m/พ.ศ. HH:MM:SS" -> Date (โซนไทย) แล้วคืนเป็น {ts, label, hours}
 * ใช้ recordsDay (ของวันเดียว) มาสร้าง labels/values สำหรับกราฟรายวัน
 */
function sessionsForToday(recordsDay) {
  const arr = Array.isArray(recordsDay) ? recordsDay : []

  const toDateFromThai = (s) => {
    if (!s) return null
    // "21/8/2568 12:35:19"
    const [datePart, timePart = '00:00:00'] = s.split(' ')
    const [d, m, yTH] = datePart.split('/').map(n => parseInt(n, 10))
    const [hh, mi, ss] = timePart.split(':').map(n => parseInt(n, 10))
    const yAD = (yTH || 0) - 543
    // ตีความเป็นเวลาไทยแล้วแปลง UTC โดยลบ 7 ชม.
    const asUTC = new Date(Date.UTC(yAD, (m || 1) - 1, d || 1, hh || 0, mi || 0, ss || 0))
    asUTC.setUTCHours(asUTC.getUTCHours() - 7)
    return asUTC
  }

  const items = arr.map(r => {
    const inDt = toDateFromThai(r.check_in)
    const outDt = toDateFromThai(r.check_out)
    const timeIn = r.check_in?.split(' ')[1]?.slice(0,5) || '-'
    const timeOut = r.check_out?.split(' ')[1]?.slice(0,5) || '-'
    console.log(inDt, outDt)
    return {
      ts: inDt ? inDt.getTime() : 0,
      label: `${timeIn} → ${timeOut}`,
      hours: +(Number(r.total_hours) || 0).toFixed(2),
    }
  })

  // เรียงตามเวลาเข้า
  items.sort((a, b) => a.ts - b.ts)

  return {
    labels: items.map(i => i.label),
    values: items.map(i => i.hours),
  }
}

export default {
  name: 'DashboardPage',
  components: { BarDaily, LineWeekly, LoadingOverlay },
  data() {
    return {
      recordsWeek: [],
      hoursWeek: '',
      recordsDay: [],
      userOnline: {},
      search: "",
      table: {
        headers: [
          { title: 'วันที่เข้าเวร', value: 'check_in' },
          { title: 'เวลาออกเวร', value: 'check_out' },
          { title: 'สถานะ', value: 'type' },
          { title: 'รวมชั่วโมง', value: 'total_hours' }
        ],
        data: [
          {
            "_id": "68a2faef07f060c924ebb535",
            "check_in": "21/8/2568 17:05:35",
            "check_out": "21/8/2568 19:06:57",
            "type": "inactive",
            "total_hours": 2.0227077777777778
          },
          {
            "_id": "68a018971d7a8683d03ef167",
            "check_in": "21/8/2568 12:35:19",
            "check_out": "21/8/2568 21:46:59",
            "type": "inactive",
            "total_hours": 9.194249444444445
          },
          {
            "_id": "689f79d73c931c936aecce7f",
            "check_in": "20/8/2568 01:17:59",
            "check_out": "20/8/2568 01:20:06",
            "type": "inactive",
            "total_hours": 0.03535638888888889
          },
          {
            "_id": "689f796a3c931c936aecce7e",
            "check_in": "19/8/2568 01:16:10",
            "check_out": "19/8/2568 02:16:27",
            "type": "inactive",
            "total_hours": 1.004811111111111
          }
        ]
      },
      menus: {
        start: false,
        end: false,
      },
      filters: {
        start: toISO(new Date()),
        end: toISO(new Date()),
      },
      loading: false,
    }
  },
  async mounted() {
    this.loading = true
    await this.allfetch()
    this.loading = false
  },
  methods: {
    async allfetch() {
      await this.fetchUser()
      this.recordsWeek = await this.fetchRange(
        toISO(startOfWeekMonday(new Date())),
        toISO(endOfWeekSunday(new Date()))
      )
      await this.fetchDay()
    },
    async fetchUser() {
      try {
        const usersOnline = await api().get('/users/online')
        console.log(usersOnline)
        this.userOnline = usersOnline.data.result
      } catch (error) {
        this.$swal?.({
          title: 'เกิดข้อผิดพลาด',
          text: error?.response?.data?.error || error?.message || 'Unknown error',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
        this.userOnline = {}
      }
    },
    async fetchRange(start, end) {
      try {
        const resp = await api().post('/duty/records/find/range', {
          startDate: start,
          endDate: end
        })
        const payload = resp?.data?.records ?? []
        return Array.isArray(payload) ? payload : []
      } catch (error) {
        this.$swal?.({
          title: 'เกิดข้อผิดพลาด',
          text: error?.response?.data?.error || error?.message || 'Unknown error',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
        return []
      }
    },
    async fetchDay() {
      const day = toISO(new Date())
      try {
        const resp = await api().post('/duty/records/find/day', { day })
        const payload = resp?.data?.records ?? []
        this.recordsDay = Array.isArray(payload) ? payload : []
      } catch (error) {
        this.$swal?.({
          title: 'เกิดข้อผิดพลาด',
          text: error?.response?.data?.error || error?.message || 'Unknown error',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
        this.recordsDay = []
      }
    },
    applyToday() {
      this.filters.start = toISO(new Date())
      this.filters.end = toISO(new Date())
      this.fetchRecords()
    },
    clearFilters() {
      this.filters.start = toISO(new Date())
      this.filters.end = toISO(new Date())
      this.fetchRecords()
    },
    fetchRecords() {
      console.log(this.filters.start, this.filters.end)
    },
    formatTime(datetime) {
      const date = new Date(datetime)
      const hh = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      return `${hh}:${mm}`
    }
  },
  computed: {
    // หัวข้อ
    todayLabel() {
      return formatThaiDate(new Date())
    },
    weekRangeLabel() {
      const today = new Date()
      const startMon = startOfWeekMonday(today)
      const endSun = endOfWeekSunday(today)
      return `${formatThaiDate(startMon)} - ${formatThaiDate(endSun)}`
    },

    // ====== กราฟ "สรุปรายวัน" เป็นแต่ละช่วงเวลา (บาร์ละหนึ่งช่วง) ======
    dailyLabels() {
      return sessionsForToday(this.recordsDay).labels
    },
    dailyValues() {
      return sessionsForToday(this.recordsDay).values
    },

    // ====== กราฟ "สรุปรายสัปดาห์" ชั่วโมงต่อวัน จ–อา ======
    weeklyLabels() {
      return aggregateWeeklyHours(this.recordsWeek).weeklyLabels
    },
    weeklyValues() {
      return aggregateWeeklyHours(this.recordsWeek).weeklyValues
    },
    filteredUsers() {
      if (!this.search) return this.userOnline
      return this.userOnline.filter(u =>
        u.name.toLowerCase().includes(this.search.toLowerCase())
      )
    },
    displayStart() {
      if (!this.filters.start) return ''
      const [y, m, d] = this.filters.start.split('-')
      return `${y}/${m}/${d}`
    },
    displayEnd() {
      if (!this.filters.end) return ''
      const [y, m, d] = this.filters.end.split('-')
      return `${y}/${m}/${d}`
    }
  }
}
</script>
<style scoped>
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #4caf50; /* เขียว */
  margin-right: 12px;
}
.user-list {
  overflow-y: auto;
  max-height: 250px;
}
</style>




