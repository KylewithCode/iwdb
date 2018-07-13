$('.deleteRev').on('click', function () {

  console.log('button item clicked');
  var id = $(this).attr('id');
  var title = $('#siteTitle').val();
  console.log(title);

  $.ajax({
    type: 'DELETE',
    url: '/delete-review/' + title + "/" + id,
    //data: ,
    success: function () {
      //Code to do something with the response
      location.reload();
    }
  })
});
