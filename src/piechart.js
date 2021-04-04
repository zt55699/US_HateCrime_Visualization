function render_pie(rdata){
    d3.select('#pie-container').selectAll('*').remove();
    d3.selectAll("arc").remove();


    var selection = ["US"]
    var sum = 0
    var svg = d3.select("#pie-container")
    .append("svg")
    .attr("viewBox", `0 0 576 300`)
    .append("g")

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");
    svg.append("g")
        .attr("class", "state");
    svg.append("g")
        .attr("class", "title");

    var width = 672,
        height = 350,
        radius = Math.min(width, height) / 2;


    svg.select(".title").selectAll("text").remove();
    var textT = svg.select(".title").selectAll("text")
            .data(["Race of Victims"]);
    textT.enter()
            .append("text")
            .attr("dy", "-8.5em")
            .attr("dx", "-13.5em")
            .attr("font-size", "17pt")
            .style("font-weight", "bold")
            .attr("fill", "rgb(168, 168, 168)")
            .text(function(d) {
                return d;
            });
    textT.exit()
            .remove();        

    var pie = d3.pie()
        .startAngle(-0.9)
        .endAngle(Math.PI*2-0.9)
        .sort(function(a,b){return b.value-a.value})
        .value(function(d) {
            return d.value;
        });

    var arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + (width / 2 -9)+ "," + (height / 2 -30)+ ")");

    var key = function(d){ return d.data.label; };

    function prepareData (raw_data, selec, year){

        var labels = Object.keys(raw_data.series[0]).slice(3)
        var values = []
        this.selection = [selec]
        var stat_arr = raw_data.series
        //console.log(raw_data)
        //console.log(stat_arr)
        //console.log(labels)
        if(!year){
            this.year = ""
            if(selec == "US"){
                labels.forEach(function(l){
                    var per_state = []
                    stat_arr.forEach(function(s){ per_state.push(d3.sum(s[l]))})
                    var total_l = d3.sum(per_state);
                    values.push(total_l)
                } )
            } else {
                var the_state = stat_arr.filter(s => s.code==selec)[0]
                labels.forEach(function(l){
                    var state_l = d3.sum(the_state[l]);
                    values.push(state_l)
                })
            }
        } else {
            this.year = year
            if(selec == "US"){
                labels.forEach(function(l){
                    var per_state = []
                    stat_arr.forEach(function(s){ per_state.push(s[l][parseInt(year)- parseInt(raw_data.dates[0])])})
                    var total_l = d3.sum(per_state);
                    values.push(total_l)
                } )
            } else{
                var the_state = stat_arr.filter(s => s.code==selec)[0]
                labels.forEach(function(l){
                    var state_l = the_state[l][parseInt(year)- parseInt(raw_data.dates[0])];
                    values.push(state_l)
                })
            }
        }
        //console.log(labels, values)
        sum = d3.sum(values)
        var new_da = labels.map(function(label, i){
            return { label: label, 
                value:  values[i],
                }
        });
        return new_da
    }

    const arcTweenEnter = (d) => {
        var i = d3.interpolate(d.endAngle, d.startAngle);

        return t => {
            d.startAngle = i(t);
            return arc(d);
        };
    }

    const arcTweenUpdate = (d, i, n) => {
        var interpolate = d3.interpolate(n[i]._current, d);
        n[i]._current = d;
        return t => {
            return arc(interpolate(t));
        };
    }

    var newData = prepareData (rdata, selection[0])
    //console.log("Pie initial data:", newData)
    //console.log(randomData())
    change(newData);

    // tooltip
    var div = d3.select("#pie-container").append("div")
     .attr("class", "tooltip-donut")
     .style("opacity", 0)
     .style("position", "absolute");

    //hovering(svg)
    var arcs = svg.selectAll("path")
                .on('mouseover', function (event, d, i) {
                    //var[x, y] = d3.pointer(event);
                    //console.log(d.data)

                    arcs.transition().duration(100)
                        .attr("opacity", a => a === d ? 1.2 : 0.5)
                        .attr("stroke", a => a === d ? "lightgray" : "none")
                        .attr("stroke-width",3);


                    // d3.select(this).transition()
                    //     .duration('50')
                    //     .attr('opacity', '.85')
                    
                    //Makes the new div appear on hover:
                    div.transition()
                        .duration(50)
                        .style("opacity", 0.7);
                    let num = (Math.round((d.value / sum) * 100)).toString() + '%';
                    const x = event.pageX 
                    const y = event.pageY
                    //console.log(x,y)
                    div.html(num)
                        .style("left", x + "px")
                        .style("top", y-12 + "px");})
                    

                        
                .on('mouseout', function (d, i) {
                    arcs.transition()
                        .duration('50')
                        .attr('opacity', '1')
                        .attr("stroke", "none");
                              //Makes the new div disappear:
                    div.transition()
                        .duration('50')
                        .style("opacity", 0);})
                        
  

    


    // function hovering (svg){
    //     var arcs = svg.selectAll("arc")
    //     if ("ontouchstart" in document) arcs
    //         .style("-webkit-tap-highlight-color", "transparent")
    //         .on("touchmove", moved)
    //         .on("touchstart", entered)
    //         .on("touchend", left)
    //     else svg
    //         .on("mousemove", moved)
    //         .on("mouseenter", entered)
    //         .on("mouseleave", left);


    // }



    function change(data) {
        
        var selected = convers[d3.select("#selectButton").node().value];
        var domain = d3.select("#selectButton_us").node().value
        if (domain == "US Total"&& selected == "total"){
            var ridge = river_selected.pair
            if(!ridge){
                selected = "total"
            }else{
                selected = ridge[0]
            }
        }
        //console.log("pie selec", selected)
        /* ------- PIE SLICES -------*/
        // var slice = svg.select(".slices").selectAll("path.slice")
        // 	.data(pie(data), key);

        // slice.enter()
        // 	.insert("path")
        // 	.style("fill", function(d) { return color(d.data.label); })
        // 	.attr("class", "slice");

        // slice		
        // 	.transition().duration(1000)
        // 	.attrTween("d", function(d) {
        // 		this._current = this._current || d;
        // 		var interpolate = d3.interpolate(this._current, d);
        // 		this._current = interpolate(0);
        // 		return function(t) {
        // 			return arc(interpolate(t));
        // 		};
        // 	})

        // slice.exit()
        // 	.remove();

        var slice = svg.selectAll("path").data(pie(data), key);

    slice.join(
        enter => {
        enter
            .append("g")
            .append("path")
            .attr("class", "arc")
            .attr("fill", function(d) { return pie_color(d.data.label); })
            //.attr("stroke", "#2D3546")
            //.style("stroke-width", "2px")
            .each(function(d) {
            this._current = d;
            })
            .transition()
            .duration(1000)
            .attrTween("d", arcTweenEnter);
        },

        update => {
        update
            .transition()
            .duration(1000)
            .attrTween("d", arcTweenUpdate);
        },

        exit => {
        exit.remove();
        }
    );

        /* ------- TEXT LABELS -------*/
        svg.selectAll("tspan").remove()

        var text = svg.select(".labels").selectAll("text")
            .data(pie(data), key);

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .attr("font-size", "18pt")
            .attr("fill", "lightgray")
            .text(function(d) {
                var hate_type = {"anti_white":"White", "anti_black":"Black", "anti_asian":"Asian",
                     "anti_jewish":"Jewish", "anti_islamic":"Islamic", "anti_arab":"Arab", "anti_hispanic":"Hispanic"}
                return hate_type[d.data.label];
            });

        
        // Add largest percentage
        if(selected != "total"){
            var the_piece = svg.selectAll("path")
                .filter(function(d){
                    return d.data.label == selected;})
            //console.log(the_piece.data(), sum)
            var percent = [(Math.round((the_piece.data()[0].value / sum) * 100)).toString() + '%'];
            // add percentage
            text.append("tspan").attr("text-anchor", "center").text(d => d.data.label == selected ? percent : "").attr('x', '-0.1em').attr('dy', '0.9em').attr("fill", d=>color_adjust(pie_color(d.data.label), 50)).attr("font-size", "25pt").exit().remove();
        }
        

        function midAngle(d){
            return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        text.transition().duration(1000)
            .attrTween("transform", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-anchor", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            });

        text.exit()
            .remove();

        /* ------- STATE CODE -------*/
        //console.log(this.selection)
        svg.select(".state").selectAll("text").remove();
        var textS = svg.select(".state").selectAll("text")
            .data(this.selection);

        textS.enter()
            .append("text")
            .attr("dy", ".35em")
            .attr("dx", "-.6em")
            .attr("font-size", "30pt")
            .style("font-weight", "bold")
            .attr("fill", "lightgray")
            .text(function(d) {
                return d;
            });

        svg.select(".state").select("text").append("tspan").attr("text-anchor", "center").text(this.year).attr('x', '-1em').attr('dy', '5em').attr("fill", "lightgray").attr("font-size", "25pt");

        textS.exit()
            .remove();


        /* ------- SLICE TO TEXT POLYLINES -------*/

        var polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(data), key);
        
        polyline.enter()
            .append("polyline")

        polyline.transition().duration(1000)
            .attrTween("points", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };			
            });
        
        polyline.exit()
            .remove();

        /* --------- Highlight ---------*/

 

        
        if(selected != "total"){
                var arcs = svg.selectAll(".arc")
                //.transition().duration(300)   //buggy
                    .attr("opacity", d => d.data.label == selected ? 1.0 : 0.6)
                    .attr("stroke", d => d.data.label == selected ? "lightgray" : "none")
                    .attr("stroke-width",3);



    
            // var numb = (Math.round((d.value / sum) * 100)).toString() + '%';
            // svg.selectAll("path")

            // let num = (Math.round((d.value / sum) * 100)).toString() + '%';
        }        
        else{
            var arcs = svg.selectAll(".arc")
            //.transition().duration(300)       buggy
                .attr("opacity", 1)
                .attr("stroke", "none");
        }
    };



    Object.defineProperty(selected_state2,'state', {
        configurable:true,
        set:function(newVal){
        this._state=newVal 
            //console.log('set:'+this._state)
            if(newVal.length > 0){

              //console.log(newVal)
              // highlight(newVal)
              var data_update = prepareData (rdata, newVal, "")
              //console.log("New Pie Data: ",data_update)
              change(data_update)
              //change(randomData())
            }else{
              //exit_highlight()

            }
        },
        get:function(){
            console.log('get:'+this._state)
            return this._state
        }
      })  


    Object.defineProperty(line_selected,'pair', {
        configurable:true,
        set:function(newVal){
        this._pair=newVal 
            if(!newVal){return}


            var data_update = prepareData (rdata, newVal[0], newVal[1])
            //console.log("New Pie Data: ",data_update)
            change(data_update)


            // if(newVal.length > 0){
            //   // highlight(newVal)
            //   var data_update = prepareData (rdata, newVal)
            //   console.log("New Pie Data: ",data_update)
            //   change(data_update)
            //   //change(randomData())
            // }else{
            //   //exit_highlight()

            // }
        },
        get:function(){
            //console.log('get:'+this._pair)
            return this._pair
        }
      })  


      Object.defineProperty(river_selected,'pair', {
        configurable:true,
        set:function(newVal){
        this._pair=newVal 
            if(!newVal){return}


            var data_update = prepareData (rdata, "US", newVal[1])
            //console.log("New Pie Data: ",data_update)
            change(data_update)


            // if(newVal.length > 0){
            //   // highlight(newVal)
            //   var data_update = prepareData (rdata, newVal)
            //   console.log("New Pie Data: ",data_update)
            //   change(data_update)
            //   //change(randomData())
            // }else{
            //   //exit_highlight()

            // }
        },
        get:function(){
            //console.log('get:'+this._pair)
            return this._pair
        }
      })  




}