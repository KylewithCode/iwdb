$('.editRev').on('click', function () {
  var id = $(this).attr('id');
  $('#review' + id).css("display", "none");
  $('#editReview' + id).css("display", "block");
});

$('.cancelRev').on('click', function () {
  var id = $(this).attr('id');
  console.log(id);
  $('#editReview' + id).css("display", "none");
  $('#review' + id).css("display", "block");
});

$('.submitRev').on('click', function () {
  var id = $(this).attr('id');
  var title = $('#siteTitle').val();
  var newTitle = $('#title' + id).val();
  var newRating = $('#rating' + id).val();
  var newReview = $('#rev' + id).val();
  var review = {title: newTitle, rating: newRating, review: newReview};

  if (newTitle === "") alert('A Title is required');
  else if (newRating !== "" && newRating < 1 || newRating > 10) alert('Rating must either be a number between 1 and 10, or be left empty.');
  else if (isNaN(newRating)) alert('Rating must either be a number between 1 and 10, or be left empty.')
  else {
    $.ajax({
      type: 'POST',
      url: `/edit-review/${title}/${id}`,
      data: review,
      success : function (data) {
        location.reload();
      }
    }) 
  }
});
