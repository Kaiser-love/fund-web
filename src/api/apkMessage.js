import axios from '@/libs/api.request'

export const getAllApkMessage = ({page = 0, count = 9999, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/apkMessage/list',
    method: 'post',
    data: {
      page: page,
      count: count,
      orderBy: "create_time",
      conditionConnection: conditionConnection,
      conditions: conditions
    }
  })
}
export const deleteApkMessage = (id) => {
  return axios.request({
    url: '/fundApi/v1/apkMessage/delete/' + id,
    method: 'delete'
  })
}
export const createOrUpdateApkMessage = (data) => {
  return axios.request({
    url: '/fundApi/v1/apkMessage/createOrUpdate',
    method: 'post',
    data: data
  })
}
export const getAppMenu = () => {
  return axios.request({
    url: '/fundApi/v1/apkMessage/menu',
    method: 'get'
  })
}

