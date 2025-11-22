/**
 * Date formatting utilities
 */

/**
 * Format date to yyyy-mm-dd format for API requests (Thai timezone)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Date in yyyy-mm-dd format (Thai timezone)
 */
export function formatDateForAPI(date) {
  if (!date) return null

  // If it's already a string in correct format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  // Convert to Date object if it's a string
  const dateObj = date instanceof Date ? date : new Date(date)

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateForAPI:', date)
    return null
  }

  // Convert to Thai timezone and format to yyyy-mm-dd
  const thaiDate = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000)) // UTC+7 for Thailand
  return thaiDate.toISOString().split('T')[0]
}

/**
 * Get current date in yyyy-mm-dd format (Thai timezone)
 * @returns {string} Current date in yyyy-mm-dd format (Thai timezone)
 */
export function getCurrentDateForAPI() {
  return formatDateForAPI(new Date())
}

/**
 * Get current Thai date and time
 * @returns {Date} Current date in Thai timezone
 */
export function getCurrentThaiDate() {
  const now = new Date()
  return new Date(now.getTime() + (7 * 60 * 60 * 1000))
}

/**
 * Format date for Thai display (Thai timezone)
 * @param {Date|string} date - Date object or date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string in Thai
 */
export function formatDateForDisplay(date, options = {}) {
  if (!date) return 'ไม่ระบุ'

  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) {
    return 'วันที่ไม่ถูกต้อง'
  }

  // Convert to Thai timezone
  const thaiDate = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000))

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  }

  return thaiDate.toLocaleDateString('th-TH', { ...defaultOptions, ...options })
}

/**
 * Format date and time for Thai display (Thai timezone)
 * @param {Date|string} date - Date object or date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date and time string in Thai
 */
export function formatDateTimeForDisplay(date, options = {}) {
  if (!date) return 'ไม่ระบุ'

  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) {
    return 'วันที่ไม่ถูกต้อง'
  }

  // Convert to Thai timezone
  const thaiDate = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000))

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  }

  return thaiDate.toLocaleDateString('th-TH', { ...defaultOptions, ...options })
}

/**
 * Check if event registration is allowed based on time restrictions
 * Registration is disabled if current time is within 30 minutes before event time or after event time
 * @param {string} eventDate - Event date in yyyy-mm-dd format
 * @param {string} eventTime - Event time in HH:mm format
 * @returns {boolean} True if registration is allowed, false otherwise
 */
export function isRegistrationAllowed(eventDate, eventTime) {
  if (!eventDate || !eventTime) return false

  try {
    // Get current time in Thai timezone (UTC+7)
    const now = new Date()
    const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))

    // Get current date in Thai timezone (yyyy-mm-dd format)
    const currentYear = thaiTime.getUTCFullYear()
    const currentMonth = String(thaiTime.getUTCMonth() + 1).padStart(2, '0')
    const currentDay = String(thaiTime.getUTCDate()).padStart(2, '0')
    const currentDate = `${currentYear}-${currentMonth}-${currentDay}`

    // Normalize eventDate to yyyy-mm-dd format if needed
    let normalizedEventDate = eventDate
    if (eventDate instanceof Date) {
      const year = eventDate.getFullYear()
      const month = String(eventDate.getMonth() + 1).padStart(2, '0')
      const day = String(eventDate.getDate()).padStart(2, '0')
      normalizedEventDate = `${year}-${month}-${day}`
    }

    // เมื่อวาน - ปิดลงทะเบียนทั้งหมด
    if (normalizedEventDate < currentDate) {
      return false
    }

    // อนาคต - เปิดลงทะเบียนหมด
    if (normalizedEventDate > currentDate) {
      return true
    }

    // วันนี้ - เช็คเวลา
    const [eventHour, eventMinute] = eventTime.split(':').map(Number)
    const currentHour = thaiTime.getUTCHours()
    const currentMinute = thaiTime.getUTCMinutes()

    const eventTimeInMinutes = eventHour * 60 + eventMinute
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // เลยเวลาแล้ว - ปิด
    if (currentTimeInMinutes >= eventTimeInMinutes) {
      return false
    }

    // ยังไม่ถึงเวลา ก่อน 30 นาที - เปิด
    if (currentTimeInMinutes < (eventTimeInMinutes - 30)) {
      return true
    }

    // ใกล้เวลา (ภายใน 30 นาที) - ปิด
    return false

  } catch (error) {
    console.warn('Error checking registration time:', error)
    return true // Default to allowing registration if there's an error
  }
}

/**
 * Get time restriction message for display
 * @param {string} eventDate - Event date in yyyy-mm-dd format
 * @param {string} eventTime - Event time in HH:mm format
 * @returns {string} Message explaining time restriction
 */
export function getTimeRestrictionMessage(eventDate, eventTime) {
  if (!eventDate || !eventTime) return ''

  try {
    // Get current time in Thai timezone (UTC+7)
    const now = new Date()
    const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))

    // Get current date in Thai timezone (yyyy-mm-dd format)
    const currentYear = thaiTime.getUTCFullYear()
    const currentMonth = String(thaiTime.getUTCMonth() + 1).padStart(2, '0')
    const currentDay = String(thaiTime.getUTCDate()).padStart(2, '0')
    const currentDate = `${currentYear}-${currentMonth}-${currentDay}`

    // Normalize eventDate to yyyy-mm-dd format if needed
    let normalizedEventDate = eventDate
    if (eventDate instanceof Date) {
      const year = eventDate.getFullYear()
      const month = String(eventDate.getMonth() + 1).padStart(2, '0')
      const day = String(eventDate.getDate()).padStart(2, '0')
      normalizedEventDate = `${year}-${month}-${day}`
    }

    // เมื่อวาน
    if (normalizedEventDate < currentDate) {
      return 'เลยวันที่กิจกรรมแล้ว'
    }

    // อนาคต - ไม่มีข้อจำกัด
    if (normalizedEventDate > currentDate) {
      return ''
    }

    // วันนี้ - เช็คเวลา
    const [eventHour, eventMinute] = eventTime.split(':').map(Number)
    const currentHour = thaiTime.getUTCHours()
    const currentMinute = thaiTime.getUTCMinutes()

    const eventTimeInMinutes = eventHour * 60 + eventMinute
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // เลยเวลาแล้ว
    if (currentTimeInMinutes >= eventTimeInMinutes) {
      return 'เลยเวลากิจกรรมแล้ว'
    }

    // ใกล้เวลา (ภายใน 30 นาที)
    if (currentTimeInMinutes >= (eventTimeInMinutes - 30)) {
      return 'ใกล้เวลากิจกรรม (ภายใน 30 นาที)'
    }

    // ยังไม่ถึงเวลา ก่อน 30 นาที - ไม่มีข้อจำกัด
    return ''

  } catch (error) {
    return ''
  }
}