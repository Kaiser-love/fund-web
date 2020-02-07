import axios from '@/libs/api.request'

export const getTaskTypes = () => {
  return axios.request({
    url: '/fundApi/v1/meta/taskTypes',
    method: 'get'
  })
}
export const getOcrTypes = () => {
  return axios.request({
    url: '/fundApi/v1/meta/ocrTypes',
    method: 'get'
  })
}
export const getEnumTypes = (type) => {
  return axios.request({
    url: '/fundApi/v1/meta/enumTypes/' + type,
    method: 'get'
  })
}

