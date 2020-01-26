import axios from '../libs/api.request'


export const getAllCycleJob = ({page, count, query, queryString}) => {
  return axios.request({
    url: '/api/cyclejobs',
    method: 'get',
    params: {
      query: query,
      queryString: queryString,
      page: page,
      count: count
    }
  })
}

export const updateCycleJob = (data) => {
  return axios.request({
    url: '/api/cyclejob',
    method: 'post',
    data: data
  })
}

export const deleteCyclejobs = (id) => {
  return axios.request({
    url: '/api/cyclejob/' + id,
    method: 'delete'
  })
}

export const scanShoptag = (data) => {
  return axios.request({
    url: '/api/shop/cyclejob',
    method: 'put',
    data: data,
    params: {
      mode: 1
    }
  })
}

export const flushShoptag = (data) => {
  return axios.request({
    url: '/api/shop/cyclejob',
    method: 'put',
    data: data,
    params: {
      mode: 0
    }
  })
}

export const getCalShoptag = (data) => {
  return axios.request({
    url: '/api/shop/cyclejob',
    method: 'put',
    data: data,
    params: {
      mode: 2
    }
  })
}
