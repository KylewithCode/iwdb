$('button').on('click', function () {
  var newTitle = $('#title').val();
  var newLink = $('#link').val();
  var newDesc = $('#description').val();
  var site = {title: newTitle, link: newLink, description: newDesc};

  console.log(newTitle);
  if (newTitle === "") alert('A Website Title is required');
  else if (newLink === "") alert('A Website URL is required');
  else if (newDesc === "") alert('A Website Description is required');
  else {
    $.ajax({
      type: 'POST',
      url: '/new',
      data: site,
      success: function (data) {
        alert("Website was successfully submitted.");
        window.location.replace('/');
      }
    })
  }
})
