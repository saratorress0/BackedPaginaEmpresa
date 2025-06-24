const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    unique: true
  },
  number: {
    type: String,
    required: true,
    minlength: 10,
    unique: true
  },
  email: { 
    type: String, 
    required: true 
  }, // Nuevo campo
  subject: { 
    type: String, 
    required: true 
  }, // Nuevo campo
  message: { 
    type: String, 
    required: true
  }
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contactSchema)
