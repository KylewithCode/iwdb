$('button').on('click', function () {
  var newTitle = $('#title').val();
  var newLink = $('#link').val();
  var newDesc = $('#description').val();
  var site = {title: newTitle, link: newLink, description: newDesc};

  $.ajax({
    type: 'POST',
    url: '/new',
    data: site,
    success: function (data) {
      alert("Website was successfully submitted.");
      window.location.replace('/');
    }
  })
})
