/*
    Chart.js "gauge" chart by jsguy

    Shows a single value on a "guage"-like chart.

    Usage:

        var ctx = document.getElementById('canvas').getContext("2d");
        new Chart(ctx).Gauge({
            pct:55
        });

    See defaults below for options you can pass in
*/
Chart.Type.extend({
    name: "Gauge",
    defaults : {
        bottomSegment: 25,                      //  Percent size fo segment to cut out of the bottom part
        segmentColor: "transparent",            //  Colour of segment
        bgColor: "#cccccc",                     //  Background colour of chart
        invertAutoColors: false,                //  Invert colours, eg: if smaller values are considered "good"
        font: "Arial",                          //  What font to use for the middle number
        fontSizePercentage: 25,                 //  How large to show the middle number as a percentage of the height of the chart
        effectiveFontHeightMultiplier: 0.72,    //  How large the font is (visibly - depends on font chosen)
        pct: 100,                               //  Value to show on chart (0-100)
        showPctSign: false,                     //  Do we show the percentage sign
        percentageInnerCutout: 75               //  How big is the inner cut-out
    },
    initialize:  function(args){
        //  Get RGB colour (works with IE7+)
        //  Based on: http://jsfiddle.net/maniator/tKrM9/53/
        var getPercentageColor = function(value){
            var sc = [0,192,32], mc = [192,192,0], ec = [192,0,32],
                //  Calculate interpolated value
                calc = function(s, e, count) {
                    return Math.floor(s + (((e - s) / 50) * count));
                },
                s = ec, e = mc, col,
                val = 100 - (0 + value);
            
            //  When we reach 1/2 way.
            if (val > 50) {
                s = mc;
                e = sc;
                val = val % 51;
            }

            var col = [calc(s[0], e[0], val), calc(s[1], e[1], val), calc(s[2], e[2], val)];
            
            return "rgb(" + col.join(",") + ")";
        },
        //  Extend the options
        extend = function(o1, o2){
            var o = {};
            for(var i in o1) {if(o1.hasOwnProperty(i)){
                o[i] = o1[i];
            }}

            for(var i in o2) {if(o2.hasOwnProperty(i)){
                o[i] = o2[i];
            }}
            return o;
        },
        options = extend(this.defaults, args), 
        colPct;

        //  Auto set colour based on pct, red to green
        //  TODO: Perhaps we should use 
        if(! options.color) {
            colPct = options.invertAutoColors? (options.pct): (100-options.pct);
            options.color = getPercentageColor(colPct);
        }
        
        //  Set the text color - fallback is color
        options.textColor = options.textColor || options.color;
        
        //  Ensure we have a numeric value
        options.pct = (options.pct > 100)? 100: options.pct;
        options.pct = (options.pct < 0)? 0: options.pct;

        var ratio = (100 - options.bottomSegment)/100,
            right = ((options.pct>(50))? 50: options.pct),
            left = options.pct - right,
            leftRest = 50 - left,
            rightRest = 50 - right,
            data = [
                { value : left * ratio, color : options.color},
                { value : leftRest * ratio, color : options.bgColor},
                { value : options.bottomSegment, color : options.segmentColor},
                { value : right * ratio, color : options.color},
                { value : rightRest * ratio, color : options.bgColor}
            ], 
            can = this.chart.canvas, 
            ctx = this.chart.ctx,
            fontHeight = can.offsetHeight * (options.fontSizePercentage/100),
            effectiveFontHeight = fontHeight * options.effectiveFontHeightMultiplier;

        (function(ctx, options){
            var dough = new Chart(ctx).Doughnut(data, {
                //  Never show the stroke
                segmentShowStroke   : false,
                //  Tootips won't work with this, as we're building several segments of the chart manually
                showTooltips: false,
                percentageInnerCutout: options.percentageInnerCutout,
                animation: false,
                onAnimationComplete: function(){
                    var x = can.width / 2,
                        y = (can.height / 2) + (effectiveFontHeight/2); 

                    ctx.textAlign = 'center';
                    ctx.fillStyle = options.textColor;
                    ctx.font = "bold "+fontHeight+"px " + options.font;
                    ctx.fillText("" + options.pct + (options.showPctSign? "%": ""), x, y);

                }
            });
        }(ctx, options));
    }
});
