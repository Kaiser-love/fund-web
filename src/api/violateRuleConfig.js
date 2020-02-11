import axios from '@/libs/api.request'

export const getAllViolateRuleConfigs = ({appId = null, appShopId = null}) => {
  return axios.request({
    url: '/fundApi/v1/violate/app/configs',
    method: 'get',
    params: {
      appId: appId,
      appShopId: appShopId,
    }
  })
}
export const createOrUpdateViolateRuleConfigs = (data) => {
  return axios.request({
    url: '/fundApi/v1/violate/app/configs/createOrUpdate',
    method: 'post',
    data: data
  })
}
