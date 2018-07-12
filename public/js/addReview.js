$('button').on('click', function () {
  var newTitle = $('#title').val();
  var newRating = $('#rating').val();
  var newReview = $('#review').val();
  var siteTitle = $('#siteTitle').val();
  console.log(siteTitle);
  var review = {title: newTitle, rating: newRating, review: newReview};
  console.log(review);

  console.log(newTitle);

  if (newTitle === "") alert('A Website Title is required');
  else if (newRating !== "" && newRating < 1 || newRating > 10) alert('Rating must either be a number between 1 and 10, or be left empty.');
  else if (isNaN(newRating)) alert('Rating must either be a number between 1 and 10, or be left empty.')
  else {
    $.ajax({
      type: 'POST',
      url: `/add-review/${siteTitle}`,
      data: review,
      success: function (data) {
        alert("Review was successfully submitted.");
        window.location.replace('/');
      }
    })
  }
})
