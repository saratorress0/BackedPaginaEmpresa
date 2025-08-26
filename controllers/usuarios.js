const usuariosRouter = require('express').Router()
const Usuario = require('../models/usuario')

usuariosRouter.get('/', async (request, response) => {
  const usuarios = await Usuario.find({})
  response.json(usuarios)
})

usuariosRouter.get('/:id', async (request, response) => {
  const usuario = await Usuario.findById(request.params.id)
  if (usuario) {
    response.json(usuario)
  } else {
    response.status(404).end()
  }
})

usuariosRouter.post('/', async (request, response, next) => {
  const { username, password } = request.body

  if (!username || !password) {
    return response.status(400).json({ error: 'username and password are required' })
  }

  const usuario = new Usuario({
    username,
    password
  })

  try {
    const savedUsuario = await usuario.save()
    response.status(201).json(savedUsuario)
  } catch (error) {
    next(error)
  }
})

usuariosRouter.delete('/:id', async (request, response, next) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(request.params.id)
    if (usuario) {
      response.status(204).end()
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

usuariosRouter.put('/:id', async (request, response, next) => {
  const { username, password } = request.body

  try {
    const updatedUsuario = await Usuario.findByIdAndUpdate(
      request.params.id,
      { username, password },
      { new: true, runValidators: true }
    )

    if (updatedUsuario) {
      response.json(updatedUsuario)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})


module.exports = usuariosRouter

