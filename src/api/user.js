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

export const getVerCode = (data) => {
  return axios.request({
    url: '/api/smsVerify/sendIdentifyCode',
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

export const adminChangePsw = (data, newPsw) => {
  return axios.request({
    url: '/api/user/changePassword',
    data: data,
    params: {
      新密码: newPsw
    },
    method: 'post'
  })
}

export const switchUserUsable = (id) => {
  return axios.request({
    url: '/api/user/status/' + id,
    method: 'put'
  })
}

export const getUserInfo = (id) => {
  return axios.request({
    // url: '/api/users/' + id,
    url: '/fundApi/v1/user/query/' + id,
    method: 'get'
  })
}

export const deleteUser = (id) => {
  return axios.request({
    url: '/api/user/' + id,
    method: 'delete'
  })
}

export const getRoleInfo = (id) => {
  return axios.request({
    url: '/api/user/role/' + id,
    method: 'get'
  })
}

export const getAllUser = ({page, count, query, queryString}) => {
  return axios.request({
    url: '/api/users',
    method: 'get',
    params: {
      query: query,
      queryString: queryString,
      page: page,
      count: count
    }
  })
}

export const addUserRole = (uid, roleData) => {
  return axios.request({
    url: '/api/user/addRole',
    method: 'post',
    data: {
      collectionIds: [roleData],
      ids: [uid]
    }
  })
}
export const delUserRole = (uid, roleIds) => {
  return axios.request({
    url: '/api/user/delete/' + uid,
    method: 'post',
    data: roleIds
  })
}
export const registryUser = (userInfo) => {
  return axios.request({
    url: '/api/user/registry',
    method: 'post',
    data: userInfo
  })
}

export const updateUser = (userInfo) => {
  return axios.request({
    url: '/api/user',
    method: 'post',
    data: userInfo
  })
}

export const updateRole = (roleid, userid) => {
  return axios.request({
    url: '/api/user/updateRole',
    method: 'post',
    params: {
      roleId: roleid,
      userId: userid
    }
  })
}

export const getUserMaxPer = (id) => {
  return axios.request({
    url: '/api/user/assgin/' + id,
    method: 'get'
  })
}

export const getCurUser = () => {
  return axios.request({
    url: '/api/user/currentUser',
    method: 'get'
  })
}
