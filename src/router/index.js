import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: 'Example', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'table',
        name: 'Table',
        component: () => import('@/views/table/index'),
        meta: { title: 'Table', icon: 'table' }
      },
      {
        path: 'tree',
        name: 'Tree',
        component: () => import('@/views/tree/index'),
        meta: { title: 'Tree', icon: 'tree' }
      }
    ]
  },

  {
    path: '/form',
    component: Layout,
    hidden: true   ,
    children: [
      {
        path: 'index',
        name: 'Form',
        component: () => import('@/views/form/index'),
        meta: { title: 'Form', icon: 'form' }
      }
    ]
  },

  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: {
      title: 'Nested',
      icon: 'nested'
    },
    children: [
      {
        path: 'menu1',
        component: () => import('@/views/nested/menu1/index'), // Parent router-view
        name: 'Menu1',
        meta: { title: 'Menu1' },
        children: [
          {
            path: 'menu1-1',
            component: () => import('@/views/nested/menu1/menu1-1'),
            name: 'Menu1-1',
            meta: { title: 'Menu1-1' }
          },
          {
            path: 'menu1-2',
            component: () => import('@/views/nested/menu1/menu1-2'),
            name: 'Menu1-2',
            meta: { title: 'Menu1-2' },
            children: [
              {
                path: 'menu1-2-1',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                name: 'Menu1-2-1',
                meta: { title: 'Menu1-2-1' }
              },
              {
                path: 'menu1-2-2',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                name: 'Menu1-2-2',
                meta: { title: 'Menu1-2-2' }
              }
            ]
          },
          {
            path: 'menu1-3',
            component: () => import('@/views/nested/menu1/menu1-3'),
            name: 'Menu1-3',
            meta: { title: 'Menu1-3' }
          }
        ]
      },
      {
        path: 'menu2',
        component: () => import('@/views/nested/menu2/index'),
        name: 'Menu2',
        meta: { title: 'menu2' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]


export const asyncRoutes = [
  // {
  //   path: '/permission',
  //   component: Layout,
  //   redirect: '/permission/page',
  //   alwaysShow: true, // will always show the root menu
  //   name: 'Permission',
  //   meta: {
  //     title: 'Permission',
  //     icon: 'lock',
  //     roles: ['admin', 'editor'] // you can set roles in root nav
  //   },
    // {
    //   path: '/markdown',
    //   component: Layout,
    //   redirect: '/markdown/markdown',
    //   alwaysShow: true, // will always show the root menu
    //   name: 'Markdown',
    //   meta: {
    //     title: 'Markdown',
    //     icon: 'link',
    //   },
    //   children: [
    //     {
    //       path: 'index',
    //       component: () => import('@/views/markdown/markdown'),
    //       name: 'Markdown',
    //       meta: { title: 'Markdown', icon: 'Markdown' },
    //       roles: ['admin'] // you can set roles in root nav

    //     }
    //   ]
    // },
    {
      path: 'external-link',
      component: Layout,
      hidden: true   ,
      children: [
        {
          path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
          meta: { title: 'External Link', icon: 'link', roles:['admin']}
        }
      ]
    },
    {
      path: '/pharm-bi',
      component: Layout,
      meta: { title: 'Pharm BI', icon: 'el-icon-s-data', roles:['admin']},
      hidden: false   ,
      children: [
        {
          path: 'pane',
          name: 'pharm-bi-pane',
          component: () => import('@/views/pharm-bi/index'),
          meta: { title: 'Pharm BI', icon: 'el-icon-s-data', roles:['admin']}
        },
        {
          path: 'flow-editor',
          name: 'flow-editor',
          component: () => import('@/views/pharm-bi/components/flow-editor'),
          meta: { title: 'Flow Editor', icon: 'el-icon-help', roles:['admin']}
        },
        {
          path: 'output',
          name: 'output',
          hidden: true,
          component: () => import('@/views/pharm-bi/components/output'),
          meta: { title: 'Output', icon: 'el-icon-help', roles:['admin']}
        },
      ]
    },
    {
      path: '/data-query',
      component: Layout,
      meta: { title: 'Data Query', icon: 'tree-table'},
      children: [
        {
          path: 'sample-data',
          name: 'drag-dialog',
          component: () => import('@/views/dragdialog/drag-dialog'),
          meta: { title: 'Sample Data', icon: 'form' , roles:['admin']}
        },
        {
          path: 'form-with-permission',
          name: 'Form-With-Permission',
          component: () => import('@/views/form/index'),
          meta: { title: 'Form-With-Permission', icon: 'form' , roles:['admin']}
        },
        {
          path: 'draglist',
          name: 'draglist',
          hidden: true, 
          component: () => import('@/views/draglist/dnd-list'),
          meta: { title: 'draglist', icon: 'form' , roles:['admin']}
        },
        {
          path: 'index',
          name: 'complex-table',
          hidden: true   ,
          component: () => import('@/views/dragdialog/data-table'),
          meta: { title: 'complex-table', icon: 'form' , roles:['admin']}
        },
      ]
    },
   ]

export const  notFound = [{ path: '*', redirect: '/404', hidden: true }]
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
