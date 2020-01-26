import axios from '@/libs/api.request'

export const getAllTable = () => {
  return axios.request({
    url: '/api/common/database',
    method: 'get',
    params: {
      mode: 1
    }
  })
}
