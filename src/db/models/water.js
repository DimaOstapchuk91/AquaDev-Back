import { mongoose } from "mongoose";

const waterPortionSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        // userId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     required: true
        // }
    },
    {
    timestamps: true,
    versionKey: false
    }
);

export const WaterPortion = mongoose.model('WaterPortion', waterPortionSchema);
