<template>
    <div class='dashboard'>
        <!-- Header Component -->
        <DashboardHeader :showAdminButtons='showAdminButtons' @signOut='handleSignOut'
            @displayAdminSettings='toggleAdminButtons' />

        <!-- Main content -->
        <main class='dashboard-content'>
            <!-- Dashboard buttons -->
            <DashboardButtons :showAdminButtons='showAdminButtons' @addNewProduct='addNewProduct'
                @filterPrices='filterPrices' @generateProducts='generateProducts'
                @removeAllProducts='removeAllProducts' />
            <DashboardTable />
        </main>
        <FormModal :show='modal.show' :title='modal.title' :type='modal.type' :action="modal.action"
            @submit='generateProducts' @close='modal.show = false' />
    </div>
</template>

<script>
import DashboardHeader from '../components/DashboardHeader.vue'
import DashboardButtons from '../components/DashboardButtons.vue'
import DashboardTable from '../components/DashboardTable.vue'
import FormModal from '../components/FormModal.vue'

export default {
    name: 'Dashboard',
    components: { DashboardHeader, DashboardButtons, DashboardTable, FormModal },

    data() {
        return {
            username: 'User',
            showAdminButtons: false,
            products: [],
            showGenerateModal: false,
            modal: {
                show: false,
                title: '',
                type: 'default',
                action: ''
            },
            productSearchQuery: {
                page: 1,
                limit: 20,
                id: '',
                name: '',
                description: '',
                minPrice: '',
                maxPrice: '',
                sortBy: 'createdAt',
                sortOrder: 'desc'
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
        },
        async addNewProduct() {
            console.log('New product added')
        },
        async filterPrices() {
            console.log('Prices filtered')
        },
        async generateProducts() {
            this.modal = {
                title: 'How many products to generate?',
                type: 'numeric',
                show: !this.modal.show,
                action: 'Add'
            }
            /* this.error = ''
            this.success = ''
            this.loading = true

            const token = localStorage.getItem('token')
            const url = `https://reckon-products-app.onrender.com/products/test/generate?count=${count}`

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })

                const data = await res.json()

                if (!res.ok) throw new Error(data.message || 'Failed to generate products')

                this.success = `✅ ${count} products generated successfully!`
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            } */
        },
        async removeAllProducts() {
            this.modal = {
                title: 'Are you sure you want to delete all products ?',
                type: '',
                show: !this.modal.show,
                action: 'Delete'
            }
            console.log('All products removed')
        }
    }
}
</script>

<style scoped>
.dashboard {
    min-height: 100vh;
    min-width: 80vw;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--text, #f1f5f9);
    font-family: 'Roboto', sans-serif;
    margin: auto;
}

.dashboard-content {
    flex: 1;
    padding: 0;
}
</style>