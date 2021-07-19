const { Schema, model } = require('mongoose');

const listSchema = new Schema({
    available: [{
     type: Schema.Types.ObjectId,
     ref: "User"
    }],
    excluded: [{
      type: Schema.Types.ObjectId,
      ref: "User"
     }],

  });

module.exports = model('List', listSchema);

//DRY Dont repeat yourself
