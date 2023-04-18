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


export function execStmt(data, limit){
  return request({
    url:'/v1.0/db/exec_stmt',
    method: 'post',
    data : JSON.stringify(data),
    params:{
      limit:limit,
    },
    crossDomain: true,
    timeout: 120000,
  }

  )
}

export function getDashboardList(userId, jobId=-1){
  let params = {}
  if(jobId>0){
    params = {job_id:jobId, update_by:userId}
  }else{
    params = {update_by:userId}
  }
  return request(
    { url:'/v1.0/db/get_dashboard_list',
      method:'get',
      //data: zlib.deflateSync(JSON.stringify(data)),
      params: params,
      crossDomain:true,
      timeout: 120000,
    }
  )
}


/**
 * Dashboard data.
 *
 * @typedef {Object} DashboardData
 * @property {number} job_id - The ID of the job.
 * @property {string} sv_name - The name of the service.
 * @property {string} sv_ver - The version of the service.
 * @property {string} status - The status of the dashboard.
 * @property {string} json_file - The JSON file associated with the dashboard.
 */

/**
 * Creates a new dashboard.
 *
 * @param {DashboardData} data - The dashboard data.
 * @returns {Promise<object>} - A Promise object containing the new dashboard data.
 * @throws {Error} - If an error occurs, an error is thrown.
 */
export function createDashboard(data){

  return request(
    { url:'/v1.0/db/create_dashboard',
      method:'post',
      data: zlib.deflateSync(JSON.stringify(data)),
      crossDomain:true,
      timeout: 120000,
    }
  )
}

export function updateDashboardInfo(id, data){
  return request(
    {
      url:'/v1.0/db/update_dashboard_info',
      method:'put',
      data: JSON.stringify(data),
      params:{ id: id},
      crossDomain: true,
      timeout:5000,
    }
  )
}


/**
 * Overwrites an existing dashboard.
 *
 * @param {string} id - The ID of the dashboard.
 * @param {Object} data - An object containing the dashboard data.
 * @param {string} data.json_file - The JSON file associated with the dashboard.
 * @returns {Promise<Object>} - A Promise object containing the updated dashboard data.
 * @throws {Error} - If an error occurs, an error is thrown.
 */
export function overwriteDashboard(id, data){
  return request(
    {
      url:'/v1.0/db/overwrite_dashboard',
      method:'put',
      data: zlib.deflateSync(JSON.stringify(data)),
      params:{ id: id},
      crossDomain: true,
      timeout:120000,
    }
  )
}
/**
 * Gets dashboard data.
 * 
 * @param {string} id - The ID of the dashboard.
 * @returns {Promise<object>} - A Promise object containing the dashboard data.
 * @throws {Error} - If an error occurs, an error is thrown.
 */
export function getDashboard(id){
  return request(
    {
      url:'/v1.0/db/get_dashboard',
      method:'get',
      params:{id:id},
      crossDomain:true,
      timeout:5000
    }
  )
}


export function deleteDashboard(id){
  return request(
    {
      url:'/v1.0/db/delete_dashboard',
      method:'delete',
      params:{id:id},
      crossDomain:true,
      timeout:5000
    }
  )
}