import axios from '@/libs/api.request'

export const getAllLog = ({page = 0, count = 9999, conditions = [], conditionConnection = "and"}) => {
  return axios.request({
    url: '/fundApi/v1/operationLog/list',
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
