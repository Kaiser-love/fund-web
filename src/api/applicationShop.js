import axios from '@/libs/api.request'

export const getAllApplicationShop = ({page = 0, count = 9999, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/applicationShop/list',
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
export const deleteApplicationShop = (id) => {
  return axios.request({
    url: '/fundApi/v1/applicationShop/delete/' + id,
    method: 'delete'
  })
}
export const createOrUpdateApplicationShop = (data) => {
  return axios.request({
    url: '/fundApi/v1/applicationShop/createOrUpdate',
    method: 'post',
    data: data
  })
}
