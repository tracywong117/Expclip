import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './index.css'

import {createRouter, createWebHistory} from 'vue-router'

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
    path: '/books/:id',
    name: 'BookInstance',
    component: () => import('./views/bookInstance.vue'), // Ensure this component exists
    props: true
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
  }
];
 
const router = createRouter({
  history: createWebHistory('/Expclip/'),
  routes,
})
 
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

router.beforeEach((to, from, next) => {
  document.title = "Expclip - " + to.name;
  next();
});