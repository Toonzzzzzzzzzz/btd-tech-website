import router from '@/routes'
import Swal from 'sweetalert2'

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('keyapi')
  // Optionally, show a message to the user
  Swal.fire({
    title: 'เซสชันหมดอายุ',
    text: 'คุณถูกออกจากระบบเนื่องจากมีการเข้าสู่ระบบจากที่อื่น',
    icon: 'warning',
    confirmButtonText: 'ตกลง'
  }).then(() => {
    router.push('/login')
  })
}
