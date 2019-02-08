
//Seteamos el area del SVG
  var margin = {top: 0, right: 10, bottom: 0, left: 10},
      width = 1500 - margin.left - margin.right,
      height = 600 - margin.bottom - margin.top,
      sliderPosition = {top: height - 50, left: width / 2 + 10,
                        height: 40, width: width / 2 - 30},
      areaHeight = 100,
      mapScale = 700,
      mapTranslate = [480, 200],
      startingValue = 0;


d3.select(window)
  		.on("resize", sizeChange);

//Funcion que lo hace responsive
function sizeChange() {	   

      if ($("svg").width()<800){
        
        //Si la pantalla es menor a los 800px  se modifica el tamaño y se modifican los ejes x e y para centrar la vista
        d3.select("g").attr("transform", "scale(" + $("#contenedor").width()/1400 + ")");
        $("svg").height($("#contenedor").width()/1.3);
        
        //Se modifican los ejes
        svg.transition()
           .attr("transform", "translate(" + -550 + "," + -100 + ")");

        svg.selectAll("rect")
            .style("display", "none")//Oculto el slider;

        svg.selectAll("text")
           .style("display", "none")//Oculto el slider;*/        
               
      }else{
        //Si la pantalla supera los 800 px se usa la otra resolucion
        d3.selectAll("g").attr("transform", "scale(" + $("#contenedor").width()/1400 + ")");
        $("svg").height($("#contenedor").width()/1.3); 
           
      }
	}


  // Escalas para el slider
  var x = d3.scale.linear()
      .range([0, sliderPosition.width])
      .clamp(true);

  var y = d3.scale.linear()
      .range([0, areaHeight]);

  var svg = d3.select("#contenedor").append("svg")
    .attr("width", "100%")
    .append("g");     

  var button = d3.select("contenedor").append("button")
    .attr("class", "play")
    .style("display", "block")//Oculto el botón play
    .text("▶ Play")


  var gArea = svg.append("g")
  	.attr("class", "area-chart")
  	.attr("transform", "translate(" + sliderPosition.left + ","
        + (sliderPosition.top + sliderPosition.height / 2 - areaHeight) + ")")
  	.append("path")
    .attr("class", "area")
    .style("display", "none")//Oculto el slider
    .attr("clip-path", "url(#clipRect)");

  var clipRect = svg.append("clipPath")
      .attr("id", "clipRect")
  	  .append("rect")
      .attr("width", sliderPosition.width)
      .attr("height", areaHeight);

  //// Comienza el slider

  // Se define un brush
  var brush = d3.svg.brush()
      .x(x)
      .extent([startingValue, startingValue]);
      

  var sliderBox = svg.append("g")
  		.attr("class", "slider-box")
  		.attr("transform", "translate(" + sliderPosition.left + ","
           														+ sliderPosition.top + ")")
  		.attr("height", sliderPosition.height)
      .style("opacity", 0)//Se oculta el slider
  		.attr("width", sliderPosition.width);


  var slider = sliderBox.append("g")
      .attr("class", "slider")
      .call(brush);

  slider.selectAll(".extent,.resize")
      .remove();

  slider.select(".background")
      .attr("height", height);

  var handle = slider.append("g")
      .attr("class", "handle")


  handle.append("path")
      .attr("transform", "translate(0," + sliderPosition.height / 2 + ")")
      .attr("d", "M 0 -20 V 5")

  handle.append('text')
  	.attr("class", "year")
    .text(startingValue)
    .attr("text-anchor", "middle")
    .attr("transform", "translate(0," + (sliderPosition.height / 2 + 25) + ")");

  handle.append('text')
  	.attr("class", "count")
    .text(0)
    .attr("text-anchor", "middle")
    .attr("transform", "translate(0," + (-100) + ")");

  var area = d3.svg.area()
      .x(function(d) { return x(+d.opening_date_new); })
      .y0(height)
      .y1(function(d) { return y(d.close); });

  // Finaliza el slider

  // Mapa. Proyecciòn y límites
  var projection = d3.geo.transverseMercator()
                          .center([4.2, -34.9])
                          .rotate([66, 0])
                          .scale((height *590.5) / 33)
                          .translate([(width / 4), (height / 2)]);


  var path = d3.geo.path()
            .projection(projection)
            .pointRadius(1.5);


  var points;

  queue()
      .defer(d3.json, "js/sudamerica.json")
      .defer(d3.tsv, "js/datos.tsv")
      .await(ready);

 
  function ready(error,us, datos) {
    if (error) throw error;

    datos.forEach(function(d){
      d.opening_date_new = +d.opening_date_new,
      d.latitude = +d.latitude,
      d.longitude = +d.longitude,
      d.name = d.name,
      d.projected_xy = projection([d.longitude, d.latitude])

    })



    var total = d3.nest()
    	.key(function(d){ return d.opening_date_new; })
  		.rollup(function(d) { return d.length; })
  		.entries(datos);



//Funcion para contar los registros de cada caso y poner porcentajes de imagen
  function contar(){
      if(candidato == 'Macri'){

      var registros = d3.nest()
        	.key(function(d){ return d.imagenPositivaNegativaMacri; })
      		.rollup(function(d) { return d.length; })
      		.entries(datos);
         
      var totales = registros[0].values + registros[1].values + registros[2].values;

      function porcentaje(x){
        return Math.floor(x/totales*100);
        }

      positivo = porcentaje(registros[0].values);
      negativo = porcentaje(registros[1].values);
      nosabe = porcentaje(registros[2].values);



      }else if(candidato == 'F. de Kirchner'){

        var registros = d3.nest()
        	.key(function(d){ return d.imagenPositivaNegativaCristina; })
      		.rollup(function(d) { return d.length; })
      		.entries(datos);


          var totales = registros[0].values + registros[1].values + registros[2].values;

          function porcentaje(x){
            return Math.floor(x/totales*100);
            }

          positivo = porcentaje(registros[0].values);
          negativo = porcentaje(registros[1].values);
          nosabe = porcentaje(registros[2].values);



      }else if (candidato == 'Vidal'){


        var registros = d3.nest()
        	.key(function(d){ return d.imagenPositivaNegativaVidal; })
      		.rollup(function(d) { return d.length; })
      		.entries(datos);
         

          var totales = registros[0].values + registros[1].values + registros[2].values;

          function porcentaje(x){
            return Math.floor(x/totales*100);
            }

          positivo = porcentaje(registros[0].values);
          negativo = porcentaje(registros[1].values);
          nosabe = porcentaje(registros[2].values);

      }

      }

// se obtiene un total
    total[0].values_cum = total[0].values;
    for (var i = 1; i < total.length; i++){
    	total[i].values_cum = total[i-1].values_cum + total[i].values;
    }
   

    x.domain([d3.min(datos, function(d){ return d.opening_date_new; }) - 1,
              d3.max(datos, function(d){ return d.opening_date_new; })]);

    y.domain([d3.max(total, function(d){ return d.values_cum; }), 0]);

    var area = d3.svg.area()
      .x(function(d) { return x(d.key); })
      .y0(y(0))
      .y1(function(d) { return y(d.values_cum); });

    gArea.datum(total)
        .attr("d", area);

    d3.json("js/sudamerica.json", function(error, geoData) {

          //d3.select("svg")
            svg.append("path")
              //.append("path")
              .attr("class", "land")
              .attr("d", path(geoData));
              
              playAnimation();


      });

 
    sliderBox.append("g")
      .attr("class", "x axis")
      // Se pone en el medio de la pantalla
      .attr("transform", "translate(0," + sliderPosition.height / 2 + ")")
      // inroduce axis
      .call(d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(d) { return d; })
        .tickSize(0)
        .tickPadding(12)
        .tickValues(x.domain()))
    .select(".domain")
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .style("opacity", 0)//Se oculta el slider
    .attr("class", "halo");

    function brushed() {


      var value = brush.extent()[0];

      if (d3.event.sourceEvent) { // not a programmatic event
        handle.select('text');
        value = x.invert(d3.mouse(this)[0]);
        brush.extent([value, value]);
      }

      clipRect.attr("width", x(value));

      var toDate = total.filter(function(d){ return d.key <= value; });
      var latest = toDate[toDate.length - 1];
      if (typeof latest === "undefined"){
        latest = {},
        latest.values_cum = 0;
      }

      handle.select("path")

        .attr("d", "M 0 " + (y(latest.values_cum) - y.range()[1] - 5) + " V 5");

      points = svg.selectAll("circle.point")
          .data(datos.filter(function(d){
            return d.opening_date_new <= value;
          }))


    var colores = d3.scale.linear()
                  .domain([0, 90])
                  .range(["blue", "white"]);




  //Gigantesco If para tomar el paràmetro del candidato elegido
  if (candidato == 'Macri'){


      points.enter().append("circle")
          .attr("class", "point")
          .attr("cx", function(d){ return d.projected_xy[0]; })
          .attr("cy", function(d){ return d.projected_xy[1]; })
          .attr("data-legend",function(d) {return d.imagenPositivaNegativa})
          .style({
          "fill-opacity": 0.6,
          stroke: "#004d60",
          "stroke-width": 1
          })//Estilo de los circulos*/
          .attr("fill", function(d) {


            if ( d.imagenPositivaNegativaMacri == "1") {
                return "blue"


              } else if (d.imagenPositivaNegativaMacri == "2") {
                return "red";


              }
              return "yellow";
            })

      		.attr("r", 0.0) //radio inicial
      	.transition().duration(500)
          .attr("r", 10) //radio intermedio
      	.transition().duration(500)
      		.attr("r", 3.5); //Radio final de cada punto

      points.exit().transition().duration(500)
        .attr("r", 0)
      	.remove();

  }else if (candidato == 'Vidal'){
    
    points.enter().append("circle")
        .attr("class", "point")
        .attr("cx", function(d){ return d.projected_xy[0]; })
        .attr("cy", function(d){ return d.projected_xy[1]; })
        .attr("data-legend",function(d) {return d.imagenPositivaNegativa})
        .style({
        "fill-opacity": 0.6,
        stroke: "#004d60",
        "stroke-width": 1
        })//Estilo de los circulos*/
        .attr("fill", function(d) {
          if ( d.imagenPositivaNegativaVidal == "1") {
              return "blue";

            } else if (d.imagenPositivaNegativaVidal == "2") {
              return "red";

            }
            return "yellow";
          })

        .attr("r", 5.0) //radio inicial
      .transition().duration(500)
        .attr("r", 10) //radio intermedio
      .transition().duration(500)
        .attr("r", 3.5); //Radio final de cada punto

    points.exit().transition().duration(500)
      .attr("r", 0)
      .remove();

  }else if(candidato == 'F. de Kirchner'){
    
    points.enter().append("circle")
        .attr("class", "point")
        .attr("cx", function(d){ return d.projected_xy[0]; })
        .attr("cy", function(d){ return d.projected_xy[1]; })
        .attr("data-legend",function(d) {return d.imagenPositivaNegativa})
        .style({
        "fill-opacity": 0.6,
        stroke: "#004d60",
        "stroke-width": 1
        })//Estilo de los circulos*/
        .attr("fill", function(d) {
          if ( d.imagenPositivaNegativaCristina == "1") {
              return "blue";

            } else if (d.imagenPositivaNegativaCristina == "2") {
              return "red";

            }
            return "yellow";
          })

        .attr("r", 0.0) //radio inicial
      .transition().duration(500)
        .attr("r", 10) //radio intermedio
      .transition().duration(500)
        .attr("r", 3.5); //Radio final de cada punto

    points.exit().transition().duration(500)
      .attr("r", 0)
      .remove();

  }else {
    points.enter().append("circle")
        .attr("class", "point")
        .attr("cx", function(d){ return d.projected_xy[0]; })
        .attr("cy", function(d){ return d.projected_xy[1]; })
        .attr("data-legend",function(d) {return d.imagenPositivaNegativa})
        .style({
        "fill-opacity": 0.6,
        stroke: "#004d60",
        "stroke-width": 1
        })//Estilo de los circulos*/
        .attr("fill", function(d) {
          if ( d.imagenPositivaNegativaMacri == "1") {
              return "blue";

            } else if (d.imagenPositivaNegativaMacri == "2") {
              return "red";

            }
            return "yellow";
          })

        .attr("r", 0.0) //radio inicial
      .transition().duration(500)
        .attr("r", 10) //radio intermedio
      .transition().duration(500)
        .attr("r", 3.5); //Radio final de cada punto

    points.exit().transition().duration(500)
      .attr("r", 0)
      .remove();
  }
  //Cierra el if gigantesco


      handle.attr("transform", "translate(" + x(value) + ",0)");
      handle.select('text.year').text(Math.floor(value));
      handle.select('text.count')
        .attr("transform", "translate(0," + (y(latest.values_cum) - y.range()[1] - 5) + ")")
        .text(latest.values_cum);
      }//Cierra brushed

    //candidato='Vidal';
    brush.on("brush", function(){brushed()});
    button.on("click", playAnimation);


    function playAnimation(){
      //Llama a funcion que contabiliza porcentajes
      contar();

      button.transition()
      	.delay(500)
      	.duration(500)
        .style("opacity", 1)   
        
        
      slider
        .call(brush.extent(['0', '0']))
        .call(brush.event)
        .transition()
        .ease("linear")
        .delay(500)
        .duration(30000)
        .call(brush.extent([6000, 6000]))
        .call(brush.event)
        .transition()
        .call(endAnimation);

      //LLamamos a la funcion para actualizar los piecharts
       valorPosCandidato(positivo);
       valorNegCandidato(negativo);
       valorNoCandidato(nosabe);

    }//Cierra play animation

    function endAnimation(){
      button.transition()
      	.delay(8000)
        .duration(500)
        .style("opacity", 1)
    }

    slider
        .call(brush.extent([6000, 6000]))
    		.call(brush.event)

    //Hacemos global la animacion
      this.Animar = function (){
        playAnimation();        
        $('#cand').text(candidato);
      }

    

  }

  




