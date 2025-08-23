import axios from 'axios';
import config from '@/config'
import { logout } from '@/utils/auth' // Import logout utility

const instance = () => {
    const token = localStorage.getItem('token')
    const Keyapi = localStorage.getItem('keyapi')
    const api = axios.create({
        baseURL: config.payload,
    })

    // Interceptor สำหรับแนบ Header อัตโนมัติ
    api.interceptors.request.use((cfg) => {
        cfg.headers['Authorization'] = `Bearer ${token}`
        cfg.headers['f-api-key'] = Keyapi
        cfg.headers['Content-Type'] = 'application/json'
        cfg.headers['Cache-Control'] = 'no-cache'

        return cfg
    }, (error) => {
        return Promise.reject(error)
    })

    // Response Interceptor for unauthorized access
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logout(); // Call logout utility
            }
            return Promise.reject(error);
        }
    );

    return api
}

export default instance;
