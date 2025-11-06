<template>
    <div class="card">
        <h1>🚀 Reckon Products</h1>
        <p>Log in to access product management and price history.</p>

        <form @submit.prevent="handleLogin" class="form">
            <input v-model="username" type="text" placeholder="Username" required />
            <input v-model="password" type="password" placeholder="Password" required />

            <button type="submit" :disabled="loading">
                {{ loading ? 'Logging in...' : 'Log In' }}
            </button>

            <hr class="divider" />

            <button type="button" class="register-btn" @click="goToRegister">
                Create Account
            </button>

            <p v-if="error" class="error">{{ error }}</p>
        </form>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'LoginVue',
    data() {
        return {
            username: '',
            password: '',
            loading: false,
            error: ''
        }
    },
    methods: {
        async handleLogin() {
            this.error = ''
            this.loading = true
            try {
                await axios.post(
                    'https://reckon-products-app.onrender.com/auth/login',
                    { username: this.username, password: this.password },
                    { withCredentials: true } // sends cookie automatically
                )
                this.$router.push('/dashboard')
            } catch (err) {
                this.error = err.response?.data?.message || 'Login failed. Please try again.'
            } finally {
                this.loading = false
            }
        },
        goToRegister() {
            this.$router.push('/register')
        }
    }
}
</script>

    <style scoped>
    .card {
        background: var(--card);
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        width: 100%;
        max-width: 75vw;
        box-sizing: border-box;
    }

    h1 {
        font-size: 2rem;
        color: var(--accent);
        margin-bottom: 1.2rem;
        margin-top: 0;
        overflow-wrap: break-word;
    }

    p {
        line-height: 1.5;
        font-size: 1rem;
        margin: 0 auto 1.5rem;
        max-width: 480px;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 3vh;
    }

    input {
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        border: none;
        background: #334155;
        color: var(--text);
        font-size: 1rem;
        outline: none;
        transition: background 0.2s, box-shadow 0.2s;
    }

    input:focus {
        background: #475569;
        box-shadow: 0 0 0 2px var(--accent);
    }

    button {
        background: var(--accent);
        color: #0f172a;
        font-weight: 600;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        border: none;
        margin-top: 1rem;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
    }

    button:hover:not(:disabled) {
        background: #7dd3fc;
        transform: translateY(-2px);
    }

    button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .divider {
        border: none;
        height: 1px;
        background: #94a3b8;
        margin: 0.5rem 0;
    }

    .register-btn {
        background: var(--sec);
        color: #ffffff;
        font-weight: 600;
        padding: 0.75rem 1rem;
        margin: 0;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
    }

    .register-btn:hover {
        background: #38bdf8;
        transform: translateY(-2px);
    }

    .error {
        color: #f87171;
        font-weight: 600;
        margin: auto;
        padding-top: 2vh;
    }

    @media (max-width: 600px) {
        .card {
            padding: 2.5rem;
        }

        h1 {
            font-size: 1.2rem;
        }
    }
    </style>