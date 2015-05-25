

$("#starting").hide();
$("#game").hide();
$("#gamename").hide();
$("#solucion").hide();
$("#nivel input").val("1");
marcador = $(".badge p");
sol = $("#solucion");

juego = "";
adivinanza = [];
datos = [];
datoscapitales = [];
datosmonumentos1 = [];
datosmonumentos2 = [];
nivel = 1;
nfotos = 0;
puntuacion = 0;
cont = 0;
urlsfotos = [];
jugados = [];
njugados = 0;
estoy = 0;
gamename = "";

function mapa(){

	var marker;
	markers = new L.FeatureGroup();
	map = L.map('map').setView([0, 0], 2);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
   	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://           				creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    			maxZoom: 18
  	}).addTo(map);
	
 	
   	map.on('click', function(e) {
	
		marker = L.marker([e.latlng.lat, e.latlng.lng]);
		marker.addTo(map);
		calculardistancia(e, marker);
		markers.addLayer(marker);
		marker2 = L.marker([adivinanza[1][0],adivinanza[1][1] ]).addTo(map).bindPopup(adivinanza[0]+"."+adivinanza[2]).openPopup();
		markers.addLayer(marker2);
		map.addLayer(markers);
    	});
};


//funciones que obtienen el json con el juego
$.getJSON("juegos/capitales.json", function(data){
	datoscapitales = data.features;
});
$.getJSON("juegos/monumentos1.json", function(data){
	datosmonumentos1 = data.features;
});
$.getJSON("juegos/monumentos2.json", function(data){
	datosmonumentos2 = data.features;
});



function flickr(adivinanza){

	console.log("ETIQUETA: "+adivinanza[0]+"place:"+adivinanza[2]);
	var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
		$.getJSON( flickerAPI, {
			tags: adivinanza[0],
			tagmode: "all",
			text: adivinanza[2],
			content_type: "1",
			safe_search: "1",
			format: "json"
		}).done(function( data ) {
			$.each( data.items, function( i, item ) {
				urlsfotos[i] = item.media.m ;
			});
			mostrarimagen()
		});
}

function toRad(degrees){
    return degrees * Math.PI / 180;
}

function calculardistancia(e){

	var R = 6371; 
	dLat = toRad(e.latlng.lat - adivinanza[1][0]);
	dLon = toRad(e.latlng.lng - adivinanza[1][1]);
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(adivinanza[1][0])) * Math.cos(toRad(e.latlng.lat)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	d = R * c;
	solucion();
}

function addpuntuacion(puntos){

	puntuacion = (parseInt(marcador.text()) + parseInt(puntos));
	marcador.text(puntuacion);
}

function solucion(){

	clearInterval(timevar);
	puntos = (2000 / (nfotos*parseInt(d)));
	puntos = parseFloat(parseFloat(puntos).toFixed(0));
	sol.addClass("alert alert-info");
	sol.html("<p class='text-center'>Solución a la adivinanza: "+ adivinanza[0]+" en "+adivinanza[2]+"</p>" +
		  "<p class='text-center'>Número de fotos mostradas: "+nfotos+"</p>"+
		  "<p class='text-center'>Distancia al lugar correcto: "+ parseInt(d)+"km</p>" +
		  "<p class='text-center'>Puntuación obtenida en la adivinanza: "+puntos+"</p>"+
	 "<a  id= 'siguiente' class='btn btn-sm btn-info'><span class='glyphicon glyphicon-question-sign'></span> nueva adivinanza</a>");
	sol.show();
	addpuntuacion(puntos);
	$("#siguiente").click(function(){
		marker2.closePopup();
		sol.hide();
		play(l1,l2,z);
	});
}

function cambiarimagen(){

	$("#foto img").attr("src", urlsfotos[nfotos]);
	nfotos = nfotos + 1;
}

function mostrarimagen(){
	
	tiempo = (1000 / nivel);
	cambiarimagen();
	timevar = setInterval(function(){
		cambiarimagen();
	}
	,tiempo*5);
}
function play(l1,l2,z){

	map.setView([l1, l2], z);
	map.invalidateSize();
	map.removeLayer(markers);
	markers = new L.FeatureGroup();
	nfotos = 0;
	n = [Math.floor(Math.random()*datos.length)];
	adivinanza[0] = datos[n].properties.name;
	adivinanza[1] = datos[n].geometry.coordinates;
	adivinanza[2] = datos[n].properties.place;
	flickr(adivinanza);
}   

function start(juego){
	
	$("#starting").hide();
	$("#game").show();
	
	if ( cont == 0 ){
		mapa();
		cont = 1;
	}
	
	nivel = $("#nivel input").val();
	if (juego == "Capitales"){
		l1 = 0;
		l2 = 0;
		z = 1;
		datos = datoscapitales;
		play(l1,l2,z);
	}else if (juego == "Monumentos1"){
		datos = datosmonumentos1;
		l1 = 55; 
		l2 = 33;
		z = 3;
		play(l1,l2,z);
	}else if (juego == "Monumentos2"){
		l1 = 0;
		l2 = 0;
		z = 1;
		datos = datosmonumentos2;
		play(l1,l2,z);
	}
}	

function prestart(juego){

	nfotos = 0;
	puntuacion = 0;
	marcador.text(puntuacion);
	cabecera = $("#welcome").hide();
	$("#gamename p").html("<h1>ADIVINA DONDE ESTÁ:</h1><h2>"+gamename+"</h2>");
	$("#gamename").show();
	$("#starting").show();
	$("#start").click(function(){		
 		start(juego);
	});
}
function restart(){
	sol.hide();
	clearInterval(timevar);
	puntuacion = 0;
	marcador.text(puntuacion);
 	$("#game").hide();
 	$("#starting").show();
}

//programa eleccion de juegos
$("#juego1").click(function(){
	juego = "Capitales";
	gamename = "Capitales del mundo";
	mypush();
	prestart(juego);
});
$("#juego2").click(function(){
	juego = "Monumentos1";
	gamename = "Monumentos de Europa";
	mypush();
	prestart(juego);
});
$("#juego3").click(function(){
	juego = "Monumentos2";
	gamename = "Monumentos del mundo";
	mypush();
	prestart(juego);
});

$("#stop").click(function(){
	restart();
});

$("#new").click(function(){
	savestate();
	cabecera.show();
	$("#game").hide();
	$("#gamename").hide();
	$("#solucion").hide();
});	 

window.addEventListener('popstate', function(event) {
  load(event);
});

function redirec(event){
	$("#"+event.originalTarget.id).hide();
	
	for ( i = 0; i < jugados.length; i++){
		if (jugados[i] == event.originalTarget.id){
			var go = estoy - i -1;
			estoy = estoy - go;
			window.history.go(-(go));
		}else{
			$("#"+jugados[i]).show();
		}
	}

}
function mypush(){
	
	for (i = 0; i < jugados.length; i++) { //recorre lista de luegos jugados
    		if(jugados[i] == juego){//comprueba si el que quiero guardar ya esta
			var encontrado = true;
			break;
		}
	}
	if (encontrado){
		window.history.replaceState({"juego": juego, "nivel": nivel, "puntuacion": puntuacion, "gamename": gamename}, "", 			"/"+juego);
	} else if(!encontrado){
		jugados[njugados] =juego
		njugados++;
		estoy++
		window.history.pushState({"juego": juego, "nivel": nivel, "puntuacion": puntuacion,"gamename": gamename}, "", "/"+juego);
	}
}

function savestate(){

	var date = new Date().toString();
	date = date.split("GMT");
	puntuacion = marcador.text()
	mypush();
	$("#"+juego).html(("#gamename")+".    " +date[0]+".  puntuacion : "+ puntuacion);
	$("#"+juego).show();
}

function load(event){

	$("#solucion").hide();
	juego = event.state.juego;
	gamename = event.state.gamename; 
	$("#gamename p").html("<h1>ADIVINA DONDE ESTÁ:</h1><h2>"+gamename+"</h2>");
	nivel = event.state.nivel;
	puntuacion = event.state.puntuacion;
	marcador.text(puntuacion);
	start(juego);
	
}

/*funcion para la barra de dificultad*/
var action;
    $(".number-spinner button").mousedown(function () {
        btn = $(this);
        input = btn.closest('.number-spinner').find('input');
        btn.closest('.number-spinner').find('button').prop("disabled", false);

    	if (btn.attr('data-dir') == 'up') {
            action = setInterval(function(){
                if ( input.attr('max') == undefined || parseInt(input.val()) < parseInt(input.attr('max')) ) {
                    input.val(parseInt(input.val())+1);
                }else{
                    btn.prop("disabled", true);
                    clearInterval(action);
                }
            }, 50);
    	} else {
            action = setInterval(function(){
                if ( input.attr('min') == undefined || parseInt(input.val()) > parseInt(input.attr('min')) ) {
                    input.val(parseInt(input.val())-1);
                }else{
                    btn.prop("disabled", true);
                    clearInterval(action);
                }
            }, 50);
    	}
    }).mouseup(function(){
        clearInterval(action);
    });

