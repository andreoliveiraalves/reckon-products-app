<template>
    <div class="dashboard">
        <!-- Header Component -->
        <DashboardHeader @signOut="handleSignOut" @displayAdminSettings="toggleAdminButtons" />

        <!-- Main content -->
        <main class="dashboard-content">
            <p>Welcome back, {{ username }}!</p>
            <p>Here will be your main app interface (e.g., product management, charts, etc).</p>
            <p>{{ showAdminButtons }}</p>
        </main>
    </div>
</template>

<script>
import DashboardHeader from '../components/DashboardHeader.vue'

export default {
    name: 'Dashboard',
    components: { DashboardHeader },

    data() {
        return {
            username: 'User',
            showAdminButtons: false,
            products: [],
            productSearchQuery: {
                page: 1,
                limit: 20,
                id: "",
                name: "",
                description: "",
                minPrice: "",
                maxPrice: "",
                sortBy: "createdAt",
                sortOrder: "desc"
            }
        }
    },

    mounted() {
        const storedUser = localStorage.getItem('username')
        if (storedUser) this.username = storedUser
    },

    methods: {
        handleSignOut() {
            sessionStorage.removeItem('auth')
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            this.$router.push('/login')
        },
        toggleAdminButtons() {
            this.showAdminButtons = !this.showAdminButtons
        }
    }
}
</script>

<style scoped>
.dashboard {
    min-height: 96vh;
    min-width: 98vw;
    padding: 1.5vw;
    display: flex;
    flex-direction: column;
    background: var(--bg, #0f172a);
    color: var(--text, #f1f5f9);
    font-family: "Inter", sans-serif;
}

.dashboard-content {
    flex: 1;
    padding: 2rem;
}
</style>