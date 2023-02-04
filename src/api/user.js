import request from '@/utils/request'
import qs from 'qs'

export function login(data) {
  
  return request({
    url: '/token',
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data)
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    headers: { 'accept': 'application/json',
                'Authorization': 'Bearer '+token
              },
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post',
    headers: {'accept': 'application/json'}
  })
}
