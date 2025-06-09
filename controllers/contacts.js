const contactRouter = require('express').Router()
const Contact = require('../models/contact')

contactRouter.get('/', async (request, response) => {
  const contacts = await Contact
    .find({})

  response.json(contacts)
})

contactRouter.get('/:id', async (request, response) => {
  const contact = await Contact.findById(request.params.id)
  if (contact) {
    response.json(contact)
  } else {
    response.status(404).end()
  }
})

contactRouter.post('/', async (request, response, next) => {
  const body = request.body

  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  try {
    const savedContact = await contact.save()
    response.json(savedContact)
  } catch (error) {
    next(error)
  }
})

contactRouter.delete('/:id', async (request, response, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(request.params.id)
    if (contact) {
      response.status(204).end()
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

contactRouter.put('/:id/number', async (request, response, next) => {
  const { number } = request.body

  try {
    const updatedContact = await Contact.findByIdAndUpdate(request.params.id,
      { number }, { new: true, runValidators: true })
    if (updatedContact) {
      response.json(updatedContact)
    } else {
      response.status(404).end()
    }
  }
  catch (error) {
    next(error)
  }
})

module.exports = contactRouter
