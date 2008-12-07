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
      
      // Iterate over all columns and set their initial value to 0
      for (var i = 0; i < this.tests_to_print.length; i++) {
        data.setValue(0, i + 1, 0);
      };
      
      // Save the data variable
      this.data = data;
      
      // This is the div containing just the graph inside the results section
      var div = $('#' + race[0].id + " .graph")[0];
      // Clear it -- there may already be a graph in there...if I readd
      // the ability to rerun a race
      $(div).html('');
      // Finally create the column chart in that div, but don't draw it yet
      var chart = new google.visualization.ColumnChart(div);
      // And of course save the chart so we can redraw it later
      this.chart = chart;
      
      // Just pass the times into this method to redraw the graph
      this.redraw_graph = function(times){
        // We want some sort of array...
        times = times || [];
        
        // This part is a little confusing.  If you look at the part where
        // we create the columns, we just go left to right and put
        // random (according to tests_to_print) column names wherever we please,
        // and here we're again going left to right, and setting values at
        // random, but in the same random order (using tests_to_print)
        for (var i = 0; i < this.tests_to_print.length; i++) {
          real_i = this.tests_to_print[i] - 1;
          this.data.setValue(0, i + 1, times[real_i]);
        };
        // This actually draws the graph -- notice you can specify
        // chart_width or chart_height.  This was necessary because
        // some of the columns had wide labels that was causing the text
        // to get too small in the legend
        this.chart.draw(this.data, {
          width: race[0].chart_width || 400,
          height: race[0].chart_height || 240,
          is3D: false,
          titleY: "total milliseconds",
          title: "Result after " + this.runs_count + " runs"
        });
      };
      
      // Total number of runs we've processed so far
      this.runs_count = 0;
      
      // And now, draw the graph!
      this.redraw_graph();
    },
    in_progress_main: function(times){
      // Increment number of runs we've processed so far
      this.runs_count++;
      // Only redraw the graph every 10 runs
      if (this.runs_count % 10 == 0) {
        this.redraw_graph(times);
      }
    },
    done_main: function(times){
      // Redraw the main graph one last time
      this.redraw_graph(times);
      var exp = this.race[0].explanation;
      if (exp) {
        // If this race has an explanation, do something with it
        var results_div = $('#' + this.race[0].id + " .results");
        var exp_div;
        // Create the explanation div with the explanation heading,
        // attach it to the results, and slide it in after half a second
        setTimeout(function(){
          exp_div = $("<div class=\"explanation\"><h4>Explanation</h4></div>").hide().appendTo(results_div).slideDown();
        }, 500);
        // Attach the actual explanation itself and slide that in a second after that
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
    // Create title, append to all
    var title = $("<h2 class=\"title\">" + meta.title + "</h2>").appendTo(all);
    // Create race description, append header, content, and run count, append to all
    var description = $("<div class=\"description\">").append("<h3>Race Description</h3>").append("<p>" + meta.description + "</p>").append("<p>Runs: " + meta.runs + "</p>").appendTo(all);
    // Append the start of the test descriptions to all
    var test_description = $("<div class=\"test_description\"><h3>Test Descriptions</h3></div>").appendTo(all);
    // Create the results tab, append header, insert div that will contain our graph, append to all
    var results = $("<div class=\"results\"><h3>Results</h3><div class=\"graph\"></div></div>").appendTo(all);
    // Since all the other tabs are float:left, we stick this in with clear:both to pull the all div's
    // height down to below the rest of the divs
    var spacer = $("<div class=\"spacer\"></div>").appendTo(all);
    
    // Despite having the same name as the variable in the precanned initialize callback,
    // this is only used to randomize output of the test descriptions
    var tests_to_print = [];
    for (var i = 1; i < this.length; i++) {
      tests_to_print.push(i);
    };
    tests_to_print = randomize_array(tests_to_print);
    
    // Go through all the tests and print their names, descriptions, and code
    for (i in tests_to_print) {
      i = tests_to_print[i];
      test_description.append("<h4>" + this[i].name + "</h4>");
      test_description.append("<p class=\"description\">" + this[i].description + "</p>");
      var code = this[i].test.toString(); //.replace(/\{/g, "{<br />").replace(/;/g, ";<br />");
      test_description.append("<p class=\"code\">Code: " + code + "</p>");
    };
    
    // Save the race so the button can access it
    var race = this;
    
    $("<button class='start'>Run race</button>").click(function(){
      $(this).hide();
      var times = [];
      for (var j = 1; j < race.length; j++) {
        times[j - 1] = 0;
      };
      var timer;
      var tests_to_run = [];
      // If the test says we're going for 100 runs, that's tracked here
      for (var i = 0; i < meta['runs']; i++) {
        // each run consists of a step forward for all competing tests
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
