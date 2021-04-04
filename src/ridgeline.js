class RidgeLine{
    constructor(container) {
        this._container = container;
        this._data = null;
        this._g = null;
        this._svg = null;

        this._margin = { top: 30, right: 10, bottom: 30, left: 300 };
        this._width = 700 - this._margin.left - this._margin.right;
        this._height = 600 - this._margin.top - this._margin.bottom;
        this._overlap = 0.6;
        this._style = {
            transition: false,
            sizeByValue: false,
            font: "Quicksand",
            defaultCellColor: "#999",
            defaultTextColor: "black",
            legendTitle: "",

        };
        this._cellPalette = d3.interpolateYlOrRd;
        this._textPalette = d3.interpolateCubehelixDefault;
        this._overlayPalette = d3.schemeTableau10;


    }
    
    data(dt) {
        this._data = dt
    }

    render() {
        this._init();

        this._g = this._container.append("g");
   
        return this;
    }

    _init() {        
        var formatTime = d3.timeFormat('%I %p');

        this._svg = d3.select(this._container).append('svg')
            .attr('width', this._width + this._margin.left + this._margin.right )
            .attr('height', this._height + this._margin.top + this._margin.bottom )
        .append('g')
            .attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')');

        var x = function(d) { return d.time; },
            xScale = d3.scaleTime().range([0, this._width]),
            xValue = function(d) { return xScale(x(d)); },
            xAxis = d3.axisBottom(xScale).tickFormat(formatTime);
        
        var y = function(d) { return d.value; },
            yScale = d3.scaleLinear(),
            yValue = function(d) { return yScale(y(d)); };
        
        var activity = function(d) { return d.key; },
            activityScale = d3.scaleBand().range([0, this._height]),
            activityValue = function(d) { return activityScale(activity(d)); },
            activityAxis = d3.axisLeft(activityScale);
        
        var area = d3.area()
            .x(xValue)
            .y1(yValue);
        
        var line = area.lineY1();
        


        this._data.sort(function(a, b) { return peakTime(b) - peakTime(a); });

        xScale.domain(d3.extent(dataFlat, x));

        activityScale.domain(data.map(function(d) { return d.key; }));

        var areaChartHeight = (1 + overlap) * (height / activityScale.domain().length);

        yScale
            .domain(d3.extent(dataFlat, y))
            .range([areaChartHeight, 0]);
        
        area.y0(yScale(0));

        svg.append('g').attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g').attr('class', 'axis axis--activity')
            .call(activityAxis);

        var gActivity = svg.append('g').attr('class', 'activities')
                .selectAll('.activity').data(data)
            .enter().append('g')
                .attr('class', function(d) { return 'activity activity--' + d.key; })
                .attr('transform', function(d) {
                    var ty = activityValue(d) - activityScale.bandwidth() + 5;
                    return 'translate(0,' + ty + ')';
                });

        gActivity.append('path').attr('class', 'area')
            .datum(function(d) { return d.values; })
            .attr('d', area);
        
        gActivity.append('path').attr('class', 'line')
            .datum(function(d) { return d.values; })
            .attr('d', line);


   
        
    }

    // Sort activities by peak activity time
    peakTime(d) {
        var i = d3.scan(d.values, function(a, b) { return y(b) - y(a); });
        return d.values[i].time;
    };

    row(d) {
        return {
            activity: d.activity,
            time: parseTime(d.time),
            value: +d.p_smooth
        };
    }




}