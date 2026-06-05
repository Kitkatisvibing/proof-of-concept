// Server setup

import express from 'express'
import { Liquid } from 'liquidjs';
const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
const engine = new Liquid()
app.engine('liquid', engine.express())
app.set('views', './views')

const getData = await fetch ('https://pokeapi.co/api/v2/pokemon?limit=1025')

const getDataJSON = await getData.json()

// Hier beginnen de views
app.get ('/', async function (request, response) {

// deze const haalt de images uit de API
const pokemon    = getDataJSON.results.map(function(item, index) {
    const id = index + 1 
    return {
        name: item.name,
        id: id,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    }
})
    response.render('index.liquid', {
    pokemon: pokemon
    })
})

// Localhost setup

app.set('port', process.env.PORT || 8000)

app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`http://localhost:${app.get('port')}/ Pokemon\n\nGotta catch 'em all!`)
})

