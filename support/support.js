// Load up jQuery from our friends at Google
google.load("jquery", "1");
// And load up the column chart visualization thingy
google.load("visualization", "1", {
  packages: ["columnchart"]
});

// This comes in handy in a couple places...
function randomize_array(arr){
  return arr.sort(function(){
    return 0.5 - Math.random()
  });
};

// These are generic callbacks that are sufficient for all/most tests
var precanned_callbacks = {
  // These are callbacks for the main race: initialization, in_progress, and done
  race: {
    initialize_main: function(race){
      // Save the race
      this.race = race;
      // Create a new data table to stick data in
      var data = new google.visualization.DataTable();
      // Doesn't really matter, but this is the first column
      data.addColumn("string", "tests");
      
      // We need to get a list of the indexes of the
      // tests we're printing, and in what order
      var tests_to_print = [];
      // this just pushes on indexes from 1 to race.length
      for (var i = 1; i < race.length; i++) {
        tests_to_print.push(i);
      };
      // and randomize
      this.tests_to_print = randomize_array(tests_to_print);
      
      for (var i = 0; i < this.tests_to_print.length; i++) {
        // pull out the actual index we want
        real_i = this.tests_to_print[i];
        // and tack it on as another column
        data.addColumn("number", race[real_i].name);
        // repeat for all columns
      };
      // We only have one data set, so just the one row
      data.addRows(1);
      // This means we don't get a caption directly underneath the bar,
      // which is fine
      data.setValue(0, 0, '');
      
      for (var i = 0; i < this.tests_to_print.length; i++) {
        data.setValue(0, i + 1, 0);
      };
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
        };
        this.chart.draw(this.data, {
          width: race[0].chart_width || 400,
          height: race[0].chart_height || 240,
          is3D: false,
          titleY: "total milliseconds",
          title: "Result after " + this.runs_count + " runs"
        });
      };
      
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
      if (exp) {
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
};

var slashdot = null;
google.setOnLoadCallback(function(){
  // Save the slashdot document for easy reference in the tests
  slashdot = $("iframe")[0].contentDocument;
  
  $.each(tests, function(){
    // Save the metadata
    var meta = this[0];
    
    // This is the all-encompassing div.  We make one for each race
    var all = $("<div class=\"test\" id=\"" + meta.id + "\">").appendTo("#tests");
    var title = $("<h2 class=\"title\">" + meta.title + "</h2>").appendTo(all);
    var description = $("<div class=\"description\">").append("<h3>Race Description</h3>").append("<p>" + meta.description + "</p>").append("<p>Runs: " + meta.runs + "</p>").appendTo(all);
    var test_description = $("<div class=\"test_description\"><h3>Test Descriptions</h3></div>").appendTo(all);
    var results = $("<div class=\"results\"><h3>Results</h3><div class=\"graph\"></div></div>").appendTo(all);
    var spacer = $("<div class=\"spacer\"></div>").appendTo(all);
    
    var tests_to_print = [];
    for (var i = 1; i < this.length; i++) {
      tests_to_print.push(i);
    };
    tests_to_print = randomize_array(tests_to_print);
    
    for (i in tests_to_print) {
      i = tests_to_print[i];
      test_description.append("<h4>" + this[i].name + "</h4>");
      test_description.append("<p class=\"description\">" + this[i].description + "</p>");
      var code = this[i].test.toString();//.replace(/\{/g, "{<br />").replace(/;/g, ";<br />");
      test_description.append("<p class=\"code\">Code: " + code + "</p>");
    };
    
    var race = this;
    
    $("<button class='start'>Run race</button>").click(function(){
      $(this).hide();
      var times = [];
      for (var j = 1; j < race.length; j++) {
        times[j - 1] = 0;
      };
      var timer;
      var tests_to_run = [];
      for (var i = 0; i < meta['runs']; i++) {
        tests_to_run.push(function(){
          for (var j = 1; j < race.length; j++) {
          
            // Run the setup for the current test, if it has one
            if ($.isFunction(race[j].setup)) {
              try {
                race[j].setup()
              } catch (e) {
                throw ("Setup " + j + " failed for test \"" + meta.title + "\": " + e);
              }
            };
            
            // Ready, steady...
            timer = new Date();
            
            // go!
            race[j].test();
            
            // stop...
            var incremental_time = new Date() - timer;
            
            // and chalk up the time
            times[j - 1] += incremental_time;
            
            // Run the teardown for the current test, if it has one
            if ($.isFunction(race[j].teardown)) {
              try {
                race[j].teardown();
              } catch (e) {
                throw ("Teardown " + j + " failed for test \"" + meta.title + "\": " + e);
              }
            }
          };
          // Execute the in_progress callback, giving it our current times
          meta.callbacks.in_progress(times);
          // we hand our caller (run_next_test) the times so that when
          // it comes time to execute the done callback, run_next_test
          // will be able to do it.
          return times;
        });
      };
      // Execute the initialize callback, giving it the race we're starting
      meta.callbacks.initialize(race);
      // Get the ball rolling
      run_test(tests_to_run, 0, race);
    }).appendTo(results);
  });
});
// this function is necessary because it can call itself
// when it's done with a small delay -- helpful so that
// the browser doesn't become unresponsive
var run_test = function(tests_to_run, test_number, test){
  var times = tests_to_run[test_number](test_number);
  if (test_number + 1 < tests_to_run.length) {
    // run the next test after waiting a bit
    setTimeout(function(){
      run_test(tests_to_run, test_number + 1, test)
    }, 25);
  } else {
    // all done, execute done callback
    try {
      test[0].callbacks.done(times);
    } catch (e) {
      throw ("Done callback failed: " + e)
    }
  }
}
