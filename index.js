let userEmail = "";

// Bind email input
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email-input");
  const emailContainer = document.getElementById("email-container");

  if (emailInput) {
    emailInput.addEventListener("input", (e) => {
      userEmail = e.target.value.trim().toLowerCase();
      emailContainer.innerHTML = userEmail
        ? `Welcome 👋 <b>${userEmail}</b>`
        : "Welcome 👋";
    });
  }
});

// Submit movie alert
function postAlienEncounter() {
  const movieInput = document.getElementById("city-post-input");
  const movie = movieInput.value.trim();

  if (!movie) {
    Swal.fire("Warning", "Enter movie name", "warning");
    return;
  }

  if (!userEmail) {
    Swal.fire("Warning", "Enter email", "warning");
    return;
  }

  const isPreferred = JSON.parse(
    document.querySelector('input[name="theatreType"]:checked').value
  );

  $.ajax({
    url: "https://YOUR-CATALYST-URL/server/movie_alert/datastore",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      Movie_name: movie,
      Emails: userEmail,
      isPreferredTheatre: isPreferred
    }),

    success: (data) => {
      if (data.status === "exists") {
        Swal.fire("Info", "This email already exists for this movie", "info");
      } else if (data.status === "added") {
        Swal.fire("Success", "Email added for this movie", "success");
        movieInput.value = "";
      } else {
        Swal.fire("Info", data.message || "Done", "info");
      }

      console.log("Response:", data);
    },

    error: (err) => {
      Swal.fire("Error", "Request failed", "error");
      console.error(err);
    }
  });
}
