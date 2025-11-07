<template>
    <div class="card" role="form" :aria-labelledby="titleId" :aria-describedby="descId">
        <h1 :id="titleId">🚀 Reckon Products</h1>
        <p :id="descId">
            {{ mode === 'login' ? 'Log in to access product management and price history.' : 'Create a new account to start managing products.' }}
        </p>

        <form @submit.prevent="handleSubmit" class="form" autocomplete="on" novalidate>
            <label for="username" class="visually-hidden">Username</label>
            <input id="username" v-model="username" type="text" placeholder="Username" required autocomplete="username" />

            <label for="password" class="visually-hidden">Password</label>
            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password" required autocomplete="current-password" />

            <div class="toggle-password-container">
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                    {{ showPassword ? 'Hide password' : 'Show password' }}
                </button>
            </div>

            <button class="submit-button" type="submit" :disabled="loading">
                {{ loading ? (mode === 'login' ? 'Logging in…' : 'Creating account…') : (mode === 'login' ? 'Log In' : 'Register') }}
            </button>

            <hr class="divider" aria-hidden="true" />

            <button v-if="mode === 'login'" type="button" class="register-btn" @click="$router.push('/register')">Create Account</button>
            <button v-else type="button" class="register-btn" @click="$router.push('/login')">Back to Login</button>

            <p v-if="error" class="error" role="alert">{{ error }}</p>
            <p v-if="success" class="success" role="status">{{ success }}</p>
        </form>
    </div>
</template>

<script>
export default {
    name: 'AuthForm',
    props: {
        mode: { type: String, default: 'login' }
    },
    data() {
        return {
            username: '',
            password: '',
            showPassword: false,
            loading: false,
            error: '',
            success: ''
        }
    },
    mounted() {
        // Show success message if redirected from registration
        if (this.mode === 'login' && this.$route.query.registered === 'true') {
            this.success = 'Account created successfully! You can now log in.'
            setTimeout(() => (this.success = ''), 5000)
        }
    },
    computed: {
        titleId() { return this.mode + '-title' },
        descId() { return this.mode + '-desc' }
    },
    methods: {
        async handleSubmit() {
            this.error = ''
            this.success = ''
            this.loading = true

            const url = this.mode === 'login'
                ? 'https://reckon-products-app.onrender.com/auth/login'
                : 'https://reckon-products-app.onrender.com/auth/register'

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                })

                const data = await res.json()
                if (!res.ok) throw new Error(data.message || 'Request failed')

                if (this.mode === 'login') {
                    localStorage.setItem('token', data.token)
                    sessionStorage.setItem('auth', 'true')
                    this.$router.push('/dashboard')
                } else {
                    // Redirect to login with success flag
                    this.$router.push({ path: '/login', query: { registered: 'true' } })
                }
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
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
    min-width: 30vw;
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
    background: var(--input);
    color: var(--text);
    font-size: 1rem;
    outline: none;
    transition: background 0.2s, box-shadow 0.2s;
}

input:focus {
    background: var(--input-focus);
    box-shadow: 0 0 0 2px var(--accent);
}

.toggle-password-container {
    display: flex;
    justify-content: flex-end;
}

.toggle-password {
    background: none;
    border: none;
    color: var(--white);
    background-color: var(--sec);
    cursor: pointer;
    font-size: 0.8rem;
    align-self: flex-start;
    margin-top: 0.2rem;
}

button {
    background: var(--accent);
    color: var(--bg);
    font-weight: 500;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: none;
    margin-top: 1rem;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
}

button:hover:not(:disabled) {
    background: var(--accent);
    transform: translateY(-2px);
}

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.divider {
    border: none;
    height: 1px;
    background: var(--divider);
    margin: 0.5rem 0;
}

.register-btn {
    background: var(--sec);
    color: var(--text);
    font-weight: 600;
    padding: 0.75rem 1rem;
    margin: 0;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
}

.submit-button {
    color: var(--bg);
    font-weight: 600;
}

.register-btn:hover {
    background: var(--accent);
    transform: translateY(-2px);
}

.error {
    color: var(--error);
    font-weight: 600;
    margin: auto;
    padding-top: 2vh;
}

.success {
    color: var(--success);
    font-weight: 600;
    margin: auto;
    padding-top: 2vh;
}

/* Hidden labels for screen readers */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
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
