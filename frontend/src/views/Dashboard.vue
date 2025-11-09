<template>
    <div class='dashboard'>
        <DashboardHeader :showAdminButtons='showAdminButtons' @signOut='handleSignOut'
            @displayAdminSettings='toggleAdminButtons' />

        <main class='dashboard-content'>
            <DashboardButtons :showAdminButtons='showAdminButtons' @addNewProduct='openAddProductModal'
                @filterPrices='openFilterPricesModal' @generateProducts='openGenerateProductsModal'
                @removeAllProducts='openConfirmDeleteModal' />

            <DashboardTable :products="productsData.products || []" :currentPage="productSearchQuery.page"
                :hasMorePages="hasMorePages" :limit="productSearchQuery.limit" @search="handleSearch" @sort="handleSort"
                @info="handleProductInfo" @edit="openEditProductModal" @delete="openDeleteProductModal"
                @prev-page="handlePrevPage" @next-page="handleNextPage"
                @update-limit="val => { productSearchQuery.limit = val; fetchAllProducts() }" />
        </main>

        <FormModal ref="formModal" :show="modal.show" :title="modal.title" :info="modal.info" :type="modal.type"
            :action="modal.action" :apiResponse="apiResponse" :productDetails="modal.productDetails"
            @submit="handleModalSubmit" @close="closeModal" />
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
            showAdminButtons: false,
            productsData: {},
            modal: {
                show: false,
                title: '',
                type: 'default',
                action: '',
                info: '',
                productId: null,
                productDetails: {}
            },
            apiResponse: {
                loading: false,
                error: '',
                success: ''
            },
            productSearchQuery: {
                page: 1,
                limit: 10,
                id: '',
                name: '',
                description: '',
                minPrice: '',
                maxPrice: '',
                sortBy: 'price',
                sortOrder: 'asc'
            },
            isSubmitting: false,
            isFetching: false
        }
    },

    methods: {
        handleSignOut() {
            sessionStorage.removeItem('auth')
            localStorage.removeItem('token')
            this.$router.push('/login')
        },
        toggleAdminButtons() {
            this.showAdminButtons = !this.showAdminButtons
        },

        resetApiResponse() {
            this.apiResponse = { loading: false, error: '', success: '' }
        },

        closeModal() {
            this.modal.show = false
            this.modal.productId = null
            this.resetApiResponse()
        },

        // --- Open modals ---
        openAddProductModal() {
            this.resetApiResponse()
            this.modal = { title: '📦 Add new product', type: 'product', action: 'Add', show: true, productId: null }
        },
        openFilterPricesModal() {
            this.resetApiResponse()
            this.modal = { title: '💰 Filter results by price', type: 'price', action: 'Filter', show: true, productId: null }
        },
        openGenerateProductsModal() {
            this.resetApiResponse()
            this.modal = { title: '🧩 Generate products', type: 'numeric', action: 'Generate', show: true, productId: null }
        },
        openConfirmDeleteModal() {
            this.resetApiResponse()
            this.modal = { title: '🗑️ Are you sure you want to delete all products?', type: 'confirm', action: 'Delete', show: true, productId: null }
        },
        openEditProductModal(product) {
            this.resetApiResponse()
            this.modal = { title: `✏️ Edit product`, info: product.name, type: 'product', action: 'Save', show: true, productId: product._id }
            this.$nextTick(() => {
                const formModal = this.$refs.formModal
                if (formModal) {
                    formModal.form.name = product.name
                    formModal.form.description = product.description
                    formModal.form.price = product.price
                }
            })
        },
        openDeleteProductModal(product) {
            this.resetApiResponse()
            this.modal = { title: `🗑️ Delete product`, info: product.name, type: 'confirm', action: 'Delete', show: true, productId: product._id }
        },

        // --- Handle modal submit ---
        async handleModalSubmit(payload) {
            if (this.isSubmitting) return
            this.isSubmitting = true
            this.apiResponse.loading = true
            this.apiResponse.error = ''
            this.apiResponse.success = ''

            try {
                switch (this.modal.type) {
                    case 'product':
                        if (this.modal.productId) await this.updateProduct(payload, this.modal.productId)
                        else await this.addNewProduct(payload)
                        break
                    case 'price':
                        await this.filterPrices(payload)
                        break
                    case 'numeric':
                        await this.generateProducts(payload.count)
                        break
                    case 'confirm':
                        if (this.modal.productId) await this.removeProduct(this.modal.productId)
                        else await this.removeAllProducts()
                        break
                }
            } catch (err) {
                this.apiResponse.error = err.message || 'Action failed'
            } finally {
                this.isSubmitting = false
                this.apiResponse.loading = false
            }
        },

        // --- API Actions ---
        async addNewProduct(payload) {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Missing authentication token.')
            const res = await fetch('https://reckon-products-app.onrender.com/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Failed to add product.')
            this.apiResponse.success = `✅ Product "${payload.name}" added successfully!`
            await this.fetchAllProducts()
        },

        async updateProduct(payload, id) {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Missing authentication token.')
            const res = await fetch(`https://reckon-products-app.onrender.com/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Failed to update product.')
            this.apiResponse.success = `✅ Product "${payload.name}" updated successfully!`
            await this.fetchAllProducts()
        },

        async removeProduct(id) {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Missing authentication token.')
            const res = await fetch(`https://reckon-products-app.onrender.com/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Failed to delete product.')
            this.apiResponse.success = `🗑️ Product deleted successfully.`
            await this.fetchAllProducts()
        },

        async removeAllProducts() {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Missing authentication token.')
            const res = await fetch('https://reckon-products-app.onrender.com/products/test/clear', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Failed to delete all products.')
            this.apiResponse.success = '🗑️ All products deleted successfully.'
            await this.fetchAllProducts()
        },

        async filterPrices(payload) {
            this.productSearchQuery.minPrice = payload.minPrice || ''
            this.productSearchQuery.maxPrice = payload.maxPrice || ''
            await this.fetchAllProducts()
            this.apiResponse.success = `Filtered by price successfully`
        },

        async generateProducts(count) {
            if (!count || count < 1) throw new Error('Invalid count')
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Missing authentication token.')
            const res = await fetch(`https://reckon-products-app.onrender.com/products/test/generate?count=${count}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Failed to generate products.')
            this.apiResponse.success = `✅ ${count} products generated successfully!`
            await this.fetchAllProducts()
        },

        async fetchAllProducts() {
            if (this.isFetching) return
            this.isFetching = true
            try {
                const token = localStorage.getItem('token')
                if (!token) { this.apiResponse.error = 'Missing authentication token.'; return }
                const filteredQuery = Object.entries(this.productSearchQuery)
                    .filter(([k, v]) => v !== '' && v !== null && v !== undefined)
                    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
                const params = new URLSearchParams(filteredQuery).toString()
                const res = await fetch(`https://reckon-products-app.onrender.com/products/?${params}`, {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.message || 'Failed to fetch products.')
                this.productsData = data
            } catch (error) {
                this.apiResponse.error = error.message
            } finally {
                this.isFetching = false
            }
        },

        handleSearch(filters) { this.productSearchQuery.name = filters.name; this.productSearchQuery.description = filters.description; this.productSearchQuery.page = 1; this.fetchAllProducts() },
        handleSort({ sortBy, sortOrder }) { this.productSearchQuery.sortBy = sortBy; this.productSearchQuery.sortOrder = sortOrder; this.fetchAllProducts() },
        handleProductInfo(product) {
            this.resetApiResponse()
            this.modal = {
                title: 'ℹ️ Product details',
                type: 'info',
                action: 'Close',
                show: true,
                productId: product._id,
            }
            this.modal.productDetails = product
        },
        handlePrevPage() { if (this.productSearchQuery.page > 1) { this.productSearchQuery.page--; this.fetchAllProducts() } },
        handleNextPage() { if (this.hasMorePages) { this.productSearchQuery.page++; this.fetchAllProducts() } }
    },

    computed: {
        hasMorePages() {
            if (!this.productsData.totalPages) return false
            return this.productSearchQuery.page < this.productsData.totalPages
        }
    },

    async mounted() {
        await this.fetchAllProducts()
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

@media (max-width: 600px) {
    .dashboard {
        max-width: 94vw;
        margin: auto;
        padding: 1.2rem;
    }
}
</style>