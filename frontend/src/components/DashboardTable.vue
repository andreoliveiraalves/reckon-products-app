<template>
    <div class="table-container">
        <div class="table-wrapper">
            <table class="products-table">
                <thead>
                    <!-- Search row -->
                    <tr class="search-row">
                        <th>
                            <input type="text" v-model="searchFilters.name" placeholder="Search by name..."
                                class="search-input" @input="debouncedSearch" />
                        </th>
                        <th>
                            <input type="text" v-model="searchFilters.description"
                                placeholder="Search by description..." class="search-input" @input="debouncedSearch" />
                        </th>
                        <th></th>
                        <th></th>
                    </tr>
                    <!-- Header row -->
                    <tr class="header-row">
                        <th class="sortable" @click="handleSort('name')">
                            Name
                            <span class="sort-icon" v-if="sortBy === 'name'">
                                {{ sortOrder === 'asc' ? '↑' : '↓' }}
                            </span>
                        </th>
                        <th class="sortable" @click="handleSort('description')">Description</th>
                        <th class="sortable" @click="handleSort('price')">
                            Price (€)
                            <span class="sort-icon" v-if="sortBy === 'price'">
                                {{ sortOrder === 'asc' ? '↑' : '↓' }}
                            </span>
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!products || products.length === 0">
                        <td colspan="4" class="empty-state">
                            <div class="empty-content">
                                <span class="empty-icon">📦</span>
                                <p>No products found</p>
                                <small>Try adjusting your filters or add new products</small>
                            </div>
                        </td>
                    </tr>
                    <tr v-else v-for="product in products" :key="product._id" class="product-row">
                        <td class="product-name">{{ product.name }}</td>
                        <td class="product-description">{{ product.description }}</td>
                        <td class="product-price">{{ formatPrice(product.price) }}</td>
                        <td class="product-actions">
                            <button class="action-btn info-btn" @click="handleInfo(product)" title="Check product info">
                                ℹ️
                            </button>
                            <button class="action-btn edit-btn" @click="handleEdit(product)" title="Edit product">
                                ✏️
                            </button>
                            <button class="action-btn delete-btn" @click="handleDelete(product)" title="Delete product">
                                🗑️
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-controls">
            <label for="limit-select">Items per page:</label>
            <select id="limit-select" v-model.number="localLimit" @change="handleLimitChange">
                <option v-for="n in [5, 10, 20, 50]" :key="n" :value="n">{{ n }}</option>
            </select>
        </div>
        <!-- Pagination -->
        <div v-if="products && products.length > 0" class="pagination">
            <button class="pagination-btn" @click="handlePrevPage" :disabled="currentPage === 1">
                ← Previous
            </button>
            <span class="page-info">Page {{ currentPage }}</span>
            <button class="pagination-btn" @click="handleNextPage" :disabled="!hasMorePages">
                Next →
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DashboardTable',
    props: {
        products: {
            type: Array,
            default: () => []
        },
        currentPage: {
            type: Number,
            default: 1
        },
        hasMorePages: {
            type: Boolean,
            default: false
        },
        limit: {
            type: Number,
            default: 10
        }
    },
    data() {
        return {
            searchFilters: {
                name: '',
                description: ''
            },
            sortBy: 'createdAt',
            sortOrder: 'desc',
            searchTimeout: null,
            localLimit: this.limit
        }
    },
    methods: {
        formatPrice(price) {
            return new Intl.NumberFormat('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            }).format(price)
        },
        debouncedSearch() {
            // Clear existing timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout)
            }

            // Set new timeout
            this.searchTimeout = setTimeout(() => {
                this.$emit('search', this.searchFilters)
            }, 300) // Wait 300ms after user stops typing
        },
        handleSort(field) {
            if (this.sortBy === field) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
            } else {
                this.sortBy = field
                this.sortOrder = 'asc'
            }
            this.$emit('sort', { sortBy: this.sortBy, sortOrder: this.sortOrder })
        },
        handleInfo(product) {
            this.$emit('info', product)
        },
        handleEdit(product) {
            this.$emit('edit', product)
        },
        handleDelete(product) {
            this.$emit('delete', product)
        },
        handlePrevPage() {
            this.$emit('prev-page')
        },
        handleNextPage() {
            this.$emit('next-page')
        },
        handleLimitChange() {
            this.$emit('update-limit', this.localLimit)
        },
    },
    beforeUnmount() {
        // Clean up timeout when component is destroyed
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout)
        }
    }
}
</script>

<style scoped>
.table-container {
    padding: 0;
    margin: auto;
}

.table-wrapper {
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.products-table {
    width: 100%;
    border-collapse: collapse;
}

/* Search Row */
.search-row th {
    padding: 1rem;
    background: var(--bg);
}

.search-input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    border: 1px solid var(--divider);
    background: var(--input);
    color: var(--text);
    font-size: 0.8rem;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--input-focus);
}

.search-input::placeholder {
    color: var(--divider);
}

/* Header Row */
.header-row {
    background: linear-gradient(135deg, var(--sec) 0%, var(--accent) 100%);
    color: var(--bg);
}

.header-row th {
    padding: 1rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.header-row th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
}

.header-row th.sortable:hover {
    background: rgba(255, 255, 255, 0.1);
}

.sort-icon {
    margin-left: 0.5rem;
    font-size: 1rem;
}

/* Product Rows */
.product-row {
    border-bottom: 1px solid var(--divider);
    transition: all 0.2s;
}

.product-row:hover {
    background: rgba(56, 189, 248, 0.05);
    transform: scale(1.01);
}

.product-row td {
    padding: 1rem 1rem;
    color: var(--text);
}

.product-name {
    font-weight: 600;
    font-size: 0.8rem;
}

.product-description {
    color: var(--divider);
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.8rem;
}

.product-price {
    font-weight: 700;
    color: var(--accent);
    font-size: 0.8rem;
}

.product-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    padding: 0.5rem 0.8rem;
    border: none;
    border-radius: 6px;
    background: var(--input);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.edit-btn:hover {
    background: var(--accent);
}

.delete-btn:hover {
    background: var(--error);
}

/* Empty State */
.empty-state {
    padding: 4rem 2rem;
    text-align: center;
}

.empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.empty-icon {
    font-size: 4rem;
    opacity: 0.5;
}

.empty-content p {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
}

.empty-content small {
    color: var(--divider);
    font-size: 0.9rem;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    padding: 1rem;
}

.pagination-btn {
    padding: 0.7rem 1.5rem;
    border: none;
    border-radius: 6px;
    background: var(--accent);
    color: var(--bg);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background: var(--sec);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
}

.pagination-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.page-info {
    font-weight: 600;
    color: var(--text);
    font-size: 1rem;
}

.pagination-controls {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
}

#limit-select {
    padding: 0.4rem 1rem;
    border-radius: 6px;
    border: 1px solid var(--divider);
    background: var(--input);
    color: var(--text);
}

/* Responsive */
@media (max-width: 768px) {

    .table-wrapper {
        overflow-x: scroll;
    }

    .table-container {
        padding: 1rem;
        margin: auto;
    }

    .products-table,
    .product-name {
        font-size: 0.8rem;
    }

    .product-row td {
        padding: 0.8rem 0.5rem;
    }

    .page-info {
        font-weight: 600;
        color: var(--text);
        font-size: 0.8rem;
    }
}
</style>