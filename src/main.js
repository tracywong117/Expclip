import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import Home from './views/home.vue'
import Books from './views/books.vue'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import {createRouter, createWebHashHistory} from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/books',
    name: 'Books',
    component: Books,
  },
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