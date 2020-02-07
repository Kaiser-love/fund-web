import axios from '@/libs/api.request'

export const getAllViolationRule = ({page = 0, count = 9999, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/violationRule/list',
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
export const deleteViolationRule = (id) => {
  return axios.request({
    url: '/fundApi/v1/violationRule/delete/' + id,
    method: 'delete'
  })
}
export const createOrUpdateViolationRule = (data) => {
  return axios.request({
    url: '/fundApi/v1/violationRule/createOrUpdate',
    method: 'post',
    data: data
  })
}
export const getViolationRulesByItemId = ({page = 0, count = 9999, id, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/violationRule/list/' + id,
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
