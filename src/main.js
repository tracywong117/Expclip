import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'

import './index.css'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import {createRouter, createWebHashHistory} from 'vue-router'
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/home.vue')
  },
  {
    path: '/books',
    name: 'Books',
    component: () => import('./views/books.vue')
  },
  {
    path: '/quotes',
    name: 'Quotes',
    component: () => import('./views/quotes.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('./views/statistics.vue')
  },
  {
    path: '/export',
    name: 'Export',
    // component: () => import('./views/export.vue')
  },
  {
    path: '/about',
    name: 'About',
    // component: () => import('./views/about.vue')
  }

]
 
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
 
const app = createApp(App)
app.use(router)
app.mount('#app')

router.beforeEach((to, from, next) => {
  document.title = "Expclip - " + to.name;
  next();
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}