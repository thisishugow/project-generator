import request from '@/utils/request'

export function queryColumnList(table_name) {
  return request({
    url: '/query/columns',
    method: 'get',
    headers: { 'accept': 'application/json'},
    params: {table_name}
})
}
