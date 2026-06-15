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

const regions = {
  kanto: { min: 1, max: 151 },
  johto: { min: 152, max: 251 },
  hoenn: { min: 252, max: 386 },
  sinnoh: { min: 387, max: 493 },
  unova: { min: 494, max: 649 },
  kalos: { min: 650, max: 721 },
  alola: { min: 722, max: 809 },
  galar: { min: 810, max: 898 },
  hisui: { min: 899, max: 905 },
  paldea: { min: 906, max: 1025 }
};

const pokeball = {
      name: 'Pokéball',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
      }

// Hier beginnen de views
app.get ('/', async function (request, response) {

const searchQuery = (request.query.search || '').toLowerCase().trim();
const regionQuery = (request.query.region || '').toLowerCase().trim();
const typeQuery = (request.query.type || '').toLowerCase().trim();

    let pokemon = getDataJSON.results.map(function(item) {
        const urlParts = item.url.split('/')
        const id = parseInt(urlParts[urlParts.length - 2], 10);
        return {
            name: item.name,
            id: id,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
        }
    })

    if (searchQuery) {
        pokemon = pokemon.filter(p => p.name.toLowerCase().includes(searchQuery))
    }

    if (regionQuery && regions[regionQuery]) {
            const { min, max } = regions[regionQuery];
            pokemon = pokemon.filter(p => p.id >= min && p.id <= max);
        }

    if (typeQuery) {
            try {
                const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${typeQuery}`);
                if (typeResponse.ok) {
                    const typeData = await typeResponse.ok ? await typeResponse.json() : null;
                    if (typeData) {
                        // Extract the IDs of all Pokémon that have this type
                        const allowedIds = typeData.pokemon.map(p => {
                            const parts = p.pokemon.url.split('/');
                            return parseInt(parts[parts.length - 2], 10);
                        });
                        
                        // Filter our main list to only include these IDs
                        pokemon = pokemon.filter(p => allowedIds.includes(p.id));
                    }
                }
            } catch (error) {
                console.error("Error fetching type data:", error);
            }
        }

    response.render('index.liquid', {
    pokemon: pokemon,
    searchQuery: searchQuery,
    regionQuery: regionQuery,
    typeQuery: typeQuery,
    pokeball: pokeball
    })
})

app.post('/:id/catch', async function (request, response){
  const postResponse = await fetch("https://fdnd-agency.directus.app/items/pokemon_catches", {
    method: "POST",
    headers: { 
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
        pokemon_id: request.params.id,
        user_id: '1'
    })
  })
})

app.get('/caught', async function (request, response) {
    const caughtPokemonData = await fetch('https://fdnd-agency.directus.app/items/pokemon_catches/?filter[user_id]_eq=1')
    const caughtPokemonJson = await caughtPokemonData.json()
    const caughtItems = caughtPokemonJson.data

    const caughtIds = new Set(caughtItems.map(item => item.pokemon_id))

    const pokemon = getDataJSON.results
        .map(function(item) {
            const urlParts = item.url.split('/')
            const id = parseInt(urlParts[urlParts.length - 2], 10);
            return {
                name: item.name,
                id: id,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
            }
        })
        // ONLY keep the pokemon if their ID exists in our caughtIds Set
        .filter(p => caughtIds.has(p.id))


    response.render('caught.liquid', {
        pokemon: pokemon,
        pokeball: pokeball
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

