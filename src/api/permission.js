import axios from '@/libs/api.request'

export const getAllPermissions = () => {
  return axios.request({
    url: '/api/permissions',
    method: 'get'
  })
}
