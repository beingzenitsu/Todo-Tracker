import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
         description:{ 
            type: String,
             default: "" 
        },
        completed: {
            type: Boolean,
            default: false,
        },
        status:{
            type: String,
            enum: ["todo", "in_progress", "done"],
            default: "todo"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        deleted:{ 
            type: Boolean,
             default: false
        }, 
        category:{ 
            type: String,
             default: "General" 
        }, 
        dueDate:{ 
            type: Date 
        }, 
        reminder: { type: Boolean, default: false }, 
    }, 
    { timestamps: true }
);
    
export default mongoose.model("Todo", todoSchema);