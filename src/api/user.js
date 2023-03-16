import request from '@/utils/request'
import qs from 'qs'

export function login(data) {
  
  return request({
    url: '/v1.0/users/login',
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data),
    withCredentials: true,
    crossDomain: true,
    maxRedirects: 0,
    validateStatus: function(status) {
        return status >= 200 && status < 303;
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/v1.0/users/me',
    method: 'get',
    headers: { 'accept': 'application/json',
                'Authorization': 'Bearer '+token
              },
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/v1.0/user/logout',
    method: 'post',
    headers: {'accept': 'application/json'}
  })
}
