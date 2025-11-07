import { createRouter, createWebHistory } from 'vue-router'

// Dynamic imports for code-splitting
const LoginView = () => import('../views/Login.vue')
const RegisterView = () => import('../views/Register.vue')
const DashboardView = () => import('../views/Dashboard.vue')

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/register', name: 'Register', component: RegisterView },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView },

    //falback guard to match any invalid path
    { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// ------------------ ROUTER GUARD ------------------
// This ensures the backend confirms if the JWT in the cookie is valid.
router.beforeEach(async (to, from, next) => {
    // Only check authentication for protected routes
    const publicPages = ['Login', 'Register']
    const authRequired = !publicPages.includes(to.name)

    if (!authRequired) {
        // For public routes, proceed immediately
        return next()
    }

    try {
        // Ask backend if user is authenticated
        const response = await fetch('https://reckon-products-app.onrender.com/auth/validate', {
            method: 'GET',
            credentials: 'include' // send cookies with request
        })

        const data = await response.json()

        if (data.authenticated) {
            // User is authenticated, continue to dashboard or other protected page
            return next()
        } else {
            // Token invalid or missing — redirect to login
            return next({ name: 'Login' })
        }
    } catch (error) {
        console.error('Auth check failed:', error)
        return next({ name: 'Login' })
    }
})

export default router