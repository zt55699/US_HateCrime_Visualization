function render_linechart (contselect, raw_data, colors) {
  // var us_or_state = d3.select("#selectButton_us").node().value;

  // if(us_or_state == "By State"){
  //   binded_data = data.series
  // } else if(us_or_state == "US Total"){
  //   binded_data = us_data
  // }
  const hate_type = {"All":"total", "Anti-White":"anti_white", "Anti-Black":"anti_black", "Anti-Asian":"anti_asian",
                     "Anti-Jewish": "anti_jewish", "Anti-Islamic":"anti_islamic", "Anti-Arab":"anti_arab", "Anti-Hispanic":"anti_hispanic"}

  var data = raw_data
  var us_data = []  //only 1 element
  
  cal_us_data()

  var us_or_state = d3.select("#selectButton_us").node().value
  if (us_or_state == "By State"){
    data = raw_data
  }else if (us_or_state == "US Total"){
    data = {
      y: "Hate Crimes",
      dates: raw_data.dates,
      series: us_data
    }
  }

  contselect.selectAll('*').remove();
  d3.select("#selectButton").selectAll('myOptions').data([]).exit().remove();
  const mask_latency = 100
  const stroke_width_thin = 0.9
  const stroke_width_thick = 2
  const mask_opacity = 0.5
  const width = 600
  const height = 480  //520
  const margin = ({top: -30, right: 20, bottom: 30, left: 40})
  const us_line_style = {color: "lightgray"}
  var selected = hate_type[d3.select("#selectButton").node().value];

  function hover(svg, path, race_category) {
    us_or_state = d3.select("#selectButton_us").node().value

    if (us_or_state == "By State"){
      var N_data = raw_data
    }else if (us_or_state == "US Total"){
      if (race_category != "total"){
        var N_data = {
          dates: raw_data.dates,
          series: us_data
        }
      }else{
        var N_data = {
          dates: raw_data.dates,
          series: acc_us_data
        }
      }
    }
  //   if (d3.select("#selectButton_us").node().value == "US Total"){ 
  //     console.log("US unbind event!")
  //     if ("ontouchstart" in document) svg
  //     .style("-webkit-tap-highlight-color", "transparent")
  //     .on("touchmove", null)
  //     .on("touchstart", null)
  //     .on("touchend", null)
  //     else svg
  //     .on("mousemove", null)
  //     .on("mouseenter", null)
  //     .on("mouseleave", null);
  //   return
  //  }
    if ("ontouchstart" in document) svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", moved)
        .on("touchstart", entered)
        .on("touchend", left)
    else svg
        .on("mousemove", moved)
        .on("mouseenter", entered)
        .on("mouseleave", left)

  
    const dot = svg.append("g")
        .attr("display", "none");
  
    dot.append("circle")
        .attr("r", 4)
        .attr("fill", "white");
  
    dot.append("text")
        .attr("font-family", "Quicksand")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -20);

    function moved(event) {
      event.preventDefault();
      const pointer = d3.pointer(event, this);
      const xm = x.invert(pointer[0]);
      const ym = y.invert(pointer[1]);
      const i = d3.bisectCenter(N_data.dates, xm);
      var s = null
      if (us_or_state == "US Total"&& race_category == "total"){
        s = N_data.series[0];
      }else{
        s = d3.least(N_data.series, d => Math.abs(d[race_category][i] - ym));
      }
      //console.log(s)
      const distance_threshold = 50

      if (us_or_state == "US Total"){
        if (race_category == "total"){
          var ridg = svg.selectAll(".ridges")
        
          
          path.style("opacity",0)
          ridg.attr("stroke", "none" ).style("opacity", 1)
          //.style("opacity", d => d === s ? 1 : 0.2).filter(d => d === s).raise()
          //.attr("stroke-width",d => d === s ? stroke_width_thick : stroke_width_thin).filter(d => d === s).raise();
          dot.attr("display", null);
          dot.transition().duration(mask_latency).attr("transform", `translate(${x(data.dates[i])},${y(s.value[i].value)})`);

          var tooltip = [s.type, s.value[i].value]
          dot.select("text").text(d3.format(",")(tooltip[1])).attr("font-size", "13pt").attr("fill", "white");
          //dot.select("text").append("tspan").attr("text-anchor", "end").text(tooltip[1]).attr('dx', '-2em').attr('dy', '.9em').attr("fill", "lightgray").attr("font-size", "12pt");

          line_on_select("US", N_data.dates[i])

        }else{
          //path.attr("stroke", function(d){if (us_or_state == "US Total"){return us_line_style.color}else {return colors(d.code)}})
          path.style("opacity", d => d === s ? 1 : (us_or_state == "US Total"? 0 : 0.2)).filter(d => d === s).raise()
          .attr("stroke-width",d => d === s ? stroke_width_thick : stroke_width_thin).filter(d => d === s).raise();
          dot.attr("display", null);
          dot.transition().duration(mask_latency).attr("transform", `translate(${x(N_data.dates[i])},${y(s[race_category][i])})`);

          var tooltip = [s.name, s[race_category][i]]
          dot.select("text").text(d3.format(",")(tooltip[1])).attr("font-size", "13pt").attr("fill", "white");
          //dot.select("text").append("tspan").attr("text-anchor", "end").text(tooltip[1]).attr('dx', '-2em').attr('dy', '.9em').attr("fill", "lightgray").attr("font-size", "12pt");

          line_on_select(s.code, N_data.dates[i])
        }
        var vertical = d3.selectAll(".verticalLine")
          .attr("transform", `translate(${x(N_data.dates[i])},0)`);

        var year_range = d3.extent(data.dates)
        var num_years = year_range[1]-year_range[0]
        var highligt_wdith = width/num_years/2.2
        var maskleft=d3.selectAll(".maskleft")
          .transition().duration(mask_latency)
          .attr('x', margin.left)
          .attr('y', margin.top)
          .attr('width', Math.max(0, x(N_data.dates[i])-margin.left-highligt_wdith))
          .attr('height', height)

        var maskleft=d3.selectAll(".maskright")
          .transition().duration(mask_latency)
          .attr('x', x(N_data.dates[i])+highligt_wdith)
          .attr('y', margin.top)
          .attr('width', Math.max(0, width- margin.right-x(N_data.dates[i])-highligt_wdith))
          .attr('height', height)


      }

      else if(us_or_state == "By State"){

        if(Math.abs(s[race_category][i] - ym) < distance_threshold){
                          //path.attr("stroke", d => d === s ? colors(d.code) : "lightgray").filter(d => d === s).raise();
          //path.attr("stroke", function(d){if (us_or_state == "US Total"){return us_line_style.color}else {return colors(d.code)}})
          path.style("opacity", d => d === s ? 1 : (us_or_state == "US Total"? 0 : 0.2)).filter(d => d === s).raise()
            .attr("stroke-width",d => d === s ? stroke_width_thick : stroke_width_thin).filter(d => d === s).raise();
          dot.attr("display", null);
          dot.attr("transform", `translate(${x(N_data.dates[i])},${y(s[race_category][i])})`);

          var tooltip = [s.name, s[race_category][i]]
          dot.select("text").text(tooltip[0]).attr("font-size", "13pt").attr("fill", color_adjust(colors(s.code),60));
          dot.select("text").append("tspan").attr("text-anchor", "end").text(d3.format(",")(tooltip[1])).attr('dx', '-2em').attr('dy', '.9em').attr("fill", "lightgray").attr("font-size", "12pt");

          line_on_select(s.code, N_data.dates[i])
          
          if (us_or_state == "US Total"){return}
          cg.style("opacity", d => d === s ? 1 : 0.1).filter(d => d === s).raise()  // end dots
          //cg.style("opacity", 0.2);
          
        }

      }

    }
    
    function entered() {
      if (us_or_state == "US Total"){
        d3.select(".verticalG")
          .attr("display", null);
        d3.selectAll(".verticalLine")
          .attr("display", null);
        d3.selectAll(".verticalLine")
          .style("mix-blend-mode", null);
        return}
      else{
        //path.style("mix-blend-mode", null).attr("stroke", d => colors(d.code))
        path.style("opacity", 1)
        .attr("stroke-width", stroke_width_thin);
      //dot.attr("display", null);
      //cg.style("opacity", 0.1);
      }

    }
  
    function left() {
      if (us_or_state == "US Total"){
          dot.attr("display", "none");
          d3.select(".verticalG")
            .attr("display", "none");
          d3.selectAll(".verticalLine")
            .attr("display", "none"); 
            line_off_select()
      }
      else{
        //path.style("mix-blend-mode", null).attr("stroke", d => colors(d.code))   //"multiply"
        path.style("opacity", 1)
          .attr("stroke-width", stroke_width_thin); 
        dot.attr("display", "none");
        cg.style("opacity", 1);
        line_off_select()
      }
      if (race_category == "total"){
        selected_state2.state ="US"
      }

    }

    function click_lock(event){
      if(us_or_state == "By State"){
        event.preventDefault();
        const pointer = d3.pointer(event, this);
        const xm = x.invert(pointer[0]);
        const ym = y.invert(pointer[1]);
        const i = d3.bisectCenter(N_data.dates, xm);
        const s = d3.least(N_data.series, d => Math.abs(d[race_category][i] - ym));
  
        const distance_threshold = 70

        if(Math.abs(s[race_category][i] - ym) < distance_threshold){

          dot.attr("display", "none");
          lock_line.clicked = 1
          lock_line.state = s.code
          
            var unlock_a = d3.selectAll("div").filter(function() {
                                            var id = d3.select(this).attr('id')
                                            if(id){
                                                if(id == "map-container"){return true}
                                            }else{return false}
                                            });
            unlock_a.on("mouseenter", (e, d) => {
                lock_line.state = ""                // unlock
                unlock_a.on("mouseenter","")
            });
        }

      }
    }


  }

  var line = d3.line()
    .defined(d => !isNaN(d))
    .x((d, i) => x(data.dates[i]))
    .y(d => y(d))

  var x = d3.scaleLinear()  //d3.scaleUtc()
    .domain(d3.extent(data.dates))
    .range([margin.left, width - margin.right])

  var y = d3.scaleLinear()
    .domain([0, d3.max(data.series, d => d3.max(d.total))]).nice()
    .range([height - margin.bottom, margin.top])

  var xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
            .tickFormat(d3.format ("")))     
    
    .style("font-weight", "bold")
    .attr("font-family", 'Quicksand')

  var yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y)
      .tickFormat(d3.format (".2s"))) 
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
    )
        // .text(data.y))        
        // .style("font-weight", "bold")
        // .attr("font-family", 'Quicksand')

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible");

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y_axis")
      .call(yAxis)

  //svg.selectAll("line").style("stroke", "lightgray");

      // svg.select(".ylabel").selectAll("text").remove();
      // var ylabel = svg.select(".ylabel").selectAll("text")
      //         .data(["Number of cases"]);
      var ylabel = svg
              .append("text")
              .attr("dy", margin.top)
              .attr("dx", "3em")
              .attr("font-size", "11pt")
              .style("font-weight", "bold")
              .attr("font-family", "Quicksand")
              .attr("fill", "rgb(168, 168, 168)")
              .text("Anual Cases");
      ylabel.exit()
              .remove();

  var path = svg.append("g")
      .attr("fill", "none")
      //.attr("stroke", "orange")
      .attr("stroke-width", 0.8)
      .attr("class", "state_line")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(data.series)
    .join("path")
      //.style("mix-blend-mode", "multiply")
      .attr("d", d => line(d.total))      //line(d.values));
      .attr("stroke", d => colors(d.code));

  var short_data = get_last_data(data)

  svg.selectAll("g.dot").exit().remove()

  var dg = svg.selectAll("g.dot")
          .data(short_data.series)
          .enter().append("g")
          .attr("class", "dot")

  var cg = dg.selectAll("circle")
    .data(short_data.series)
    .enter().append("circle")
    .attr("class", "dotcircle")
    .attr("fill", d => colors(d.code))
    .attr("r", 3)
    .attr("cx", function(d,i) {  return x([d3.max(data.dates)]); })
    .attr("cy", function(d,i) { return y(d[selected]); })


  dg.style("opacity", 0.1);

  svg.call(hover, path, "total");

  contselect.node().append(svg.node())

  if (us_or_state == "US Total"){ update()}
  //return svg.node();

  function cal_us_data(){
      //var year_range = d3.extent(data.dates)
      var us_datat = {code: "US", name: "US_Total", total: [], anti_white: [], anti_black:[], anti_asian:[], anti_jewish:[], anti_islamic:[],anti_hispanic:[]}
      var state_arr = data.series
      var labels = Object.keys(state_arr[0]).slice(2)
      for(let i =0; i< (data.dates).length; i++){
        labels.forEach(function(l){
          var sum_l = 0   
          state_arr.forEach(function(s){
            //ss = {code:"", name:"", total:[], anti_white:[], anti_black[]...}
            sum_l+= s[l][i]
          })
          us_datat[l].push(sum_l)
        })
      }

      us_data = [us_datat]
      //console.log("us_total", us_data)
  }


  function update(){
    // Create new data with the selection?
    
    //var dataFilter = data.map(function(d){return {time: d.time, value:d[selectedGroup]} })
    

    //selected = selectedGroup  //this.
    //num_type = range_type   //this.
    var selected = hate_type[d3.select("#selectButton").node().value];
    var num_type = d3.select("#selectButton_us").node().value;
    
    //console.log(selected , num_type)
    svg.selectAll("verticalG").remove()

    if(num_type == "By State"){
      binded_data = data.series
    } else if(num_type == "US Total"){
      binded_data = us_data
    }

    if(num_type == "US Total"&& selected == "total"){
      y 
      .domain([0, d3.max(binded_data, d => d3.max(d[selected]))-2000]).nice()  //changed TODO
      .range([height - margin.bottom, margin.top])
    }else{
      y 
      .domain([0, d3.max(binded_data, d => d3.max(d[selected]))]).nice()
      .range([height - margin.bottom, margin.top])
    }


    // updata yAxis
    svg.selectAll("g.y_axis")
    .call(yAxis);

    //svg.selectAll("line").style("stroke", "lightgray");

    //console.log(data.series, us_data)
    //console.log(path.node().parentNode)
    //if(num_type == "By State"){
      // path
      //   .data(binded_data)
      //   .join("path")
      //   .attr("fill", "none")
      //   .transition()
      //   .duration(1000)
      //   .attr("d", d => line(d[selected])); //d.total

    // Updata the line
    path
    .data(binded_data)


    if(num_type == "By State"){
      svg.selectAll(".area").transition().duration(1000).style("opacity", 0).remove() //transition().duration(1000).ease(d3.easeLinear)
      svg.selectAll(".ridges").remove()

      var lock = lock_line.state
        
      svg.selectAll("path")
      .enter()
      .append("path")
      .attr("class","statelines")
      .attr("stroke-width", stroke_width_thin)
      
      .merge(path)
      .transition()
      .duration(1000)
      .style("opacity", function(d){
        if(lock){ return d.code == lock ? 1 : 0.2}
        else{return 1}
        })
      .attr("d", d => line(d[selected])); //d.total

      path.exit().remove()



      cg
        .transition()
        .duration(1000)
        .style("opacity", function(d){
          if(lock){ return d.code == lock ? 1 : 0.1}
          else{return 1}
          })
        .attr("cy", function(d,i) { return y(d[selected]); })


    } else if(num_type == "US Total"){
      svg.selectAll(".area").transition().duration(1000).style("opacity", 0).remove() //transition().duration(1000).ease(d3.easeLinear)
      svg.selectAll(".ridges").remove()

          // prepare data for area
          if(selected == "total"){
            path.style("opacity",0)
            var area = d3.area()
              .x(function(d) { return x(d.year); })
              .y0(y(0))
              .y1(function(d) { return y(d.value); });

            var area_data = []
            var rr = d3.extent(data.dates)
            var labels = []
            var sum = 0
            allGroup.forEach(d => {if(d!="All"){labels.push(convers[d])}})
            var tem = labels[0]
            labels[0] = labels[1]
            labels[1] = tem
            tem = labels[2]
            labels[2] = labels[3]
            labels[3] = labels[5]
            labels[5] = labels[4]
            labels[4] = tem
            tem = labels[1]
            labels[1] = labels[2]
            labels[2] = tem
            tem = labels[3]
            labels[3] = labels[4]
            labels[4] = tem
            tem = labels[4]
            labels[4] = labels[5]
            labels[5] = tem
            console.log(labels)
            console.log("binded data!", binded_data)

            var acc = []
            for(let i = 0; i<= rr[1]-rr[0]; i++){
              acc.push(0)
            }
            labels.forEach(function(l){
              var data_per_type ={type:l, value:[]}

              var values = data_per_type.value
              for(let i = 0; i<= rr[1]-rr[0]; i++){
                var recod = {year: parseInt(rr[0])+i, value: (acc[i]+(binded_data[0][l][i]))}
                acc[i] += (binded_data[0][l][i])
                values.push(recod)
              }
              //sum+= d3.sum(values)
              area_data.push(data_per_type)
            })
            
            area_data.reverse()
            console.log("new area data:", area_data)
            acc_us_data = area_data

            d3.selectAll(".area").remove()

            var source = svg.selectAll(".area")
            .data(area_data)
            .enter().append("g")
            .attr("class", function(d) { return `area ${d.year}`; })
   
            source.append("path")
                .attr("class", "river_block")
                .attr("d", function(d) { return area(d.value); })
                .style("opacity", 0)
                .transition()
                .duration(1000)
                .style("fill", function(d) { return pie_color(d.type);})
                .style("opacity", d=>1)
                .attr("stroke", "none")
                .attr("stroke-width","3px")

            source.exit().remove()

            //console.log(source)

            
            binding_event()

            var ridges = svg.selectAll(".line")
              .data(area_data)
              .enter()
              .append("path")
                .attr("class", "ridges")
                .attr("fill", "none")
                .attr("stroke", "darkgray" )
                //.transition().duration(1000)
                .attr("stroke-width", 0)
                .attr("d", function(d){
                  return d3.line()
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(d.value); })
                    (d.value)
                })


          }


          // }
          //console.log(binded_data, raw_data)
          
      else{
            var area_data = []
            var rr = d3.extent(data.dates)
            for(let i = 0; i<= rr[1]-rr[0]; i++){
              var recod = {year: parseInt(rr[0])+i, value: (binded_data[0][selected][i])}
              area_data.push(recod)
            }
            console.log(area_data)
          //}
         selected = hate_type[d3.select("#selectButton").node().value];
         //console.log(selected)

         var are =  svg.append("path")
            .datum(area_data)
            .attr("class","area")
            .attr("fill", function(d) { 
              if(selected == "total"){
                return "#2f4366";         // area color "#243552"
              }else{return pie_color(selected);}})
            .attr("stroke", "darkblue")
            .attr("stroke-width", 0)
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .attr("d", d3.area()
              .x(function(d) { return x(d.year); })
              .y0(y(0))
              .y1(function(d) { return y(d.value) })
              ).style("opacity", 1)
            
          //console.log(are)  
        
      //d3.selectAll("path").selectAll('statelines').data([]).exit().remove();
      svg.selectAll("path")
      .enter()
      .append("path")
      .attr("class","usline")
      .merge(path)
      .transition()
      .duration(1000)
      .attr("stroke-width", stroke_width_thick)
      .attr("d", d => line(d[selected]))
      .style("opacity", function(d) {
        if(d.code != "US"){
          return 0
        }else{
          return 1
        }
        })
      .attr("stroke", function(d) {
                if(d.code != "US"){
                  return colors(d.code)
                }else{
                  return "lightgray"
                }
                }); //d.total
    
      path.exit().remove()
    }
    


    var verticalG = svg.append("g")
      .attr("class", "verticalG");

    // verticalG.append("path") // this is the black vertical line to follow mouse
    //   .attr("class", "verticalLine")
    //   .style("stroke", "white")
    //   .style("stroke-width", "5px")
    //   .style("opacity", "1");
    // verticalG  
    //   .attr("display", "none");

    verticalG.append("line")
      .attr("class","verticalLine")
      .attr("x1", 0)
      .attr("y1", margin.top)
      .attr("x2", 0)
      .attr("y2", height+margin.top)
      .style("stroke-width", 0)
      .style("stroke", "none")
      .style("opacity", 0.2)
      .style("fill", "none")
      .style("pointer-events","none");

    verticalG.append('rect')
      .attr("class", "maskleft")
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', 200)
      .attr('height', height)
      .attr('stroke', 'none')
      .style("opacity", mask_opacity)
      .attr('fill', "rgb(38, 35, 45)")
      .style("pointer-events","none");;

    verticalG.append('rect')
      .attr("class", "maskright")
      .attr('x', width- margin.right-200)
      .attr('y', margin.top)
      .attr('width', 200)
      .attr('height', height)
      .attr('stroke', 'none')
      .style("opacity", mask_opacity)
      .attr('fill', "rgb(38, 35, 45)")
      .style("pointer-events","none");;



    verticalG.attr("display", "none")
    d3.selectAll(".verticalG").raise()
      
  }


      cg
        .style("opacity", 0)
        .attr("cy", function(d,i) { return y(d[selected]); }) 




      
      if(lock_line.state){
        var temp = lock_line.state
        path.style("opacity",d => d.code == temp ? 1 : 0.2).filter(d =>d.code == temp).raise()
        //console.log(temp)
        //selected_state.state = temp
        lockLine(temp, selected)
      }
      else{
        svg.call(hover, path, selected);
      }
    //}else if(num_type == "US Total"){
      // path
      //   .data(binded_data)
      //   .join("path")
      //   .attr("fill", "blue")
      //   .transition()
      //   .duration(1000)
      //   .attr("d", d => line(d[selected])); //d.total

      // cg
      //   .transition()
      //   .duration(1000)
      //   .attr("cy", function(d,i) { return y(d[selected]); })

      //svg.call(hover, path, selected);
    //}



   
    // // Give these new data to update line
    // line
    //     .datum(dataFilter)
    //     .transition()
    //     .duration(1000)
    //     .attr("d", d3.line()
    //       .x(function(d) { return x(+d.time) })
    //       .y(function(d) { return y(+d.value) })
    //     )
    //     .attr("stroke", function(d){ return myColor(selectedGroup) })
  }

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      
      var raw_selectedOption = d3.select(this).property("value")

      var hate_type = {"All":"total", "Anti-White":"anti_white", "Anti-Black":"anti_black", "Anti-Asian":"anti_asian",
      "Anti-Jewish": "anti_jewish", "Anti-Islamic":"anti_islamic", "Anti-Arab":"anti_arab", "Anti-Hispanic":"anti_hispanic"}
      selectedOption = hate_type[raw_selectedOption]
      // run the updateChart function with this selected option
      update(selectedOption)
      grid_map.update_race(selectedOption)
  })
    // When the button is changed, run the updateChart function
  d3.select("#selectButton_us").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      if(selectedOption == "US Total"){
        selected_state2.state = "US"
        lock_line.state = ""
        if(cells){
          cells.transition().duration(100)
          .attr("opacity", 1);                    
          //.selectAll(".ctext").attr("opacity", 1);                
          no_state_on_select()                                // out put information
        }
      }
      update(selected)
  })

  const dot = svg.append("g")
  .attr("display", "none");

  dot.append("circle")
      .attr("r", 5)
      .attr("fill", "white");

  dot.append("text")
      .attr("font-family", "Quicksand")
      .attr("font-size", 20)
      .attr("text-anchor", "end")
      .attr("y", -10);


  // when a state is selected on the map, its line graph will be highlighted
  Object.defineProperty(selected_state,'state', {
    configurable:true,
    set:function(newVal){
    this._state=newVal 
        //console.log('set:'+this._state)
        if (d3.select("#selectButton_us").node().value == "US Total"){ 
          return;
        }
        selected = hate_type[d3.select("#selectButton").node().value];

        if(newVal.length > 0){
          // highlight(newVal)
          //const xm = x.invert(pointer[0]);
          //const ym = y.invert(pointer[1]);
          const i = data.dates.length-1

          const s = data.series.filter(d => d.code == newVal)[0] ;
          //path.attr("stroke", d => colors(d.code))
          path.transition().duration(500).style("opacity", d => d === s ? 1 : 0.2)
          path.filter(d => d === s).raise()
            .attr("stroke-width",d => d === s ? stroke_width_thick : stroke_width_thin).filter(d => d === s).raise();
          
          dot.attr("display", null);
          dot.attr("transform", `translate(${x(data.dates[i])},${y(s[selected][i])})`);
          dot.select("circle").attr("fill", colors(s.code));
          dot.select("text").text(s.name).attr("font-size", "15pt").attr("fill", color_adjust(colors(s.code),50));
          cg.style("opacity", 0.1);
          
        }else{
          //exit_highlight()
          //path.style("mix-blend-mode", null).attr("stroke", d => colors(d.code))   //"multiply"
          path.transition().duration(500).style("opacity", 1)
          .attr("stroke-width", stroke_width_thin); 
          dot.attr("display", "none");
          cg.style("opacity", 1);
        }
    },
    get:function(){
        //console.log('get:'+this._state)
        return this._state
    }
  })  

  function lockLine(newVal, selected){
    console.log('lock:'+newVal)
    locked_line = newVal
    const i = data.dates.length-1

    const s = data.series.filter(d => d.code == newVal)[0] ;


    //path.attr("stroke", d => colors(d.code))
    path.style("opacity", d => d === s ? 1 : 0.2).filter(d => d === s).raise()
      .attr("stroke-width",d => d === s ? stroke_width_thick : stroke_width_thin).filter(d => d === s).raise();
    
    dot.attr("display", null);

    if(lock_line.clicked){
      dot.attr("transform", `translate(${x(data.dates[i])},${y(s[selected][i])})`);
      lock_line.clicked = ""
    }else{
      dot.transition().duration(1000).attr("transform", `translate(${x(data.dates[i])},${y(s[selected][i])})`);
    }
    dot.select("circle").attr("fill", colors(s.code));
    dot.select("text").text(s.name).attr("font-size", "15pt").attr("fill", color_adjust(colors(s.code),50));
    cg.style("opacity", 0.1);

    if ("ontouchstart" in document) svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", point_move)
        .on("touchstart", "")
        .on("touchend", "")
    else svg
        .on("mousemove", point_move)
        .on("mouseenter", enter_lock)
        .on("mouseleave", "");


    function point_move(event) {
      event.preventDefault();
      const pointer = d3.pointer(event, this);
      const xm = x.invert(pointer[0]);
      const ym = y.invert(pointer[1]);
      const i = d3.bisectCenter(data.dates, xm);
      const s = (data.series).filter(d => d.code == newVal)[0]


      if(ym>0 && ym <height*5){
      path.style("opacity",d => d === s ? 1 : 0.2).filter(d => d === s).raise()

        //path.attr("stroke", d => d === s ? colors(d.code) : "lightgray").filter(d => d === s).raise();
        //path.attr("stroke", function(d){d => colors(d.code)})
        //.style("opacity", d => d === s ? 1 : 0.2).filter(d => d === s).raise()
        //.attr("stroke-width",d => d === s ? stroke_width_thick : stroke_width_thin).filter(d => d === s).raise();
        dot.attr("display", null);
        dot.attr("transform", `translate(${x(data.dates[i])},${y(s[selected][i])})`);

        var tooltip = [s.name, s[selected][i]]
        dot.select("text").text(tooltip[0]).attr("font-size", "13pt").attr("fill", color_adjust(colors(s.code),60)).attr('dy', '-1em').raise();
        dot.select("text").append("tspan").attr("text-anchor", "end").text(d3.format(",")(tooltip[1])).attr('dx', '-2em').attr('dy', '.9em').attr("fill", "lightgray").attr("font-size", "12pt").raise();

        line_on_select(s.code, data.dates[i])

        cg.style("opacity", d => d === s ? 1 : 0.1).filter(d => d === s).raise()  // end dots
        //cg.style("opacity", 0.2);      
      }
      

    }
    function enter_lock(event) {
      //path.attr("stroke", function(d){d => "yellow"})
    }

  }

  // lock line by map picker
  Object.defineProperty(lock_line,'state', {
    configurable:true,
    set:function(newVal){
    this._state=newVal 
        if (d3.select("#selectButton_us").node().value == "US Total"){ 
          return;
        }
        selected = hate_type[d3.select("#selectButton").node().value];

        if(newVal.length > 0){
          lockLine(newVal, selected)
          
        }else{
          //exit_highlight()
          //locked_line = ""
          console.log("unlock line!")
          hover(svg, path, selected) 
          //path.style("mix-blend-mode", null).attr("stroke", d => colors(d.code))   //"multiply"
          path.style("opacity", 1)
          .attr("stroke-width", stroke_width_thin); 
          dot.attr("display", "none");
          cg.style("opacity", 1);
        }
    },
    get:function(){
        //console.log('get:'+this._state)
        return this._state
    }
  })  

  function binding_event(){

    var blocks = svg.selectAll("path.river_block")
    .on('mouseover', function (event, d, i) {
        //var[x, y] = d3.pointer(event);
        //console.log(d, blocks)
        blocks.transition().duration(300)
            .style("opacity", a => a === d ? 1.2 : 0.8)
            .style("fill", a=> a ===d ? color_adjust(pie_color(a.type), 20) :color_adjust(pie_color(a.type), -40))

        const pointer = d3.pointer(event, this);
        const xm = x.invert(pointer[0]);
        const ii = d3.bisectCenter(raw_data.dates, xm);
        const ym = y.invert(pointer[1]);

        if(JSON.stringify(river_selected.pair) != JSON.stringify([d.type,raw_data.dates[ii]])){
          river_selected.pair= [d.type,raw_data.dates[ii]]
          //console.log(d.type,raw_data.dates[ii])
        }
      

        // blocks.selectAll("area").transition().duration(100)
        //     .attr("opacity", a => a === d ? 1.2 : 0.1)
        //     .attr("stroke", a => a === d ? "lightgray" : "none")
        //     .attr("stroke-width",3);


        // d3.select(this).transition()
        //     .duration('50')
        //     .attr('opacity', '.85')
        
        // //Makes the new div appear on hover:
        // div.transition()
        //     .duration(50)
        //     .style("opacity", 0.7);
        // let num = (Math.round((d.value / sum) * 100)).toString() + '%';
        // const x = event.pageX 
        // const y = event.pageY
        // //console.log(x,y)
        // div.html(num)
        //     .style("left", x + "px")
        //     .style("top", y-12 + "px");
      })
    .on("click", function (event, d, i) {
      //document.getElementById("selectButton").value(convers2[d.type])
      if( d.type != convers[d3.select("#selectButton").property("value")]){
        document.getElementById("selectButton").selectedIndex = slecI[d.type];
        // d3.select("#selectButton")
        //       .
  
        console.log(d.type, d3.select("#selectButton").property("value"))
        d3.selectAll(".cricle").remove()
        selectedOption = d.type
        // run the updateChart function with this selected option
        update(selectedOption)
        grid_map.update_race(selectedOption)
        
        
      }


    })

            
    .on('mouseleave', function (d, i) {
        blocks.transition()
            .duration('100')
            .style('opacity', '1')
            .style("fill",d=>pie_color(d.type))
        river_selected.pair = ""
            //.attr("stroke", "none");
                  //Makes the new div disappear:
        // div.transition()
        //     .duration('50')
        //     .style("opacity", 0);
      })
            






  }


  return [svg, path]
}



