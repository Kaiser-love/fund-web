import axios from '@/libs/api.request'

export const getLicense = () => {
  return axios.request({
    url: '/api/license/',
    method: 'get'
  })
}

export const getServerInfos = (osName) => {
  return axios.request({
    url: '/api/license/getServerInfos?osName=' + osName,
    method: 'get'
  })
}
