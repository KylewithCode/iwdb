$('.editButton').on('click', function () {
  var id = $(this).attr('id');
  window.location.replace(`/edit-site/${id}`);
});

$('.submitButton').on('click', function () {
  var id = $(this).attr('id');
  var newLink = $('#link').val();
  var newDesc = $('#description').val();
  var site = {link: newLink, description: newDesc};
  console.log('Got here');
  console.log(site);
  $.ajax({
    type: 'POST',
    url: '/edit-site/' + id,
    data: site,
    success: function () {
      alert("Website was successfully edited.");
      window.location.replace('/');
    }
  })
});
