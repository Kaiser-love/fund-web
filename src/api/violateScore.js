import axios from '@/libs/api.request'

export const calculateViolateScore = (startTime = null, endTime = null, type, conditionIds = []) => {
  return axios.request({
    url: '/fundApi/v1/violate/app/score',
    method: 'post',
    data: {
      startTime: startTime,
      endTime: endTime,
      type: type,
      conditionIds: conditionIds,
    }
  })
}
export const calculateViolateScoreTendency = (startTime = null, endTime = null, type, conditionIds = []) => {
  return axios.request({
    url: '/fundApi/v1/violate/app/score/tendency',
    method: 'post',
    data: {
      startTime: startTime,
      endTime: endTime,
      type: type,
      conditionIds: conditionIds,
      statisticType: 1
    }
  })
}


export const calculateViolateScoreRanking = (startTime = null, endTime = null, type, conditionIds = []) => {
  return axios.request({
    url: '/fundApi/v1/violate/app/score/ranking',
    method: 'post',
    data: {
      startTime: startTime,
      endTime: endTime,
      type: type,
      conditionIds: conditionIds,
    }
  })
}
