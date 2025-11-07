import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'

// Dynamic imports for code-splitting
const LoginView = () => import('../views/Login.vue')
const RegisterView = () => import('../views/Register.vue')
const DashboardView = () => import('../views/Dashboard.vue')

const routes = [
    {
        path: '/',
        redirect: '/login' // Redirect root path to login
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView
    },
    {
        // Optional: catch-all route for unknown URLs
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// ------------------ ROUTER GUARD ------------------
// This guard checks authentication state based on the cookie.
// It blocks unauthorized access to protected routes and prevents
// logged-in users from accessing login/register pages.
router.beforeEach((to, from, next) => {
    const token = Cookies.get('token')

    // Block access to any route other than login/register if no token exists
    if (!token && to.name !== 'Login' && to.name !== 'Register') {
        return next({ name: 'Login' })
    }

    // Prevent logged-in users from going back to login/register
    if (token && (to.name === 'Login' || to.name === 'Register')) {
        return next({ name: 'Dashboard' })
    }

    // Proceed to route
    next()
})

export default router