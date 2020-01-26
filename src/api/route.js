import axios from '@/libs/api.request'

export const getAllRoute = ({ page, count, queryId, queryString }) => {
  return axios.request({
    url: '/api/routers',
    method: 'get',
    params: {
      query: queryId,
      queryString: queryString,
      page: page,
      count: count
    }
  })
}
export const updateRouter = (data) => {
  return axios.request({
    url: '/api/router',
    method: 'post',
    data: data
  })
}
export const changeRoute = (sq, sqs, tq, tqs) => {
  return axios.request({
    url: '/api/router/change',
    method: 'put',
    params: {
      sourceQuery: sq,
      sourceQueryString: sqs,
      targetQuery: tq,
      targetQueryString: tqs
    }
  })
}

export const scanRoute = (data, mode) => {
  return axios.request({
    url: '/api/router/scan',
    method: 'put',
    params: {
      mode: mode
    },
    data: data
  })
}

export const scanAll = () => {
  return axios.request({
    url: '/api/routers/scan',
    method: 'put'
  })
}

export const settingRoute = (data) => {
  return axios.request({
    url: '/api/router/setting',
    method: 'put',
    data: data
  })
}

export const testRouter = (data, barCode, channelId, hardVersion, mode) => {
  return axios.request({
    url: '/api/router/test',
    method: 'put',
    params: {
      barCode: barCode,
      channelId: channelId,
      hardVersion: hardVersion,
      mode: mode
    },
    data: data
  })
}

export const removeRouter = (data) => {
  return axios.request({
    url: '/api/router/remove',
    method: 'put',
    data: data
  })
}
