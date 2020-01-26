import axios from '@/libs/api.request'

export const getAllGood = ({ page, count, queryId, queryString }) => {
  return axios.request({
    url: '/api/goods/',
    method: 'get',
    params: {
      query: queryId,
      queryString: queryString,
      page: page,
      count: count
    }
  })
}

export const downloadGoodsCsv = () => {
  return axios.request({
    url: '/api/common/database/exportCsvDataFile?tableName=goods',
    method: 'get'
  })
}

export const cronUpdate = (cron, filepath, mode, shopNumber, cyclejobId) => {
  return axios.request({
    url: '/api/good/schedule',
    method: 'get',
    params: {
      shopId: shopNumber,
      cron: cron,
      rootFilePath: filepath,
      mode: mode,
      cyclejobId: cyclejobId
    }
  })
}

export const getBindedTags = ({ queryId, queryString }) => {
  return axios.request({
    url: '/api/good/binded',
    method: 'get',
    params: {
      query: queryId,
      connection: '=',
      queryString: queryString
    }
  })
}

export const getGood = (id) => {
  return axios.request({
    url: '/api/goods/' + id,
    method: 'get'
  })
}

export const updateGood = (data) => {
  return axios.request({
    url: '/api/good/',
    method: 'post',
    data: data
  })
}

export const submitUpdate = (data) => {
  return axios.request({
    url: '/api/good/update',
    method: 'put',
    data: {
      item: data
    }
  })
}
export const deleteGood = (id) => {
  return axios.request({
    url: '/api/good/' + id,
    method: 'delete'
  })
}

export const searchGood = (data, page, count) => {
  return axios.request({
    url: '/api/goods/search',
    method: 'post',
    data: data,
    params: {
      count: count,
      connection: '=',
      page: page
    }
  })
}
