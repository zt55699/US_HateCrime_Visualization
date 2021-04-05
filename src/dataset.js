const map = [[0, 0, ""], [1, 0, ""], [2, 0, ""], [3, 0, ""], [4, 0, ""], [5, 0, ""], [6, 0, ""], [7, 0, ""], 
                     [8, 0, ""], [9, 0, ""], [10, 0, ""], [11, 0, "ME"], [0, 1, "AK"], [1, 1, ""], [2, 1, ""], [3, 1, ""], 
                     [4, 1, ""], [5, 1, ""], [6, 1, "WI"], [7, 1, ""], [8, 1, ""], [9, 1, ""], [10, 1, "VT"], [11, 1, "NH"], 
                     [0, 2, ""], [1, 2, "WA"], [2, 2, "ID"], [3, 2, "MT"], [4, 2, "ND"], [5, 2, "MN"], [6, 2, "IL"], [7, 2, "MI"], 
                     [8, 2, ""], [9, 2, "NY"], [10, 2, "MA"], [11, 2, ""], [0, 3, ""], [1, 3, "OR"], [2, 3, "NV"], [3, 3, "WY"], 
                     [4, 3, "SD"], [5, 3, "IA"], [6, 3, "IN"], [7, 3, "OH"], [8, 3, "PA"], [9, 3, "NJ"], [10, 3, "CT"], [11, 3, "RI"], 
                     [0, 4, ""], [1, 4, "CA"], [2, 4, "UT"], [3, 4, "CO"], [4, 4, "NE"], [5, 4, "MO"], [6, 4, "KY"], [7, 4, "WV"], 
                     [8, 4, "VA"], [9, 4, "MD"], [10, 4, "DE"], [11, 4, ""], [0, 5, ""], [1, 5, ""], [2, 5, "AZ"], [3, 5, "NM"], 
                     [4, 5, "KS"], [5, 5, "AR"], [6, 5, "TN"], [7, 5, "NC"], [8, 5, "SC"], [9, 5, "DC"], [10, 5, ""], [11, 5, ""], 
                     [0, 6, "HI"], [1, 6, ""], [2, 6, ""], [3, 6, ""], [4, 6, "OK"], [5, 6, "LA"], [6, 6, "MS"], [7, 6, "AL"], 
                     [8, 6, "GA"], [9, 6, ""], [10, 6, ""], [11, 6, ""], [0, 7, ""], [1, 7, ""], [2, 7, ""], [3, 7, ""], [4, 7, "TX"], 
                     [5, 7, ""], [6, 7, ""], [7, 7, ""], [8, 7, ""], [9, 7, "FL"], [10, 7, ""], [11, 7, ""]].map(d => ({col: d[0], row: d[1], code: d[2]}));


                     const sales = [{ code: "CA", name: "San Luis Obispo", value: 138800 }, 
                     { code: "UT", name: "Santa Barbara", value: 1724650 }, 
                     { code: "ID", name: "Kern", value: 28500 },
                     { code: "ME", name: "Ventura", value: 985460 }, 
                     { code: "AK", name: "Los Angeles", value: 4763850 }, 
                     { code: "NJ", name: "Sab Bernadino", value: 1332765 },
                     { code: "DC", name: "Orange", value: 2863752 }, 
                     { code: "SC", name: "Riverside", value: 2246830 }, 
                     { code: "AL", name: "San Diego", value: 2921634 }]



class Dataset {
    constructor(csv_path){
        this._records_p = d3.csv(csv_path )
        this._start_year = "2000"
        this._end_year = "2019"
        this._state_totals = null   // total cases of each state of all years
        this._state_groups = null
        this._state_years = null    // total cases of each state of each years
    }

    async init () {
        await Promise.all([this._records_p]).then(values => {
            //console.log(values)
            this._records = values[0];
            // from year 2000
            console.log("Total data cases:",this._records.length)
            this._records = this._records.filter(d => d.DATA_YEAR >="2000")
            //console.log(this._records)
            this._state_groups = Array.from(d3.group(this._records, d => d.STATE_ABBR))
            //console.log(this._state_groups)
          });
        //console.log(this._state_groups)
        //this._cal_state_years()
    }

    //{name: "NY", total:{2000: "24", 2001:"53"...}, anti_white:{2000: "24", 2001:"53"...}}
    _cal_state_years(){
        var sat_years = []
        for(let i = 0; i < this._state_groups.length; i++){
            var record = {code: this._state_groups[i][1][0].STATE_ABBR, name: this._state_groups[i][1][0].STATE_NAME, total: {}, anti_white: {}, anti_black:{}, anti_asian:{}, anti_jewish:{}, anti_islamic:{}, anti_arab:{}, anti_hispanic:{}}
            for(let j = (parseInt(this._start_year)); j <= (parseInt(this._end_year)); j++){
                if( j< this._start_year || j>this._end_year){
                    continue;
                }
                var state_anual_arr = this._state_groups[i][1].filter(d => (d.DATA_YEAR ==j))
                var anti_white_num = state_anual_arr.filter(d => d.BIAS_DESC == "Anti-White").length
                var anti_black_num = state_anual_arr.filter(d => d.BIAS_DESC == "Anti-Black or African American").length
                var anti_asian_num = state_anual_arr.filter(d => d.BIAS_DESC == "Anti-Asian").length
                var anti_jewish_num = state_anual_arr.filter(d => d.BIAS_DESC == "Anti-Jewish").length
                var anti_islamic_num = state_anual_arr.filter(d => d.BIAS_DESC == "Anti-Islamic (Muslim)").length
                var anti_arab_num = state_anual_arr.filter(d => d.BIAS_DESC == "Anti-Arab").length
                var anti_hispanic_num = state_anual_arr.filter(d => d.BIAS_DESC == "Anti-Hispanic or Latino").length
                
                record.total[j.toString()] = state_anual_arr.length
                record.anti_white[j.toString()] = anti_white_num 
                record.anti_black[j.toString()] = anti_black_num 
                record.anti_asian[j.toString()] = anti_asian_num 
                record.anti_jewish[j.toString()] = anti_jewish_num
                record.anti_islamic[j.toString()] = anti_islamic_num
                record.anti_arab[j.toString()] = anti_arab_num
                record.anti_hispanic[j.toString()] = anti_hispanic_num
            }
            sat_years.push(record)
        }

        var columns = ["name"]
        for(let j = (parseInt(this._start_year)); j <= (parseInt(this._end_year)); j++){
            if( j< this._start_year || j>this._end_year){
                continue;
            }
            columns.push(j.toString())
        }
        sat_years['columns'] = columns

        //console.log(sat_years)
        this._state_years = sat_years
    }

    _cal_state_totals(){
        var state_totals = []
        for(let i = 0; i < this._state_groups.length; i++){
            //console.log(this._state_groups[i])
            var selected_y = this._state_groups[i][1].filter(d => (d.DATA_YEAR >=this._start_year && d.DATA_YEAR <=this._end_year))
            //console.log(selected_y)
            state_totals.push({ code: this._state_groups[i][0], name: this._state_groups[i][1][0].STATE_NAME, value: selected_y.length})
        } 

        //console.log(state_totals)

        this._state_totals = state_totals
    }

    setYear(sYear, eYear){
        this._start_year = sYear
        this._end_year = eYear
        //this._cal_state_totals()
        this._cal_state_years()
    }

    get_total_by_states(){
        return this._state_totals
    }

    get_states_years(){
        return this._state_years
    }

}

function convert_line_data(data){
    const columns = data.columns.slice(1);
    new_data =  {
        y: "Hate Crimes",
        series: data.map(d => ({
            code: d.code,
            name: d.name.replace(/, ([\w-]+).*/, " $1"),
            total: columns.map(k => +d.total[k]),
            anti_white: columns.map(k => +d.anti_white[k]),
            anti_black: columns.map(k => +d.anti_black[k]),
            anti_asian: columns.map(k => +d.anti_asian[k]),
            anti_jewish: columns.map(k => +d.anti_jewish[k]),
            anti_islamic: columns.map(k => +d.anti_islamic[k]),
            //anti_arab: columns.map(k => +d.anti_arab[k]),
            anti_hispanic: columns.map(k => + d.anti_hispanic[k]),

            //anti_other: columns.map(k => +d.anti_other[k]),
            //values: columns.map(k => +d[k])
        })),
        dates: columns      //.map(d3.utcParse("%Y-%m"))
    };
    //console.log(new_data)
    return new_data
}

function convert_map_data(data){
    // [{code:"", name:"", value:{total:, anti_white:, anti_blakc:}},{},{}]
    var map_d = []
    data.map(d => {
        var tem_r = {code:"", name:"", value:{total:0, anti_white:0, anti_black:0, anti_asian:0, anti_jewish:0, anti_islamic:0, anti_arab:0, anti_hispanic:0}}
        tem_r.code = d.code
        tem_r.name = d.name.replace(/, ([\w-]+).*/, " $1")
        var labels = Object.keys(tem_r.value)
        labels.forEach(l => {
            tem_r.value[l] = d3.sum(Object.values(d[l]))
        })
        map_d.push(tem_r)
    })
    
    return map_d
}

function get_last_data(data){
    new_data =  {
        y: "Hate Crimes",
        series: data.series.map(d => ({
            code: d.code,
            name: d.name,
            total: d.total.slice(-1),
            anti_white: d.anti_white.slice(-1),
            anti_black: d.anti_black.slice(-1),
            anti_asian: d.anti_asian.slice(-1),
            anti_jewish: d.anti_jewish.slice(-1),
            anti_islamic: d.anti_islamic.slice(-1),
            //anti_arab: d.anti_arab.slice(-1),
            anti_hispanic: d.anti_hispanic.slice(-1),
            //anti_other: columns.map(k => +d.anti_other[k]),
            //values: columns.map(k => +d[k])
        })),
        dates: data.dates.slice(-1)      //.map(d3.utcParse("%Y-%m"))
    };
    //console.log(new_data)
    return new_data
}