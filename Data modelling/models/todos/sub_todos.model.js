import mongoose from 'mongoose';

const subTodoSchema = new mongoose.Schema({
  Title:{
    type: String,
    required:true,
  },
  complete:{
    type: Boolean,
    default:true,
  },
  CreatedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }
}, { timestamps: true });

export const SubTodo = mongoose.model('SubTodo', subTodoSchema);
