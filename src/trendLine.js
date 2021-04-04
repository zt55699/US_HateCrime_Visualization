// import * as d3_core from "d3";
// import * as d3_geo_proj from "d3-geo-projection";

// const d3 = { ...d3_core, ...d3_geo_proj };

function createTrendLine(ref, data) {
    const width = ref.current.clientWidth;
    const height = 40;

    data.new_sma7_2weeks = data.daily.slice(-14).map(e => e.confirmed['7dayAverage']);

    const el = ref.current.querySelector('svg');

    if (el !== null) {
        el.remove();
    }

    const svg = d3.select(ref.current).append("svg");

    svg.attr("width", width.toString())
        .attr("height", height.toString());

    const trend = svg.append("g")
        .classed("trend", true)
        .attr('transform', 'translate(4, 4)');

    var xScale = d3.scaleLinear().domain([0, 13]).range([0, width - 8]);
    var yScale = d3.scaleLinear().domain(d3.extent(data.new_sma7_2weeks)).range([height - 8, 0]);

    const lineGenerator = d3.line()
        .curve(d3.curveCardinal)
        .x((d, i) => xScale(i))
        .y(d => yScale(d));

    const pathData = lineGenerator(data.new_sma7_2weeks);

    trend.selectAll('path')
        .data([data.new_sma7_2weeks])
        .enter()
        .append("path")
        .attr('d', pathData)
        .attr('stroke', '#e85930')
        .attr('fill', 'none');

    trend.selectAll('days')
        .data(data.new_sma7_2weeks)
        .enter()
        .append("circle")
        .classed("day", true)
        .attr("cx", (d, i) => xScale(i))
        .attr("cy", d => yScale(d))
        .attr("r", 2)
        .style("fill", '#e85930');

    trend.append("rect")
        .classed("start", true)
        .attr("x", xScale(0) - 3)
        .attr("y", yScale(data.new_sma7_2weeks[0]) - 3)
        .attr("width", 7)
        .attr("height", 7)
        .style("fill", '#3882ab');

    trend.append("circle")
        .classed("end", true)
        .attr("cx", xScale(13))
        .attr("cy", yScale(data.new_sma7_2weeks[data.new_sma7_2weeks.length - 1]))
        .attr("r", 4)
        .style("fill", '#3882ab');
}

// export { createTrendLine };