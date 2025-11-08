<template>
    <header class="dashboard-header" role="banner">
        <div class="heading-container">
        <h2 id="dashboard-title">
            <span aria-hidden="true">🚀</span> Products Dashboard
        </h2>
        </div>
        <nav class="button-container" aria-label="User actions">
            <button
                class="admin-btn"
                :class="showAdminButtons ? 'active' : ''"
                type="button"
                @click="$emit('displayAdminSettings')"
                aria-pressed="false"
                aria-label="Toggle admin controls"
            >
                <span aria-hidden="true">🛠️</span> <span class="sr-only">Admin settings</span>
            </button>

            <button
                class="signout-btn"
                type="button"
                @click="$emit('signOut')"
                aria-label="Sign out"
            >
                <span aria-hidden="true">🔓</span> <span class="sr-only">Logout</span>
            </button>
        </nav>
    </header>
</template>

<script>
export default {
    name: 'DashboardHeader',
    emits: ['signOut', 'displayAdminSettings'],
    props: ['showAdminButtons']
}
</script>

<style scoped>
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--card);
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

h2 {
    margin: 0;
    color: var(--accent)
}

h2>span {
    margin-right: 0.5rem;
}

.button-container {
    height: 100%;
    display: flex;
    align-items: flex-end;
}

.signout-btn,
.admin-btn {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 0.4rem 1rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    margin-left: 0.5rem;
}

.admin-btn.active{
    background-color: var(--accent);
    color: var(--bg);
    font-weight: 600;
}

.signout-btn:hover,
.admin-btn:hover {
    background: var(--accent);
    color: var(--bg);
    font-weight: 600;
}

@media (max-width: 600px) {
    h2>span {
        margin-right: 0.5rem;
    }

    .dashboard-header{
        flex-direction: column;
        justify-content: space-between;
        padding: 1.2rem;
    }

    .heading-container{
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 2vh;
    }

    .button-container{
        width: 100%;
        justify-content: flex-end;
    }

}
</style>