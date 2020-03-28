// Grab the articles as a json
$.getJSON("/articles", function (data) {
  for (var i = 0; i < data.length; i++) {
    $("#articles").append(`
      <div class='card'>
        <div class='card-body'>
          <p data-id="${data[i]._id}" class="card-title">
            <a href="${data[i].link}" class='btn-primary-sm'>
              <h3>${data[i].title}</h3>
            </a>
          </p>
          <button type='button' class='btn btn-primary note-button' id='add-note' data-id="${data[i]._id }">
            Add a note
          </button>
        </div>
      </div>
    `);
  }
});

$(document).on("click", "#scrape-it", function () {
  $.get("/scrape", function (data) {
    console.log(data);
  }).then(location.reload());
})


// Whenever someone clicks a p tag
$(document).on("click", "#add-note", async function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  const data = await $.ajax({ method: "GET", url: `/articles/${thisId}`})
  $("#notes").append(`
    <div class='row'>
      <div class='col-sm-3'></div>
      <div class='col-sm-6'>
        <div class='card'>
          <div class='card-body'>
            <div class='card-title'><h4>${data.title}</h4></div>
            <input id='titleinput' name='title' class='card-body'>
              <textarea id='bodyinput' name='body'></textarea>
            </input>
          </div>
          <a href="#" class='btn btn-primary' data-id='${data._id}' id='savenote'>
            Save Note
          </a>
        </div>
      </div>
    </div>
    </br>
  `);

  if (data.note) {
    $("#titleinput").val(data.note.title);
    $("#bodyinput").val(data.note.body);
  }
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});