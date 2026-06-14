const content = document.getElementById("content");
const guestNameElement = document.getElementById("guest-name");
let guestNames = ["Tamu Terhormat"];
let currentGuestIndex = 0;

function parseGuestNames() {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get("guest");
    if (!guest) return ["Tamu Terhormat"];
    const parts = guest.split("|").map(name => name.trim()).filter(Boolean);
    return parts.length ? parts : ["Tamu Terhormat"];
}

function updateGuestNameDisplay() {
    if (!guestNameElement) return;
    guestNameElement.textContent = guestNames[currentGuestIndex];
}

function cycleGuestName() {
    if (guestNames.length <= 1) return;
    currentGuestIndex = (currentGuestIndex + 1) % guestNames.length;
    updateGuestNameDisplay();
}

document.addEventListener("DOMContentLoaded", () => {
    guestNames = parseGuestNames();
    updateGuestNameDisplay();
});

content.style.display = "none";

function openInvitation(){
    document.querySelector(".opening").style.display="none";
    content.style.display="block";
    document.getElementById("music").play();
}

let targetDate =
new Date("December 20, 2026 08:00:00").getTime();

setInterval(()=>{

let now = new Date().getTime();

let distance = targetDate-now;

days.innerHTML =
Math.floor(distance/(1000*60*60*24));

hours.innerHTML =
Math.floor((distance%(1000*60*60*24))/(1000*60*60));

minutes.innerHTML =
Math.floor((distance%(1000*60*60))/(1000*60));

seconds.innerHTML =
Math.floor((distance%(1000*60))/1000);

},1000);