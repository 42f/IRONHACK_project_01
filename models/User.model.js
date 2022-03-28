const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");


function avatarGen(username){
  return `https://avatars.dicebear.com/api/adventurer/${username}.svg`
}

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {type: String, unique:true, required:true},
    userName: {type: String, unique:true, required:true},
    avatarUrl: String,
    password: String,
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = async function(candidatePassword) {
  // try {
    const match = await bcrypt.compare(candidatePassword, this.password);
    if (match) {
      return true;
    }
    throw new Error('Invalid Password')
  // } catch (error) {
  //   console.error(error);
  //   return false;
  // }
};

const User = model("User", userSchema);

module.exports = User;
