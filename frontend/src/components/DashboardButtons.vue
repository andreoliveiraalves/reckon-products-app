<template>
    <header class="dashboard-header" role="banner">
        <div class="dashboard-options-container" aria-label="User actions">
            <div class="button-container">
                <div class="base-buttons">
                    <button class="action-btn" type="button" @click="$emit('addNewProduct')"
                        aria-label="Add new product">
                        <span aria-hidden="true">📦</span> <span class="sr-only">New product</span>
                    </button>
                    <button class="action-btn" type="button" @click="$emit('filterPrices')"
                        aria-label="filter price range">
                        <span aria-hidden="true">💰</span> <span class="sr-only">Filter by price </span>
                    </button>
                </div>
                <div class="admin-buttons" v-if="showAdminButtons">
                    <button class="action-btn" type="button" @click="$emit('generateProducts')"
                        aria-label="Generate products">
                        <span aria-hidden="true">🧩</span> <span class="sr-only">Generate products</span>
                    </button>
                    <button class="action-btn" type="button" @click="$emit('removeAllProducts')"
                        aria-label="Remove all products">
                        <span aria-hidden="true">🗑️</span> <span class="sr-only">Remove all products </span>
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    name: 'DashboardButtons',
    data() {
        return {

        }
    },
    emits: ['addNewProduct', 'filterPrices', 'generateProducts', 'removeAllProducts'],
    props: ['showAdminButtons']
}
</script>

<style scoped>
.dashboard-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background: var(--card);
    position: sticky;
    padding: 1rem 2rem;
    top: 0;
    z-index: 10;
}

.button-container {
    height: 100%;
    display: flex;
    align-items: flex-end;
}

.action-btn {
    background: var(--accent);
    color: var(--bg);
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 0.4rem 1rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-left: 0.5rem;
}

.action-btn:hover {
    background: var(--accent);
    color: var(--text);
}

@media (max-width: 600px) {
    .dashboard-header {
        flex-direction: column;
        justify-content: space-between;
        padding: 1.2rem;
        max-width: 94vw;
    }

    .dashboard-options-container {
        width: 100%;
    }

    .button-container {
        width: 75%;
        margin: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: stretch;
    }

    .base-buttons,
    .admin-buttons {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .action-btn {
        width: 100%;
        margin-top: 1vh;
        text-align: center;
        justify-content: center;
    }
}
</style>