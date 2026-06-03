// Server setup

import express from 'express'
import { Liquid } from 'liquidjs';
const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
const engine = new Liquid()
app.engine('liquid', engine.express())
app.set('views', './views')


// Hier beginnen de views
app.get('/', async function (request, response) {

  const type = request.query.pokemon

  const pokemonResponse = await fetch('https://pokeapi.co/api/v2/pokemon')

  const pokemonResponseJSON = await pokemonResponse.json()

  response.render('index.liquid', {
    pokemon: pokemonResponseJSON,
  })
})
// Localhost setup

app.set('port', process.env.PORT || 8000)

app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`http://localhost:${app.get('port')}/ Pokemon\n\nGotta catch 'em all!`)
})

