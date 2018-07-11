$('button').on('click', function () {
  var newTitle = $('#title').val();
  var newRating = $('#rating').val();
  var newReview = $('#review').val();
  var siteTable = $('#siteTable').val();
  console.log(siteTable);
  var review = {title: newTitle, rating: newRating, review: newReview};
  console.log(review);

  console.log(newTitle);
  if (newTitle === "") alert('A Website Title is required');
  else if (isNaN(newRating) && newRating !== "") alert('Rating must be a number');
  else if (newRating < 1 || newRating > 10) alert('Rating must be between 1 and 10');
  else {
    $.ajax({
      type: 'POST',
      url: `/add-review/${siteTable}`,
      data: review,
      success: function (data) {
        alert("Review was successfully submitted.");
        window.location.replace('/');
      }
    })
  }
})
