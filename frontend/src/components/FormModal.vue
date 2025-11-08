<template>
    <div v-if="show" class="modal-backdrop">
        <div class="modal-card">
            <h2>{{ title }}</h2>

            <form @submit.prevent="handleSubmit" class="modal-form">
                <div v-show="type === 'numeric'">
                    <input type="number" v-model.number="values.numericValue" placeholder="Enter number" min="1"
                        required />
                </div>
                <div v-show="type === 'price'">
                    <input type="number" v-model.number="values.minPrice" placeholder="Min Price" min="0" max="100000"
                        required />
                    <input type="number" v-model.number="values.maxPrice" placeholder="Max Price" min="0" max="100000"
                        required />
                </div>
                <div v-show="type === 'product'">
                    <input type="text" v-model.number="values.product.name" placeholder="name" required />
                    <input type="text" v-model.number="values.product.description" placeholder="description" required />
                    <input type="number" v-model.number="values.product.price" placeholder="Max Price"
                        required />
                </div>
                <div class="modal-actions">
                    <button class="submit-btn" type="submit">{{ action }}</button>
                    <button class="cancel-btn" type="button" @click="handleClose">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FormModal',
    props: {
        show: { type: Boolean, default: false },
        title: { type: String, default: 'Modal Title' },
        type: { type: String, default: 'numeric' },
        action: { type: String, default: 'Submit' }
    },
    data() {
        return {
            values: {
                numericValue: '',
                minPrice: '',
                maxPrice: '',
                product: {
                    name: '',
                    description: '',
                    price: ''
                }
            }
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.values.numericValue = '' // reset the numeric input when modal opens
            }
        }
    },
    methods: {
        handleSubmit() {
            // Simple validation
            if (this.type === 'numeric' && (!this.values.numericValue || this.values.numericValue < 1)) {
                alert('Please enter a valid number greater than 0')
                return
            }
            this.$emit('submit', this.values.numericValue)
            this.$emit('close')
        },
        handleClose() {
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
    background-color: var(--modal-background);
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
    width: 100%;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    border: 1px solid var(--divider);
    background: var(--input);
    color: var(--text);
    width: 80%;
    margin: auto;
    margin-top: 1.5rem;
}

.modal-form input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--input-focus);
}

.modal-actions {
    margin-top: 3rem;
    display: flex;
    justify-content: space-between;
}

.submit-btn {
    flex: 1;
    margin: 0 0.3rem;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    background: var(--accent);
    color: var(--bg);
    transition: all 0.2s;
}

.cancel-btn {
    flex: 1;
    margin: 0 0.3rem;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    background-color: transparent;
    color: var(--text);
    border: 1px solid var(--accent);
    transition: all 0.2s;
}

.modal-actions button:hover {
    background: var(--sec);
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
</style>