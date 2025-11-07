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

    // Fallback for invalid routes
    { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// ------------------ ROUTER GUARD ------------------
// Controls access based on authentication status
router.beforeEach(async (to, from, next) => {
    const publicPages = ['Login', 'Register']
    const authRequired = !publicPages.includes(to.name)

    const isAuthenticated = sessionStorage.getItem('auth') === 'true'
    const token = localStorage.getItem('token')

    // ✅ If user tries to access Login/Register but is already authenticated → redirect to dashboard
    if (isAuthenticated && publicPages.includes(to.name)) {
        return next({ name: 'Dashboard' })
    }

    // If page doesn't require auth → allow
    if (!authRequired) return next()

    // If we already know user is authenticated → allow
    if (isAuthenticated) return next()

    // Otherwise, validate with backend
    try {
        const response = await fetch('https://reckon-products-app.onrender.com/auth/validate', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        })

        const data = await response.json()

        if (data.authenticated) {
            sessionStorage.setItem('auth', 'true')
            return next()
        } else {
            sessionStorage.removeItem('auth')
            return next({ name: 'Login' })
        }
    } catch (err) {
        console.error('Auth check failed:', err)
        sessionStorage.removeItem('auth')
        return next({ name: 'Login' })
    }
})

export default router
