import Vue from 'vue';
import Router from 'vue-router';

import Main from '@/views/Main'

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: '主页',
            component: Main,
            leaf: false,
            hidden: true
        },
        {
            path: '/conf',
            component: Main,
            name: '配置中心',
            meta: {title: '配置中心', icon: 'el-icon-menu'},
            children: [
                {
                    path: 'system',
                    component: () => import('@/views/conf/system/index'),
                    name: '系统配置设置',
                    meta: {title: '系统配置设置', icon: ''},
                    children: [
                        {
                            path: 'menu1',
                            component: () => import('@/views/conf/system/menu'),
                            name: '菜单管理',
                            meta: {title: '菜单管理', icon: ''}
                        },
                        {
                            path: 'admin',
                            component: () => import('@/views/conf/system/admin'),
                            name: '账号管理',
                            meta: {title: '账号管理', icon: ''}
                        }
                    ]
                },
                {
                    path: 'sdkconf',
                    component: () => import('@/views/conf/sdkconf/index'),
                    name: 'SDK配置设置',
                    meta: {title: 'SDK配置设置', icon: ''},
                    children: [
                        {
                            path: 'apkUpdateConf',
                            component: () => import('@/views/conf/sdkconf/apkUpdateConf'),
                            name: '强更信息管理',
                            meta: { title: '强更信息管理', icon: ''  }
                        },
                        {
                            path: 'sdkExitPopup',
                            component: () => import('@/views/conf/sdkconf/sdkExitPopup'),
                            name: '退弹信息管理',
                            meta: { title: '退弹信息管理', icon: ''  }
                        }
                    ]
                }
            ]
        }
    ]
});
