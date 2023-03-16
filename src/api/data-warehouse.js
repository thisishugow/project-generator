import request from '@/utils/request';
import qs from 'qs';
import zlib from 'zlib';

export function dataWarehouse(data) {
  
    return request({
      url: '/v1.0/db/query',
      method: 'post',
        headers: {
            'content-type': 'application/json',
            'Content-Encoding': 'deflate',
        },
      data: zlib.deflateSync(JSON.stringify(data)),
      crossDomain: true,
    })
  }


export function getPool(table, column) {

  return request({
    url: '/v1.0/db/get_pool',
    method: 'get',
    params:{
      table_name:table,
      column_name:column,
    },
    crossDomain: true,
  })
}