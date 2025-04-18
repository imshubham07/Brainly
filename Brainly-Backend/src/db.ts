import { hash } from "bcrypt";
import mongoose, {model, Schema } from "mongoose";
import { string } from "zod";

mongoose.connect("mongodb+srv://learningMongodb:uj67mjT4Q5f_gWp@learningdatabase.eywgm.mongodb.net/Brainly")
const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
});

const ContentSchema = new Schema({
  title: String,
  link:String,
  tag:[{type:mongoose.Types.ObjectId, ref:"Tag"}],
  userId:[{type:mongoose.Types.ObjectId, ref:"User", require:true}]
})

const LinkSchema =  new Schema({
  hash:String,
  userId:[{type:mongoose.Types.ObjectId, ref:"User", require:true, unique:true}]

})

//export the moddel 
 export const UserModel = model("User", UserSchema)
export const ContentModel = model("Content", ContentSchema)
export const LinkModel = model("Link",LinkSchema)