$('#editButton').on('click', function () {
  var info = $(this).attr('class');
  info = info.split('&&&');
  info[1] = info[1].split(' ').join('_');
  window.location.replace(`/edit-site/${info[1]}/${info[0]}`);
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
