import axios from '../libs/api.request'

export const getCycleJobs = ({page, count, conditions = [], conditionConnection = "and"}) => {
  return axios.request({
    url: '/cycleJobApi/v1/cycleJob/list',
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
export const createOrUpdate = (data) => {
  return axios.request({
    url: '/cycleJobApi/v1/cycleJob/createOrUpdate',
    method: 'post',
    data: data
  })
}
export const deleteCycleJob = (id) => {
  return axios.request({
    url: '/cycleJobApi/v1/cycleJob/delete/' + id,
    method: 'delete'
  })
}
