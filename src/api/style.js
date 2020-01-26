import axios from '@/libs/api.request'

export const getDispms = (id) => {
  return axios.request({
    url: '/api/dispm/' + id,
    method: 'get'
  })
}

export const getStyleInfo = (id) => {
  return axios.request({
    url: '/api/style/' + id,
    method: 'get'
  })
}

export const getStyleDisp = (id) => {
  return axios.request({
    url: '/api/style/dispms/' + id,
    method: 'get'
  })
}

export const getStyle = (styleNumber, isPromote) => {
  return axios.request({
    url: '/api/style/promote',
    method: 'get',
    params: {
      styleNumber: styleNumber,
      isPromote: isPromote
    }
  })
}

export const delDispm = (id) => {
  return axios.request({
    url: '/api/dispm/' + id,
    method: 'delete'
  })
}

export const getAllStyle = ({ page, count, queryId, queryString }) => {
  return axios.request({
    url: '/api/styles/',
    method: 'get',
    params: {
      query: queryId,
      queryString: queryString,
      page: page,
      count: count
    }
  })
}
export const updateStyle = (sid, data, mode, update) => {
  return axios.request({
    url: '/api/style/new',
    method: 'post',
    params: {
      styleId: sid,
      mode: mode,
      update: update
    },
    data: data
  })
}
export const deleteStyle = (id) => {
  return axios.request({
    url: '/api/style/styleNumber/' + id,
    method: 'delete'
  })
}

export const deleteDispm = (id) => {
  return axios.request({
    url: '/api/dispm/' + id,
    method: 'delete'
  })
}

export const changeStyle = (data) => {
  return axios.request({
    url: '/api/style',
    method: 'post',
    data: data
  })
}

export const newStyle = (styleType) => {
  return axios.request({
    url: '/api/style',
    method: 'get',
    params: {
      styleType: styleType
    }
  })
}
