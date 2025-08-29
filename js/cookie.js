// --- SET COOKIE ---
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
}

// --- GET COOKIE ---
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}

// --- DELETE COOKIE ---
function deleteCookie(name, path = "/") {
  document.cookie =
    name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=" + path + "; SameSite=Lax";
}

// --- UI LOGIC ---
window.addEventListener("load", () => {
  const popup = document.getElementById("cookie-popup");
  const btn = document.getElementById("accept-cookie");
  if (!popup || !btn) return; // safety check

  // Show popup only if not previously accepted
  if (getCookie("cookieConsent") !== "true") {
    popup.classList.remove("hidden");
  }

  btn.addEventListener("click", () => {
    setCookie("cookieConsent", "true", 30); // remember for 30 days
    popup.classList.add("hidden");
  });
});
