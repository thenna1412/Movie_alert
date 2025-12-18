let userEmail = "";
let userEmailFromAuth = false;

/*
// Keep #email-input in sync with userEmail and prefer Catalyst auth when available
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("email-input");
  const emailContainer = document.getElementById("email-container");

  // Try to get authenticated user email first (non-blocking)
  if (typeof catalyst !== "undefined" && catalyst.auth && catalyst.auth.isUserAuthenticated) {
    catalyst.auth
      .isUserAuthenticated()
      .then((result) => {
        userEmail = result.content?.email_id || "";
        if (userEmail) {
          userEmailFromAuth = true;
          if (emailInput) emailInput.value = userEmail;
          if (emailContainer) emailContainer.innerHTML = `Welcome 👋 <b>${userEmail}</b>`;
        }

        // Still bind manual input so user can change if desired (this will mark userEmailFromAuth=false)
        if (emailInput) {
          emailInput.addEventListener("input", function (e) {
            userEmail = e.target.value.trim();
            userEmailFromAuth = false;
            if (emailContainer) {
              emailContainer.innerHTML = userEmail ? `Welcome 👋 <b>${userEmail}</b>` : `Welcome 👋`;
            }
          });
        }
      })
      .catch((err) => {
        // No authenticated user — bind manual input
        console.warn("isUserAuthenticated failed (public mode):", err);
        if (emailInput) {
          emailInput.addEventListener("input", function (e) {
            userEmail = e.target.value.trim();
            userEmailFromAuth = false;
            if (emailContainer) {
              emailContainer.innerHTML = userEmail ? `Welcome 👋 <b>${userEmail}</b>` : `Welcome 👋`;
            }
          });
        }
      });
  } else {
    // Catalyst not available — bind manual input
    if (emailInput) {
      emailInput.addEventListener("input", function (e) {
        userEmail = e.target.value.trim();
        userEmailFromAuth = false;
        if (emailContainer) {
          emailContainer.innerHTML = userEmail ? `Welcome 👋 <b>${userEmail}</b>` : `Welcome 👋`;
        }
      });
    }
    console.warn("Catalyst SDK not available; running in public mode.");
  }
});
*/

// Simple manual binding only — authentication-related code commented out
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("email-input");
  const emailContainer = document.getElementById("email-container");

  if (emailInput) {
    emailInput.addEventListener("input", function (e) {
      userEmail = e.target.value.trim();
      userEmailFromAuth = false; // we are in manual mode
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
      // Handle backend responses with clear user feedback
      // Expected backend status values (handled here):
      // - "no_change" or "exists": same movie + same email + same preference → do not update
      // - "preference_changed": same movie + same email but preference updated → updated
      // - "email_added": same movie but different email was added → stored new email
      // - "added": completely new movie row created

      const status = data && data.status ? data.status : null;

      if (status === "no_change" || status === "exists") {
        Swal.fire("No change", "Alert already exists for this movie and email.", "info");
        // keep inputs so user can modify if needed
      } else if (status === "preference_changed") {
        Swal.fire("Updated", "Preference changed for this alert.", "success");
        // clear only the movie input
        if (movieInput) movieInput.value = "";
      } else if (status === "email_added") {
        Swal.fire("Updated", "Your email was added for this movie alert.", "success");
        if (movieInput) movieInput.value = "";
      } else if (status === "added") {
        Swal.fire("Success", "Movie added!", "success");
        if (movieInput) movieInput.value = "";
      } else {
        // fallback: show backend message or generic info
        Swal.fire("Info", data && data.message ? data.message : "Request processed", "info");
      }

      // Optionally clear the typed email only when a new record was created or updated
      if (status === "added" || status === "email_added" || status === "preference_changed") {
        const emailInputElem = document.getElementById("email-input");
        if (emailInputElem && !userEmailFromAuth) {
          // if userEmail came from manual input (not auth), clear it
          emailInputElem.value = "";
          // also clear bound variable
          userEmail = "";
          const emailContainer = document.getElementById("email-container");
          if (emailContainer) emailContainer.innerHTML = `Welcome 👋`;
        }
      }

      console.log("API Response:", data);
    },

    error: function (err) {
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
      console.error("API Error:", err);
    }
  });
}
