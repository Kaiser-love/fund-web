import axios from '@/libs/api.request'

export const getAllViolateModel = ({page = 0, count = 9999, conditions = [], conditionConnection = null}) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/list',
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
export const getModelMenu = () => {
  return axios.request({
    url: '/fundApi/v1/violateModel/modelMenu',
    method: 'get',
  })
}
export const createOrUpdateModelCategory = (id, modelCategoryName) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/modelCategory/createOrUpdate/' + id,
    method: 'get',
    params: {
      modelCategoryName: modelCategoryName
    }
  })
}
export const deleteModelCategory = (id) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/modelCategory/delete/' + id,
    method: 'delete'
  })
}
export const createOrUpdateViolateModel = (id, modelCategoryId, modelName) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/createOrUpdate/' + id,
    method: 'get',
    params: {
      modelCategoryId: modelCategoryId,
      modelName: modelName
    }
  })
}
export const deleteViolateModel = (id) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/delete/' + id,
    method: 'delete'
  })
}
export const trainModel = (id) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/trainModel/' + id,
    method: 'get'
  })
}
export const predictTag = (id, testText) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/predictTag/' + id,
    method: 'get',
    params: {
      testText: testText
    }
  })
}
export const getAnnotationDataList = (page, count = 10, modelId) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/annotationDataList',
    method: 'get',
    params: {
      page: page,
      count: count,
      modelId: modelId
    }
  })
}
export const updateAnnotationData = (modelId, annotationDataId, data) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/update',
    method: 'post',
    params: {
      modelId: modelId,
      annotationDataId: annotationDataId
    },
    data: data
  })
}

export const addAnnotationData = (modelId, annotationDataId) => {
  return axios.request({
    url: '/fundApi/v1/violateModel/addAnnotationData',
    method: 'post',
    params: {
      modelId: modelId,
      annotationDataId: annotationDataId
    },
  })
}
