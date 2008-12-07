var tests = [[{
  runs: 200,
  id: 'not_using_id',
  title: "Not using an id as the top-most selector",
  description: "With a long DOM, not using an id to narrow one's search can be bad.",
  callbacks: {
    initialize: precanned_callbacks.race.initialize_main,
    in_progress: precanned_callbacks.race.in_progress_main,
    done: precanned_callbacks.race.done_main
  },
  explanation: "When you're not using an id as your first selector, you end up running your selection over <em>your entire DOM</em>.  And chances are, it's a lot bigger than the one on this page.  Use an id selector whenever possible -- it's the fastest way to narrow the scope of your search."
}, {
  name: 'Without id',
  description: "Not using an id as the top selector",
  test: function(){
    $(".top_class");
  }
}, {
  name: 'With id',
  description: "Using an id as the top selector",
  test: function(){
    $("#test_dom .top_class");
  }
}], [{
  runs: 200,
  id: 'hide_vs_display',
  title: "Methods of hiding a selection",
  description: "Which is faster, hiding with hide() or setting an attribute?",
  callbacks: {
    initialize: precanned_callbacks.race.initialize_main,
    in_progress: precanned_callbacks.race.in_progress_main,
    done: precanned_callbacks.race.done_main
  }, explanation: "Setting the attribute directly on the DOM object will naturally be the fastest, as it's not a method call and it's what the other methods ultimately end up doing.  But why is using attr so much faster than hide()?  Turns out hide() does a lot of behind the scenes magic that most likely, you don't even need."
}, {
  name: 'display none',
  description: "Using attr('display', 'none') to hide a selection",
  teardown: function(){
    $("#has_an_id_too").attr("display", '');
  },
  test: function(){
    $("#has_an_id_too").attr('display', 'none');
  }
}, {
  name: 'hide()',
  description: "Using hide() to hide a selection",
  teardown: function(){
    $("#has_an_id_too").show();
  },
  test: function(){
    $("#has_an_id_too").hide();
  }
}, {
  name: 'attribute',
  description: "Using the DOM property to set display to none",
  teardown: function(){
    $("#has_an_id_too").each(function(){
      this.style.display = '';
    })
  },
  test: function(){
    $("#has_an_id_too").each(function(){
      this.style.display = 'none';
    })
  }
}, ], [{
  runs: 200,
  id: 'not_saving_object',
  title: "Saving selection in an object vs. not (applied example)",
  description: "How much difference is there in saving a selection?  Let us test by grabbing a selection 6 times.</p><p>Note: This is an applied example, meaning I threw in some other stuff to make things more interesting/relevant, but affects the results.",
  callbacks: {
    initialize: precanned_callbacks.race.initialize_main,
    in_progress: precanned_callbacks.race.in_progress_main,
    done: precanned_callbacks.race.done_main
  }, chart_width: 500,
  explanation: "This one is fairly obvious.  Why make jQuery find you a selection each time when you can just...save it?"
}, {
  name: "Not saving selection",
  description: "Using $ to grab the same selection",
  test: function(){
    $(".top_class").hide();
    $(".top_class").show();
    $(".top_class").hide();
    $(".top_class").show();
    $(".top_class").hide();
    $(".top_class").show();
  },
  teardown: function(){
    $(".top_class").show();
  }
}, {
  name: "Saving a selection",
  description: "Only using $ once to grab the selection",
  test: function(){
    var t = $(".top_class").hide();
    t.show();
    t.hide();
    t.show();
    t.hide();
    t.show();
  },
  teardown: function(){
    $(".top_class").show();
  }
}], [{
  runs: 200,
  id: 'find_vs_children',
  title: "Using find() when you could be using children()",
  description: "How much of a difference is there really?",
  callbacks: {
    initialize: precanned_callbacks.race.initialize_main,
    in_progress: precanned_callbacks.race.in_progress_main,
    done: precanned_callbacks.race.done_main
  },
  chart_width: 500,
  explanation: "find() searches the entire DOM below an element, whereas children() only checks the DOM immediately below the element.  If you only need to check the children, use children()!  As for why the CSS selectors are slower, or why the relationship appears to be switched between children and find, my only guess is that css find does something like document.getElementById('top_list').getElementsByClassName('turtle'), whereas css children gets document.getElementsByClassName('turtle') and then has to iterate over each one to check its parent."
}, {
  name: "find()",
  description: 'Using find to get a class',
  test: function(){
    $("#top_list").find(".turtle");
  }
}, {
  name: 'children()',
  description: 'Using children to get a class',
  test: function(){
    $("#top_list").children(".turtle");
  }
}, {
  name: "css selector: find",
  description: 'Using css find to get a class',
  test: function(){
    $("#top_list .turtle");
  }
}, {
  name: 'css selector: children',
  description: 'Using css children to get a class',
  test: function(){
    $("#top_list > .turtle");
  }
}], [{
  runs: 250,
  id: "each_vs_for",
  title: "jQuery each vs JavaScript loops",
  description: "Is it slower?",
  callbacks: {
    initialize: precanned_callbacks.race.initialize_main,
    in_progress: precanned_callbacks.race.in_progress_main,
    done: precanned_callbacks.race.done_main
  }, explanation: "I'm not discouraging the use of each(), but just be aware that it has a non-zero performance impact."
}, {
  name: "each()",
  description: "using each to iterate over a selection",
  test: function(){
    $("li").each(function(){
      var li = $(this);
    });
  }
}, {
  name: "for, indexed",
  description: "using a for loop to iterate over elements",
  test: function(){
    var lis = $("li");
    for (var i = 0, len = lis.length; i < len; i++) {
      var li = $(lis[i]);
    }
  }
}, {
  name: "for...in",
  description: "using the for...in construct to iterate",
  test: function(){
    var lis = $.makeArray($("li"));
    for (var i in lis) {
      var li = $(lis[i]);
    }
  }
}], [{
  runs: 200,
  id: "not_saving_jq_this",
  title: "Does it hurt to not save $(this)?",
  description: "How much does it actually impact code to not save $(this) in a local variable?  Let's find out by testing it 4 times.",
  callbacks: {
    initialize: precanned_callbacks.race.initialize_main,
    in_progress: precanned_callbacks.race.in_progress_main,
    done: precanned_callbacks.race.done_main
  },
  chart_width: 500,
  explanation: "Not saving jQuery(this) does appear to have a small performance impact.  You might as well go ahead and save it."
}, {
  name: "Saving jQuery(this)",
  description: "Saving jQuery(this) in a variable",
  test: function(){
    $("li").each(function(){
      var me = $(this);//.hide();
      me;//.show();
      me;//.hide();
      me;//.show();
    })
  }
}, {
  name: "Not saving jQuery(this)",
  description: "Not saving jQuery(this) in a variable",
  test: function(){
    $("li").each(function(){
      $(this);//.hide();
      $(this);//.show();
      $(this);//.hide();
      $(this);//.show();
    })
  }
}], [{
  runs: 200,
  id: 'unnecessary_id_tag',
  title: "<abbr title='Too Much Information'>TMI</abbr>: Tag + id, should you specify the tag at all?",
  description: "If you're already calling out an id, you don't need to also specify a tag.  Why?  Because ids are already unique, and this just forces another O(n) iteration.",
  callbacks: {
    initialize: precanned_callbacks.race.initialize_main,
    in_progress: precanned_callbacks.race.in_progress_main,
    done: precanned_callbacks.race.done_main
  }, explanation: "It's surprising that it has this much of a performance impact, but really, if you're using an id selector...you don't need to further qualify the object.  It will only make the search slower."
}, {
  name: "With tag",
  description: "Using a tag with an id selector",
  test: function(){
    $("li#last_one")
  }
}, {
  name: "Without tag",
  description: "Not using a tag with an id selector",
  test: function(){
    $("#last_one")
  }
}]];
