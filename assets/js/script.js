var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};



$(".list-group").on("click", "p", function() {
  // creating an element with the class "list-group" using the on() ; is the "p" in the code stating the <p> is the delegated parent or we are creating a <p> object??
  
  var text = $(this)
    .text()
    .trim();

  // this() refers to the actual elements now (post-creation); this.text pulls the text and this.trim removes any white space

  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  // creating a textarea element and adding the calss "form-control" with a value of text

  $(this).replaceWith(textInput);

  // replacing the this() element with the textInput element; so, replacing <p> object with the <textarea> object

  textInput.trigger("focus");

  // trigger("focus") highlights the edit box; need to read abotu the trigger() method

});
  
  // the blur object puts the edit box back to original state when I ckick elsewhere on the page
 
  $(".list-group").on("blur", "textarea", function() {
    // get the textarea's current value/text
    var text = $(this)
      .val()
      .trim();

    // get the parent ul's id attribute
    var status = $(this)
      .closest(".list-group")
      .attr("id")
      .replace("list-", "");

    // get the task's position in the list of the li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();

    // below codes puts the information into localStorage; need to better understand how calling saveTasks() is putting the defined info into localStorage
    
    tasks[status][index].text = text;
    saveTasks();

    // tasks is an object; tasks[status] returns an array; tasks[status][index] returns the oject at the given index in the array; tasks[status][index].text returns the text property of the object at the given index

    // recreate p element
    var taskP = $("<p>")
      .addClass("m-1")
      .text(text);

    // replace textarea with p element
    $(this).replaceWith(taskP);

  });

// due date was clicked
$(".list-group").on("click", "span", function() {
  //get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");

});



  // value of the due date was changed
  $(".list-group").on("blur", "input[type='text']", function() {
    // get current text
    var date = $(this)
    .val()
    .trim();


  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li element
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save the localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

    
});

// adding the sortable functionality / sortable() method turned every element with the list-group class into sortable items / the connectWith property when linked these sortable lists with any other lists that have the same class
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    // console.log("activate", this);
  },
  deactivate: function(event) {
    // console.log("deactivate", this);
  },
  over: function(event) {
    // console.log("over", event.target);
  },
  out: function(event) {
    // console.log("out", event.target);
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];
    // loop over the current set of children elements in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();

    //console.log(tempArr);
    //console.log($(this).children());
    // children () method returns an array of the list element's children
    //the each() method will run a callback function for every item/element in the array
    //$(this) refers to the child element at that index - research this a little in the docs
  }
});

// above adding some event listeners / research each of these in the docs / the active and deactivate events trigger once for all connected lists as soon as dragging starts and stops / the over and out events trigger when a dragged item enters or leaves a connected list / the updated event triggers when the contents of a list have changed

// making the trash bin operational
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    // remove() will remove that element from the DOM entirely
  },
  over: function(event, ui) {
    //console.log("over");
  },
  out: function(event, ui) {
    //console.log("out");
  }
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


