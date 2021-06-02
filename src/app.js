
function app(){
            // This visualization is focused on annual statistics in reported hate crimes by an offender’s bias against the victim’s perceived race.

    start();
}

function render_map_svg(svgselection, map_data){ 
    svgselection.selectAll('*').remove();
    const g = svgselection.append("g").attr("transform", "translate(25,0)");

    var raceo = d3.select("#selectButton").node().value
    var title = raceo == "All" ? "Total Cases" : ("Total Cases (" + raceo+")")


    const gmap = new GridMap(g)
        .size([800, 600])
        .style({sizeByValue: false, legendTitle: title})
        .field({ code: "code", name: "name", total: "value" })                
        .mapGrid(map)
        .data(map_data)    
        .render();
    //return svg.node()
    grid_map = gmap
}

function done_loading(){
    var el = document.getElementById('loader');
    el.remove();
    el = document.getElementById('load_text');
    el.remove();
    el = document.getElementById('load_mask');
    el.remove();
}

async function start(){
    all_data =  new Dataset("./src/cleaned_data.csv")
    var start = Date.now();
 
    await all_data.init()
    var delta = Date.now() -start;
    console.log("all_data.init: ", delta, " ms");
    done_loading()

    // Promise.all(()=>{

    // }).then().catch();

    main();
};

function main (){
    //console.log(all_data)
    all_data.setYear(start_year, end_year);
    var states_years = all_data.get_states_years();
    //console.log(states_years)



    var line_data = convert_line_data(states_years)
    //console.log(typeof(test_data), test_data)
    //console.log("linedata::", line_data)


    var button_op = ["By State","US Total"] 

    // add the options to the button
    d3.select("#selectButton_us")
    .selectAll('myOptions')
    .data(button_op)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // List of groups (here I have one group per column)


    // add the options to the button
    d3.select("#selectButton")
    .selectAll('myOptions')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button


    var map_data = convert_map_data(states_years)
    //console.log(map_data)
    //var states_total = all_data.get_total_by_states(); 
    var mapselect = d3.select("#map-container").append("svg")
            .attr("class", "us-map")
            .attr("font-size", "8pt")
            .attr("viewBox", "0 0 800 620"); 
    render_map_svg(mapselect, map_data)


    // color scale for multi-line chart 
    var states = []
    var data_arr = line_data.series
    data_arr.forEach(element => states.push(element.code))
    colors = d3.scaleOrdinal()
                .domain(states)
                .range(d3.schemeCategory10)      //d3.schemeTableau10 

    var trendselect = d3.select("#trend-container")
    linechart = render_linechart(trendselect, line_data, colors)    //[svg, path]
    //console.log(linechart)

    // donut chart
    render_pie(line_data)

    var mySlider = new rSlider({
        target: '#yearSlider',
        values: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019],
        range: true,
        tooltip: true,
        scale: true,
        labels: true,
        set: [start_year, end_year],
        onChange: function (values) { var val = values.split(",")
                                    var st_y = val[0]
                                    var ed_y = val[1]
                                    if(st_y!=start_year || ed_y!=end_year){
                                        update_year(mapselect, trendselect, val[0], val[1], colors)}}
});


}


function update_year(svgselection, trendselect, st_year, ed_year, colors){
        start_year = st_year
        end_year = ed_year
        all_data.setYear(start_year, end_year)
        var states_years = all_data.get_states_years()

        var map_data = convert_map_data(states_years)

        var line_data = convert_line_data(states_years)
        //var states_total = all_data.get_total_by_states()
        render_map_svg(svgselection, map_data)       

        linechart = render_linechart(trendselect, line_data, colors)

        render_pie(line_data)
        //var selection = d3.select(".us-map")
        //selection.node().append(map_svg())
        //console.log(selection)
}


// listening on change objects
var selected_state = {state: ""}
var selected_state2 = {state: ""}

var line_selected = {
    pair: [0,1]
}

var lock_line = {state: "", clicked: ""}
var river_selected = {pair:[]}

function state_on_select(state){
    //d3.select("#selectState").text(state)
    selected_state.state = state
    selected_state2.state = state
}
function no_state_on_select(){
    //d3.select("#selectState").text("")
    selected_state.state = ""
    selected_state2.state = ""
}

function line_on_select(state1, year1){
    var fire_map = false
    //line_selected.pair = [0,0]
    if(JSON.stringify(line_selected.pair) != JSON.stringify([state1, year1])){
        if(!line_selected.pair){
            fire_map = true
        }
        else{
            if(line_selected.pair[0]!=state1){
                fire_map = true
            }
        }
        line_selected.pair = [state1, year1]
        //console.log("line: ",state1,year1 )
    }
    if(fire_map){
        grid_map.highlight_a_cell(state1)
    }
}

function line_off_select(){
    grid_map.cancel_hightlight()
    line_selected.pair = ""
}

function cell_click(cells1,state1){
    cells = cells1
    //console.log("lock state!")
    cells.on("mouseleave", "")
        .on("mouseenter", "")

    //lock line chart
    lock_line.state = state1



    var unlock_area = d3.selectAll("div").filter(function() {
                                    var id = d3.select(this).attr('id')
                                    if(id){
                                        if(id != "map-container" && id != "slider_container"){return true}
                                    }else{return false}
                    });
    unlock_area.on("mouseenter", (e, d) => {
        //console.log("unlock state!")
        grid_map._attachEvents(cells)
        unlock_area.on("mouseenter","")
    });

    var unlock_line_area = d3.selectAll("div").filter(function() {
                                    var id = d3.select(this).attr('id')
                                    if(id){
                                        if(id == "map-container"){return true}
                                    }else{return false}
                                    });
    unlock_line_area.on("mouseenter", (e, d) => {
        lock_line.state = ""                // unlock
        unlock_line_area.on("mouseenter","")
    });
}

function color_adjust(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}