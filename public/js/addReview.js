$('button').on('click', function () {
  var newTitle = $('#title').val();
  var newRating = $('#rating').val();
  var newReview = $('#review').val();
  var siteTitle = $('#siteTitle').val();
  if ($('#malicious').prop('checked')) var maliciousBool = 'yes';
  else var maliciousBool = 'no';
  console.log(siteTitle);
  var review = {title: newTitle, rating: newRating, review: newReview, malicious: maliciousBool};
  console.log(review);

  console.log(newTitle);

  if (newTitle === "") alert('A Title is required');
  else if (newRating !== "" && newRating < 0 || newRating > 10) alert('Rating must either be a number between 1 and 10, or be left empty.');
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
