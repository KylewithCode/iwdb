$('li').on('click', function () {
  //console.log('li item clicked');
  var id = $(this).attr('id');
  var title = $(this).attr('class');
  $.ajax({
    type: 'DELETE',
    url: '/remove-site/' + title + "/" + id,
    success: function () {
      //Code to do something with the response
      location.reload();
    }
  })
});
