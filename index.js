let userEmail = "";
let userEmailFromAuth = false;

// Manual email binding
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("email-input");
  const emailContainer = document.getElementById("email-container");

  if (emailInput) {
    emailInput.addEventListener("input", function (e) {
      userEmail = e.target.value.trim().toLowerCase();
      userEmailFromAuth = false;

      if (emailContainer) {
        emailContainer.innerHTML = userEmail
          ? `Welcome 👋 <b>${userEmail}</b>`
          : `Welcome 👋`;
      }
    });
  }
});

// Submit movie alert
function postAlienEncounter() {
  const movieInput = document.getElementById("city-post-input");
  let movie = movieInput.value.trim().replace(/\s+/g, " ");

  if (!userEmail) {
    Swal.fire("Warning", "Please enter your email", "warning");
    return;
  }

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
      Emails: userEmail,
      isPreferredTheatre: isPreferred,
    }),

    success: function (data) {
      const status = data?.status;

      if (status === "no_change") {
        Swal.fire("No change", "Alert already exists.", "info");

      } else if (status === "preference_changed") {
        Swal.fire("Updated", "Preference changed successfully.", "success");
        movieInput.value = "";

      } else if (status === "email_added") {
        Swal.fire("Updated", "Email added for this movie.", "success");
        movieInput.value = "";

      } else if (status === "added") {
        Swal.fire("Success", "Movie alert added!", "success");
        movieInput.value = "";

      } else {
        Swal.fire("Info", data?.message || "Request processed", "info");
      }

      // Clear manual email only after successful change
      if (
        ["added", "email_added", "preference_changed"].includes(status) &&
        !userEmailFromAuth
      ) {
        const emailInputElem = document.getElementById("email-input");
        if (emailInputElem) emailInputElem.value = "";
        userEmail = "";

        const emailContainer = document.getElementById("email-container");
        if (emailContainer) emailContainer.innerHTML = "Welcome 👋";
      }

      console.log("API Response:", data);
    },

    error: function (err) {
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
      console.error("API Error:", err);
    }
  });
}
