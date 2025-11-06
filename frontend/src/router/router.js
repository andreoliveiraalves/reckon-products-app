import { createRouter, createWebHistory } from 'vue-router'
import LoginVue from '../views/Login.vue'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginVue
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router