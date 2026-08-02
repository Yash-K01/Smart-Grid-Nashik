const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },

    mobile: {
        type: String,
        required: true,
        trim: true,
        match: /^[6-9]\d{9}$/
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    meterNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },

    area: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },

    role: {
        type: String,
        enum: ["user"],
        default: "user"
    }

},
{
    timestamps:true
});