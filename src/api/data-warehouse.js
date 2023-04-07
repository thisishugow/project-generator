import request from '@/utils/request';
import qs from 'qs';
import zlib from 'zlib';

export function dataWarehouse(table_name, data, page, page_size, sort_columns) {
  
    return request({
      url: '/v1.0/db/query',
      method: 'post',
        headers: {
            'content-type': 'application/json',
            'Content-Encoding': 'deflate',
        },
      data: zlib.deflateSync(JSON.stringify({data:data, sort_columns:sort_columns})),
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


export function getColumns(table_name, has_type=false) {
  
  return request({
    url: '/v1.0/db/col_names',
    method: 'get',
    params:{
      table_name:table_name,
      has_type: has_type,
    },
    crossDomain: true,
  })
}

export function getStmt(table_name, data) {
  
  return request({
    url: '/v1.0/db/stmt',
    method: 'post',
    data:zlib.deflateSync(JSON.stringify({data:data, sort_columns:''})),
    params:{
      table_name:table_name,
    },
    crossDomain: true,
  })
}

export function makeGroupby( data) {
  
  return request({
    url: '/v1.0/db/operation/groupby',
    method: 'post',
    data:JSON.stringify(data),
    crossDomain: true,
  })
}

export function makeJoin( data) {
  
  return request({
    url: '/v1.0/db/operation/join',
    method: 'post',
    data:JSON.stringify(data),
    crossDomain: true,
  })
}



export function makePivot( data) {
  
  return request({
    url: '/v1.0/db/pivot',
    method: 'post',
    data:JSON.stringify(data),
    crossDomain: true,
  })
}


export function dataProcess( data) {
  
  return request({
    url: '/v1.0/db/data_process',
    method: 'post',
    data:JSON.stringify(data),
    crossDomain: true,
  })
}