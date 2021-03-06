import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/components/Welcome'
import Index from '@/components/Index'
import Inner from '@/components/Inner'
import ToolsAndPagination from '@/components/ToolsAndPagination'
import Article from '@/components/Article'
import ShowArticle from '@/components/ShowArticle'
import Manager from '@/components/Manager'
import Chart from '@/components/Chart'
import ManagerLogin from '@/components/ManagerLogin'
import ManagerIndex from '@/components/ManagerIndex'
import DeleteArticle from '@/components/DeleteArticle'
import ChangeArticle from '@/components/ChangeArticle'
import DeleteTools from '@/components/DeleteTools'
import AddTool from '@/components/AddTool'
import ChangeTool from '@/components/ChangeTool'
import TypePrecent from '@/components/TypePrecent'
import Liulang from '@/components/Liulang'
import HuanYing from '@/components/HuanYing'
import MapL from '@/components/Map'
import ChangePwd from '@/components/ChangePwd'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Welcome
    },
    {
      path: '/blog',
      component: Index,
      children: [
        {
          path: 'main',
          component: Inner,
          children: [
            {
              path: 'article',
              component: Article
            },
            {
              path: 'tools',
              component: ToolsAndPagination
            }
          ]
        },
        {
          path: '/chart',
          component: Chart
        },
        {
          path: '/article/:id',
          component: ShowArticle,
          props: true
        },
        {
          path: '/manager',
          component: Manager
        }
      ]
    },
    {
      path: '/managerlogin',
      component: ManagerLogin
    },
    {
      path: '/managerindex',
      component: ManagerIndex,
      beforeEnter: (to, from, next) => {
        if (localStorage.flag) {
          next()
        } else {
          next('/managerlogin')
        }
      },
      children: [
        {
          path: '/addarticle',
          component: Manager
        },
        {
          path: '/deletearticle',
          component: DeleteArticle
        },
        {
          path: '/changearticle',
          component: ChangeArticle
        },
        {
          path: '/deletetools',
          component: DeleteTools
        },
        {
          path: '/addtool',
          component: AddTool
        },
        {
          path: '/changetool',
          component: ChangeTool
        },
        {
          path: '/typeprecent',
          component: TypePrecent
        },
        {
          path: '/liulang',
          component: Liulang
        },
        {
          path: '/huanying',
          component: HuanYing
        },
        {
          path: '/map',
          component: MapL
        },
        {
          path: '/changepwd',
          component: ChangePwd
        }
      ]
    }
  ]
})
