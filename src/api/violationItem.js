import axios from '@/libs/api.request'

export const getAllViolationItem = ({page = 0, count = 9999, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/violationItem/list',
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
export const deleteViolationItem = (id) => {
  return axios.request({
    url: '/fundApi/v1/violationItem/delete/' + id,
    method: 'delete'
  })
}
export const createOrUpdateViolationItem = (data) => {
  return axios.request({
    url: '/fundApi/v1/violationItem/createOrUpdate',
    method: 'post',
    data: data
  })
}
