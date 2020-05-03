import axios from '@/libs/api.request'

export const login = ({userName, password}) => {
  return axios.request({
    // url: 'http://47.107.139.6:8086/user/login',
    url: '/fundApi/v1/user/login',
    data: {
      userName: userName,
      password: password
    },
    method: 'post'
  })
}
export const getUsers = ({page = 0, count = 9999, conditions = [], conditionConnection = "and"}) => {
  return axios.request({
    url: '/fundApi/v1/user/list',
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
export const deleteUsers = (id) => {
  return axios.request({
    url: '/fundApi/v1/user/delete/' + id,
    method: 'delete'
  })
}
export const createOrUpdateUser = (data) => {
  return axios.request({
    url: '/fundApi/v1/user/createOrUpdate',
    method: 'post',
    data: data
  })
}


export const SMSlogin = (data) => {
  return axios.request({
    url: '/api/smsVerify/identifyCode',
    data: data,
    method: 'post'
  })
}

export const changePsw = (data) => {
  return axios.request({
    url: '/fundApi/v1/user/changeOwnPassword',
    data: data,
    method: 'post'
  })
}


export const getUserInfo = (id) => {
  return axios.request({
    // url: '/api/users/' + id,
    url: '/fundApi/v1/user/query/' + id,
    method: 'get'
  })
}


export const getRoleInfo = (id) => {
  return axios.request({
    url: '/api/user/role/' + id,
    method: 'get'
  })
}
