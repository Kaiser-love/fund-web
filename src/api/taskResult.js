import axios from '../libs/api.request'

export const getTaskResults = ({page, count, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/taskResult/list',
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
export const deleteTaskResult = (id) => {
  return axios.request({
    url: '/fundApi/v1/taskResult/delete/' + id,
    method: 'delete'
  })
}

export const createOrUpdateTaskResult = (data) => {
  return axios.request({
    url: '/fundApi/v1/taskResult/createOrUpdate',
    method: 'post',
    data: data
  })
}
