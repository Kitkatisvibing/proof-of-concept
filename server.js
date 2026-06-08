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
    pokemon: pokemon,
    pokeball: {
      name: 'Pokéball',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
      }
    })
})

app.get('/pokemon/:id', async function (request, response, next) {
    // Haal het ID uit de URL (bijv. /pokemon/25 -> id is 25)
    const pokemonId = request.params.id
        // Haal de specifieke data op voor deze Pokémon
        const detailData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
        const speciesData = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)

try {
        // Haal de specifieke data op voor deze Pokémon
        const detailData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
        const speciesData = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)

        if (!detailData.ok || !speciesData.ok) {
            return next()
        }

        const pokemonDetail = await detailData.json()
        const speciesDetail = await speciesData.json()

        const pokemonInfo = {
            id: pokemonDetail.id,
            name: pokemonDetail.name,
            height: pokemonDetail.height / 10, // API geeft dit in decimeters, /10 maakt het meters
            weight: pokemonDetail.weight / 10, // API geeft dit in hectograms, /10 maakt het kg
            image: pokemonDetail.sprites.other['official-artwork'].front_default,
            types: pokemonDetail.types.map(t => t.type.name), // maakt een lijst van types
            color: speciesDetail.color.name
        }

response.render('pokemon.liquid', {
            pokemon: pokemonInfo
        })
} 

    catch (error) {
        // ga naar 404 pagina als er een fout is (bijv. ongeldig ID)
        console.error("An unexpected error occurred:", error)
        next()
    }
})

app.use(function (request, response) {
    // 1. Get a random index based on the total number of Pokémon fetched
    const totalPokemon = getDataJSON.results.length
    const randomIndex = Math.floor(Math.random() * totalPokemon)
    
    // 2. Get the random Pokémon item
    const randomPokemon = getDataJSON.results[randomIndex]
    
    // 3. Extract the ID from the URL just like you did for the index route
    const urlParts = randomPokemon.url.split('/')
    const id = urlParts[urlParts.length - 2]
    
    // 4. Construct the data object to pass to the view
    const errorPokemon = {
        name: randomPokemon.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    }

    // 5. Render the error page and pass the random Pokémon data
    response.status(404).render('error.liquid', { 
        pokemon: errorPokemon
    })
})

// Localhost setup

app.set('port', process.env.PORT || 8000)

app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`http://localhost:${app.get('port')}`)
})

