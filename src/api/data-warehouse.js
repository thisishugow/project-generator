import request from '@/utils/request';
import qs from 'qs';
import zlib from 'zlib';

export function dataWarehouse(table_name, data, page, page_size) {
  
    return request({
      url: '/v1.0/db/query',
      method: 'post',
        headers: {
            'content-type': 'application/json',
            'Content-Encoding': 'deflate',
        },
      data: zlib.deflateSync(JSON.stringify(data)),
      params:{
        table_name:table_name,
        page:page,
        page_size:page_size,
      },
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