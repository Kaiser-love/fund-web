import axios from '@/libs/api.request'

export const getAllAnnotationData = ({page = 0, count = 9999, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/annotationData/list',
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
export const deleteAnnotationData = (id) => {
  return axios.request({
    url: '/fundApi/v1/annotationData/delete/' + id,
    method: 'delete'
  })
}
export const createOrUpdateAnnotationData = (data) => {
  return axios.request({
    url: '/fundApi/v1/annotationData/createOrUpdate',
    method: 'post',
    data: data
  })
}

