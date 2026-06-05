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
const pokemon = getDataJSON.results.map(function(item) {
        // Splits de URL op '/' en pak het een-na-laatste element (het ID)
        const urlParts = item.url.split('/')
        const id = urlParts[urlParts.length - 2]
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

app.get('/pokemon/:id', async function (request, response) {
    // Haal het ID uit de URL (bijv. /pokemon/25 -> id is 25)
    const pokemonId = request.params.id
        // Haal de specifieke data op voor deze Pokémon
        const detailData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
        const pokemonDetail = await detailData.json()

        const pokemonInfo = {
            id: pokemonDetail.id,
            name: pokemonDetail.name,
            height: pokemonDetail.height / 10, // API geeft dit in decimeters, /10 maakt het meters
            weight: pokemonDetail.weight / 10, // API geeft dit in hectograms, /10 maakt het kg
            image: pokemonDetail.sprites.other['official-artwork'].front_default,
            types: pokemonDetail.types.map(t => t.type.name) // maakt een lijst van types
        }

        // Render de nieuwe detail.liquid pagina en geef de info mee
        response.render('pokemon.liquid', {
            pokemon: pokemonInfo
        })
})

app.use(function (request, response) {
    response.status(404).render('error.liquid', {})
})

// Localhost setup

app.set('port', process.env.PORT || 8000)

app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`http://localhost:${app.get('port')}`)
})

