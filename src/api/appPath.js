import axios from '../libs/api.request'

export const getAppPaths = ({page, count, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/appPath/list',
    method: 'post',
    data: {
      page: page,
      count: count,
      orderBy: "create_time",
      sortType: "desc",
      conditionConnection: conditionConnection,
      conditions: conditions
    }
  })
}
export const createOrUpdateAppPath = (data) => {
  return axios.request({
    url: '/fundApi/v1/appPath/createOrUpdate',
    method: 'post',
    data: data
  })
}
export const deleteAppPath = (id) => {
  return axios.request({
    url: '/fundApi/v1/appPath/delete/' + id,
    method: 'delete'
  })
}
