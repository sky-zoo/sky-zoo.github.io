document.getElementById("btnEnviar").addEventListener("click", function(evento){
	evento.preventDefault();
	buscarPokemon();
});

let botonContacto = document.getElementById("botonContacto");
botonContacto.addEventListener("click", function(){
	console.log("Hola");
});

/*
	Muestra en la carta del pokemon cuales son sus evoluciones

	Precondicion: 'elementoADibujar' debe ser un elemento
	del DOM en el cual se va a mostrar las evoluciones, y
	'evoluciones' debe ser un array con las evoluciones del pokemon buscado


*/
function mostrarEvoluciones(elementoADibujar, evoluciones){
	elementoADibujar.innerHTML += 
	`
		<table class="table table-dark">
			<thead>
				<tr id="cabeceraEvoluciones" class="text-center">
					
				</tr>
			</thead>
			<tbody>
				<tr id="evoluciones" class="text-center">

				</tr>
			</tbody>
		</table>
	`;
	let cabeceraEvoluciones = document.getElementById("cabeceraEvoluciones")
	let contenedorEvoluciones = document.getElementById("evoluciones");

	for(let i = 0; i < evoluciones.length; i++){
		if(evoluciones[i] !== null){
			if(i == 0){
				cabeceraEvoluciones.innerHTML += `<th>Base Pokemon</th>`;
			}else{
				cabeceraEvoluciones.innerHTML += `<th>Evolution ${i}</th>`;
			}

			contenedorEvoluciones.innerHTML += `<td>${evoluciones[i]}</td>`;
		}
	}
}
/*
	Busca y muestra en la carta del pokemon, las evoluciones del pokemon buscado

	Precondicion: 'elementoADibujar' debe ser un elemento del DOM en el cual se va a
	mostrar la informacion buscada y 'url' debe ser una URL de PokeAPI para buscar
	la informacion de la evoluciones del pokemon.
*/
function buscarYMostrarEvoluciones(elementoADibujar, url){

	let peticionInfoPokemon = new XMLHttpRequest();
	let peticionEvoluciones = new XMLHttpRequest();


	peticionInfoPokemon.onreadystatechange = function(){

		if(this.readyState == 4 && this.status == 200){

			// Obtengo la URL para buscar las evoluciones de
			// el pokemon buscado
			let respuesta = JSON.parse(this.responseText);
			
			peticionEvoluciones.open("GET", respuesta["evolution_chain"]["url"], true);
			peticionEvoluciones.send();
			
		}

		
	}

	peticionEvoluciones.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			let respuesta = JSON.parse(this.responseText);

			let pokemonBase = respuesta["chain"]["species"]["name"];

			let primeraEvolucion = respuesta["chain"]["evolves_to"].length !== 0 ?
					respuesta["chain"]["evolves_to"][0]["species"]["name"]
					: null;

			let segundaEvolucion =
				primeraEvolucion !== null && respuesta["chain"]["evolves_to"][0]["evolves_to"].length !== 0 ?
				respuesta["chain"]["evolves_to"][0]["evolves_to"][0]["species"]["name"] : null;

			
			let evoluciones = [pokemonBase, primeraEvolucion, segundaEvolucion];

			mostrarEvoluciones(elementoADibujar, evoluciones);
			
		}
	}

	peticionInfoPokemon.open("GET", url, true);
	peticionInfoPokemon.send();

}

/*

	Busca al pokemon que ingrese el usuario en la barra
	de busqueda.

	Postcondicion: dibuja una carta en la pantalla con
	informacion basica del pokemon.
	En caso de error pide al usuario que ingrese un
	nombre valido o que hubo un error al buscar al
	pokemon

*/
function buscarPokemon(){
	let busqueda = document.getElementById("nombrePokemon").value;

	let listaPokemones = document.getElementById("pokemones");

	let peticionBusqueda = new XMLHttpRequest();

	let pantallaDeCarga = document.getElementById("pantallaDeCarga");
	pantallaDeCarga.style.display = 'flex';

	if(busqueda.length == 0){
		listaPokemones.innerHTML = "<h2 class='text-center'>Please introduce the name/ID of a pokemon</h2>";
		ocultarElemento(pantallaDeCarga);
	}else{

		peticionBusqueda.onreadystatechange = function(){

			if(this.readyState == 4 && this.status == 200){
				let respuesta = JSON.parse(this.responseText);

				dibujarCaracteristicas(listaPokemones, respuesta);
				dibujarEspecificaciones(listaPokemones, respuesta);

				let URLPokemonABuscar = respuesta["species"]["url"];
				buscarYMostrarEvoluciones(listaPokemones, URLPokemonABuscar);
				


			}else if(this.status == 404){
				listaPokemones.innerHTML = `<h2 class="text-center">An error has ocurred finding the pokemon :(</h2>`;
				ocultarElemento(pantallaDeCarga);

			}else if(this.readyState === 4 && this.status !== 200){
				listaPokemones.innerHTML = `<h2 class="text-center">An error has ocurred finding the pokemon :(</h2>`;
				ocultarElemento(pantallaDeCarga);
			}

			

		};

		peticionBusqueda.onerror = function(){
			listaPokemones.innerHTML = `<h2 class="text-center">Conection error :(</h2>`;
		};

		
	}

	peticionBusqueda.open("GET", `https://pokeapi.co/api/v2/pokemon/${busqueda}`, true);
	peticionBusqueda.send();
}

/*
	Baja la opacidad a cero de un elemento en la pantalla
	Precondicion: recibe un elemento del DOM
*/
function ocultarElemento(elemento){

	elemento.style.display = 'none';

}

/*
	Dibujar una tabla con el peso, altura,
	las habilidades y tipos del pokemon buscado

	Precondicion: 'elementoADibujar' debe ser un elemento
	del DOM en el cual se va a dibujar la tabla, y
	'statsPokemon' debe ser un JSON con la informacion
	del pokemon buscado a traves de la API PokeAPI.
*/
function dibujarEspecificaciones(elementoADibujar, statsPokemon){

	elementoADibujar.innerHTML += 
				`<table class="table table-dark">
				 	<thead>
				 		<tr id="especificacionesHeader" class="text-center">
				 			<th>Weight</th>
				 			<th>Height</th>
				 		</tr>
				 	</thead>

				 	<tbody>

				 		<tr id="especificaciones" class="text-center">
				 			<td>${statsPokemon["weight"] / 10} kg</td>
				 			<td>${statsPokemon["height"] / 10} m</td>

				 		</tr>

				 	</tbody>
				</table>`;

	let especificacionesHeader = document.getElementById("especificacionesHeader")
	let especificaciones = document.getElementById("especificaciones");

	for(let i = 0; i < statsPokemon["abilities"].length; i++){
		if(!statsPokemon["abilities"][i]["is_hidden"]){
			especificacionesHeader.innerHTML += `<th>Ability ${i+1}</th>`;
			especificaciones.innerHTML += `<td>${statsPokemon["abilities"][i]["ability"]["name"]}</td>`;
		}
		
	}

	for(let i = 0; i < statsPokemon["types"].length; i++){
		especificacionesHeader.innerHTML += `<th>Type ${i + 1}</th>`;
		especificaciones.innerHTML += `<td>${statsPokemon["types"][i]["type"]["name"]}</td>`;

	}
}

/*
	Dibuja la tabla con las caracteristicas del pokemon
	buscado por el usuario.

	Precondicion: 'elementoADibujar' debe ser un elemento
	del DOM en el cual se va a dibujar la tabla, y
	'statsPokemon' debe ser un JSON con la informacion
	del pokemon buscado a traves de la API PokeAPI.

*/

function dibujarCaracteristicas(elementoADibujar, statsPokemon){
	let imgPokemon = statsPokemon["sprites"]["front_default"];
	let gifPokemon = statsPokemon["sprites"]["versions"]["generation-v"]["black-white"]["animated"]["front_default"];

	/*
		Si existe un gif para mostrar el pokemon entonces
		lo uso. Si no hay un gif entonces muestro una imagen.
	*/
	let imagenParaUsar = gifPokemon !== null ? gifPokemon : imgPokemon;

	elementoADibujar.innerHTML =
				`<div class="carta">
						<img onload="ocultarElemento(pantallaDeCarga)" src="${imagenParaUsar}" alt="Imagen de un Pokemon">
						
				 </div>
				 <div class="nombre">
							<h2><i>#${statsPokemon["id"]} </i>${statsPokemon["name"]
							.charAt(0).toUpperCase() + statsPokemon["name"].slice(1)}</h2></h2>
							
						</div>
				 <table class="table table-dark">
				 	<thead>
				 		<tr class="text-center">
				 			<th>HP</th>
				 			<th>Attack</th>
				 			<th>Defense</th>
				 			<th>Special Attack</th>
				 			<th>Special Defense</th>
				 			<th>Speed</th>
				 		</tr>
				 	</thead>
				 	<tbody>
				 		<tr id="valoresCaracteristicas" class="text-center">

				 		</tr>
				 	</tbody>
				</table>
				`;
	let valoresCaracteristicas = document.getElementById("valoresCaracteristicas");
	
	for(let i = 0; i < statsPokemon["stats"].length; i++){
		valoresCaracteristicas.innerHTML += 
		`<td>${statsPokemon["stats"][i]["base_stat"]}</td>
		 `;
	}

}