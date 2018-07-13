$('li').on('click', function () {
  //console.log('li item clicked');
  var id = $(this).attr('id');
  var table = $(this).attr('class');
  table = table.toString().split(' ').join('_') + '_reviews'
  console.log(table);
  $.ajax({
    type: 'DELETE',
    url: '/remove-site/' + table + "/" + id,
    success: function () {
      //Code to do something with the response
      location.reload();
    }
  })
});
