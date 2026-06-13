content.style.display="none";

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