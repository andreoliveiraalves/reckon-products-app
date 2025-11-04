import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Define the user schema
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long']
        }
    },
    {
        timestamps: true // adds createdAt and updatedAt automatically
    }
)

// hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

// compare plain password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password)
}

export const User = mongoose.model('User', userSchema)