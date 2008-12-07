google.load("jquery", "1");
google.load("visualization", "1", {
  packages: ["columnchart"]
});

var tests_to_run = [];

function randomize_array(arr){
  return arr.sort(function(){
    return 0.5 - Math.random()
  });
}

var precanned_callbacks = {
  race: {
    initialize_main: function(race){
      this.race = race;
      var data = new google.visualization.DataTable();
      data.addColumn("string", "tests")
      
      var tests_to_print = []
      for (var i = 1; i < race.length; i++) {
        tests_to_print.push(i);
      }
      this.tests_to_print = randomize_array(tests_to_print);
      
      for (var i = 0; i < this.tests_to_print.length; i++) {
        real_i = this.tests_to_print[i] - 1;
        data.addColumn("number", race[real_i+1].name);
        //console.log("column " + i + " is " + real_i + "," + race[real_i+1].name)
      }
      data.addRows(1);
      data.setValue(0, 0, '');
      
      for (var i = 0; i < this.tests_to_print.length; i++) {
        data.setValue(0, i+1, 0);
      }
      this.data = data;
      var div = $('#' + race[0].id + " .graph")[0];
      $(div).html('');
      var chart = new google.visualization.ColumnChart(div);
      this.chart = chart;
      
      this.redraw_graph = function(times){
        times = times || [];
        for (var i = 0; i < this.tests_to_print.length; i++) {
          real_i = this.tests_to_print[i] - 1;
          this.data.setValue(0, i + 1, times[real_i]);
        }
        this.chart.draw(this.data, {
          width: race[0].chart_width || 400,
          height: race[0].chart_height || 240,
          is3D: false,
          titleY: "total milliseconds",
          title: "Result after " + this.runs_count + " runs"
        });
      }
      
      //$(div).append("Runs: ");
      //this.runs = $("<span>").appendTo(div);
      this.runs_count = 0;
      
      this.redraw_graph();
    },
    in_progress_main: function(times){
      this.runs_count++;
      if (this.runs_count % 10 == 0) {
        this.redraw_graph(times);
      }
      //$(this.runs).text(this.runs_count);
    },
    done_main: function(times){
      this.redraw_graph(times);
      var exp = this.race[0].explanation;
      if(exp){
        var results_div = $('#' + this.race[0].id + " .results");
        var exp_div;
        setTimeout(function(){
          exp_div = $("<div class=\"explanation\"><h4>Explanation</h4></div>").hide().appendTo(results_div).slideDown();
        }, 500);
        setTimeout(function(){
          $("<span>" + exp + "</span>").hide().appendTo(exp_div).slideDown();
        }, 1500);
      }
    }
  }
}


google.setOnLoadCallback(function(){
  $.each(tests, function(){
    var meta = this[0];
    var all = $("<div class=\"test\" id=\"" + meta.id + "\">").appendTo("#tests");
    var title = $("<h2 class=\"title\">" + meta.title + "</h2>").appendTo(all);
    var description = $("<div class=\"description\">").append("<h3>Race Description</h3>").append("<p>" + meta.description + "</p>").append("<p>Runs: " + meta.runs + "</p>").appendTo(all);
    var test_description = $("<div class=\"test_description\"><h3>Test Descriptions</h3></div>").appendTo(all);
    var results = $("<div class=\"results\"><h3>Results</h3><div class=\"graph\"></div></div>").appendTo(all);
    var spacer = $("<div class=\"spacer\"></div>").appendTo(all);
    
    var tests_to_print = []
    for (var i = 1; i < this.length; i++) {
      tests_to_print.push(i);
    }
    tests_to_print = randomize_array(tests_to_print);
    
    for (i in tests_to_print) {
      i = tests_to_print[i]
      test_description.append("<h4>" + this[i].name + "</h4>");
      test_description.append("<p class=\"description\">" + this[i].description + "</p>");
      var code = this[i].test.toString();//.replace(/\{/g, "{<br />").replace(/;/g, ";<br />");
      test_description.append("<p class=\"code\">Code: " + code + "</p>");
    }
    
    var race = this;
    
    $("<button>Run race</button>").click(function(){
      $(this).hide();
      var times = [];
      for (var j = 1; j < race.length; j++) {
        times[j - 1] = 0;
      }
      tests_to_run = [];
      var timer;
      for (var i = 0; i < meta['runs']; i++) {
        tests_to_run.push(function(){
          for (var j = 1; j < race.length; j++) {
          
            if ($.isFunction(race[j].setup)) {
              try {
                race[j].setup()
              } catch (e) {
                throw ("Setup " + j + " failed for test \"" + meta.title + "\": " + e);
              }
            };
            
            timer = new Date();
            
            race[j].test();
            
            var incremental_time = new Date() - timer;
            times[j - 1] += incremental_time;
            
            if ($.isFunction(race[j].teardown)) {
              try {
                race[j].teardown();
              } catch (e) {
                throw ("Teardown " + j + " failed for test \"" + meta.title + "\": " + e);
              }
            }
          }
          meta.callbacks.in_progress(times);
          return times;
        })
      }
      meta.callbacks.initialize(race);
      run_next_test(0, race);
    }).appendTo(results);
  });
});
var run_next_test = function(test_number, test){
  var times = tests_to_run[test_number](test_number);
  if (test_number + 1 < tests_to_run.length) {
    setTimeout(function(){
      run_next_test(test_number + 1, test)
    }, 25);
  } else {
    test[0].callbacks.done(times);
  }
}