import axios from '@/libs/api.request'

export const getRouterReq = (access) => {
  return axios.request({
    url: '/api/get_router',
    params: {
      access
    },
    method: 'get'
  })
}
