const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({
  homeName: {type: String, required: true},
  Price: {type: Number, required: true},
  location: {type:String, required: true},
  Rating: {type: Number, required: true},
  photo: String,
  description: String,
});

// homeSchema.pre('findOneAndDelete', async function(next) {
//   const homeId = this.getQuery()._id;
//   await favourite.deleteMany({homeId: homeId});
//   next();
// });

module.exports = mongoose.models.Home || mongoose.model('Home', homeSchema);
