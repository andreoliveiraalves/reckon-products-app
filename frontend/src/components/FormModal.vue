<template>
    <div v-if="show" class="modal-backdrop" @click.self="handleClose" @keydown.esc="handleClose" role="dialog" aria-modal="true" :aria-labelledby="'modal-title-' + type">
        <div class="modal-card">
            <h2 :id="'modal-title-' + type">{{ title }}</h2>

            <form v-if="!apiResponse.success" @submit.prevent="handleSubmit" class="modal-form" aria-label="Modal form">
                <div v-if="type === 'numeric'">
                    <label for="count-input" class="sr-only">Number of products to generate</label>
                    <input id="count-input" type="number" v-model.number="form.count" placeholder="Enter number" min="1" required aria-required="true"/>
                </div>

                <div v-else-if="type === 'product'">
                    <label for="product-name" class="sr-only">Product name</label>
                    <input id="product-name" type="text" v-model="form.name" placeholder="Product name" required aria-required="true"/>
                    
                    <label for="product-description" class="sr-only">Product description</label>
                    <input id="product-description" type="text" v-model="form.description" placeholder="Description" required aria-required="true"/>
                    
                    <label for="product-price" class="sr-only">Product price</label>
                    <input id="product-price" type="number" v-model.number="form.price" placeholder="Price (€)" min="0" step="0.01" required aria-required="true"/>
                </div>

                <div v-else-if="type === 'price'">
                    <label for="min-price" class="sr-only">Minimum price filter</label>
                    <input id="min-price" type="number" v-model.number="form.minPrice" placeholder="Min price (€)" min="0"/>
                    
                    <label for="max-price" class="sr-only">Maximum price filter</label>
                    <input id="max-price" type="number" v-model.number="form.maxPrice" placeholder="Max price (€)" min="0"/>
                </div>

                <div v-else-if="type === 'confirm'" role="alert" aria-live="polite">
                    <p>⚠️ This action cannot be undone. Continue?</p>
                </div>

                <div class="modal-actions">
                    <button class="submit-btn" type="submit" :disabled="apiResponse.loading" :aria-busy="apiResponse.loading">
                        {{ apiResponse.loading ? 'Processing...' : action }}
                    </button>
                    <button class="cancel-btn" type="button" @click="handleClose" :disabled="apiResponse.loading" aria-label="Cancel and close modal">Cancel</button>
                </div>
            </form>

            <div v-if="apiResponse.error" role="alert" aria-live="assertive">
                <div class="error">{{ apiResponse.error }}</div>
                <button class="close-btn" type="button" @click="handleClose" aria-label="Close error message and return to form">Close</button>
            </div>

            <div v-if="apiResponse.success" role="status" aria-live="polite">
                <div class="success">{{ apiResponse.success }}</div>
                <button class="close-btn" type="button" @click="handleClose" aria-label="Close modal">Close</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FormModal',
    props: {
        show: { type: Boolean, default: false },
        title: { type: String, default: 'Modal Title' },
        type: { type: String, default: 'default' },
        action: { type: String, default: 'Submit' },
        apiResponse: { type: Object, default: () => ({ loading: false, error: '', success: '' }) }
    },
    data() {
        return {
            form: { count: '', name: '', description: '', price: '', minPrice: '', maxPrice: '' }
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.form = { count: '', name: '', description: '', price: '', minPrice: '', maxPrice: '' }
            }
        }
    },
    methods: {
        handleSubmit() {
            if (this.apiResponse.loading) return
            let payload = {}
            switch(this.type) {
                case 'numeric': if(!this.form.count || this.form.count < 1) return; payload = { count: this.form.count }; break
                case 'product': if(!this.form.name || !this.form.description || this.form.price <= 0) return; payload = { name: this.form.name, description: this.form.description, price: this.form.price }; break
                case 'price': payload = { minPrice: this.form.minPrice, maxPrice: this.form.maxPrice }; break
                case 'confirm': payload = { confirmed: true }; break
            }
            this.$emit('submit', payload)
        },
        handleClose() {
            if (this.apiResponse.loading) return
            this.$emit('close')
        }
    }
}
</script>



<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 100;
}

.modal-card {
    background: var(--card);
    padding: 3rem;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.2s ease-out;
}

.modal-form input {
    width: 80%;
    margin: 1rem auto;
    display: block;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    border: 1px solid var(--divider);
    background: var(--input);
    color: var(--text);
}

.modal-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: space-between;
}

.submit-btn,
.cancel-btn, .close-btn {
    flex: 1;
    margin: 0 0.3rem;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.submit-btn {
    background: var(--accent);
    color: var(--bg);
    border: none;
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.cancel-btn {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--accent);
}

.cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.modal-actions button:not(:disabled):hover {
    background: var(--sec);
}

.message-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
}

.close-btn {
    padding: 0.8rem 2rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    background: var(--accent);
    color: var(--bg);
    border: none;
    margin: 0 auto;
    min-width: 120px;
    margin-top: 2vw;
}

.close-btn:hover {
    background: var(--sec);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.success-btn {
    background: var(--success);
    color: white;
}

.success-btn:hover {
    background: color-mix(in srgb, var(--success) 80%, black);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.loader-wrapper {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
}

.loader {
    width: 48px;
    height: 48px;
    border: 2px solid var(--text);
    border-radius: 50%;
    display: inline-block;
    position: relative;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}
.loader::after,
.loader::before {
    content: '';  
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    background: var(--accent);
    width: 6px;
    height: 6px;
    transform: translate(150%, 150%);
    border-radius: 50%;
}
.loader::before {
    left: auto;
    top: auto;
    right: 0;
    bottom: 0;
    transform: translate(-150%, -150%);
}

@keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error {
    color: var(--error);
    font-weight: 600;
    margin: auto;
    font-size: 1rem;
}

.success {
    color: var(--success);
    font-weight: 600;
    margin: auto;
    font-size: 1rem;
}
</style>