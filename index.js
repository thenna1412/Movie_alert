let userEmail = "";

// Keep #email-input in sync with userEmail
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("email-input");
  const emailContainer = document.getElementById("email-container");
  if (emailInput) {
    if (userEmail) emailInput.value = userEmail;

    emailInput.addEventListener("input", function (e) {
      userEmail = e.target.value.trim();
      if (emailContainer) {
        emailContainer.innerHTML = userEmail ? `Welcome 👋 <b>${userEmail}</b>` : `Welcome 👋`;
      }
    });
  }
});

// Submit movie alert
function postAlienEncounter() {
  const movieInput = document.getElementById("city-post-input");
  const movie = movieInput.value.trim();

  if (!movie) {
    Swal.fire("Warning", "Please enter a movie name", "warning");
    return;
  }

  const isPreferred = JSON.parse(
    document.querySelector('input[name="theatreType"]:checked').value
  );

  $.ajax({
    url: "https://movie-alert-60047185658.development.catalystserverless.in/server/movie_alert/datastore",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      Movie_name: movie,
      isPreferredTheatre: isPreferred,
      Emails: userEmail
    }),

    success: function (data) {
      // 🔥 Handle backend responses cleanly
      if (data.status === "exists") {
        Swal.fire("Already Added", "Movie already in alerts", "info");
      } 
      else if (data.status === "email_added") {
        Swal.fire("Updated", "Alert already exists for this movie", "success");
      } 
      else if (data.status === "added") {
        Swal.fire("Success", "Movie added!", "success");
      } 
      else {
        Swal.fire("Info", data.message || "Request processed", "info");
      }

      movieInput.value = ""; // clear input
      console.log("API Response:", data);
    },

    error: function (err) {
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
      console.error("API Error:", err);
    }
  });
}
