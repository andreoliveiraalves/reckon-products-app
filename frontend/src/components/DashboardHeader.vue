<template>
    <header class="dashboard-header">
        <div class="heading-container">
        <h2><span>🚀</span> Reckon Products Dashboard</h2>
        </div>
        <div class="button-container">
            <button class="admin-btn" @click="$emit('displayAdminSettings')" aria-label="Sign out">
                🛠️ Admin
            </button>
            <button class="signout-btn" @click="$emit('signOut')" aria-label="Sign out">
                🔓 Logout
            </button>
        </div>
    </header>
</template>

<script>
export default {
    name: 'DashboardHeader',
    emits: ['signOut', 'displayAdminSettings']
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
    border-radius: 10px;
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

.signout-btn:hover,
.admin-btn:hover {
    background: var(--accent);
    color: var(--text);
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