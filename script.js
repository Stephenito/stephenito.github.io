/* Constants */

const star_dim_from = 2;
const star_dim_to = 10;
const gem_dim = star_dim_to;

const num_stars = 100;
const stars_single_animation_lenght = 1;
const stars_total_animation_lenght = 3;
const velocity_from = 2; 
const velocity_to = 12; 
const computation_interval = 0.2; // s

const ell_a = window.innerWidth / 2;
const ell_b = window.innerHeight / 2;
const norm_a = ell_a/Math.sqrt((Math.pow(ell_a,2) + Math.pow(ell_b,2)))
const norm_b = ell_b/Math.sqrt((Math.pow(ell_a,2) + Math.pow(ell_b,2)))

const icon_order = [3, 1, 2, 5, 4, 7, 6, 8, 9, 0];
const settings_order = [0, 1, 2, 3, 4];

/* Audio */

var gem_select = new Audio("audio/gem-select.mp3");
var gem_unselect = new Audio("audio/gem-unselect.mp3");
gem_select.volume = 0.1;
gem_unselect.volume = 0.1;

var universe_sounds = new Audio("audio/universe_sounds.mp3");
var interstellar = new Audio("audio/interstellar.mp3");

var icon_hover = new Audio("audio/icon-hover.mp3");
icon_hover.volume = 0.2;

var c6 = new Audio("audio/c6.mp3");
var d6 = new Audio("audio/d6.mp3");
var e6 = new Audio("audio/e6.mp3");
var f6 = new Audio("audio/f6.mp3");
var g6 = new Audio("audio/g6.mp3");
var a6 = new Audio("audio/a6.mp3");
var b6 = new Audio("audio/b6.mp3");

var song0 = {
    notes: [universe_sounds],
    volumes: [0.2],
    notes_lenght: [1],
    quarter_lenght: 12*60 + 10,
    index: 0,
    play: false
};
universe_sounds.volume = 0.2;

var song1 = {
    notes: [interstellar],
    volumes: [0.2],
    notes_lenght: [1],
    quarter_lenght: 4*60 + 10,
    index: 0,
    play: false
};
universe_sounds.volume = 0.2;

var song2 = {
    notes: [d6, g6, c6, a6, e6, a6, g6, c6],
    volumes: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
    notes_lenght: [1, 1, 1, 1, 1, 1, 1, 1],
    quarter_lenght: 1,
    index: 0,
    play: false
};
for (let i=0; i < song2.notes.length; i++) song2.notes[i].volume = song2.volumes[i];

function playNote(audio) {
    if (audio.paused)
        audio.play();
    else
        audio.currentTime = 0;
}

function playSong(song) {
    if (song.index == song.notes.length) 
        song.index = 0;

    playNote(song.notes[song.index]);
    // setTimeout(playSong, song.notes_lenght[song.index++] * song.quarter_lenght * 1000, song);
}

function pauseSong(song) {
    song.notes[song.index].pause()
}

var song = song0;

/* Start */

var gems_found = false;
var inside_galaxy = false;

const container = document.getElementById("container")
const exit = document.getElementById("exit")

var stars = [];
var gems = [];
var icons = [];
var moving = [];
var clicked_gems = [];

let theta = Math.atan(ell_b/ell_a);
let norm1 = Math.sqrt(Math.pow(Math.cos(theta) * ell_a, 2) + Math.pow(Math.sin(theta) * ell_b, 2))
let norm = Math.sqrt(Math.pow(ell_a, 2) + Math.pow(ell_b, 2));
let rho_multiplier = norm/norm1;

var timeline = gsap.timeline();
var tl_escape = gsap.timeline({paused: true});
var tl_escapestars;

timeline.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(100,0,50), rgb(0, 0, 20), black)", duration: 2, ease:"sine.inOut"}, "start");
timeline.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(150,0,70), rgb(0, 0, 50), black)", duration: 6, ease:"sine.inOut", repeat:-1, yoyo:true});

tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(50,0,20), rgb(70,0,30), rgb(0,0,20))", duration: 0.8, ease:"none"}, "start");
tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(50,0,20), rgb(70,0,30))", duration: 0.2, ease:"none"});
tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(0,0,20), rgb(50,0,20)", duration: 0.2, ease:"none"});
tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(0,0,20), rgb(0,0,20)", duration: 0.1, ease:"none"});
tl_escape.to(container, {display: "none"});
tl_escape.to(exit, {opacity: 0.5, display: "block", duration: 1})

/* Create stars */

function spawnStars(num_stars, animation_length) {
    let delay = (animation_length - stars_single_animation_lenght)/num_stars;

    for (let i=0; i<num_stars; i++) {
        let star = document.createElement("img");
        star.velocity = Math.random() * (velocity_to - velocity_from) + velocity_from;
        star.ready = false;

        star.src = "images/star.svg";
        star.className = "celestial star";
        
        star.rho = Math.max(Math.random(), Math.random()) * rho_multiplier;
        star.theta = Math.random() * Math.PI * 2;
        let dim = Math.ceil(Math.random() * (star_dim_to - star_dim_from) + star_dim_from);
        let positionX = Math.floor(star.rho * ell_a * Math.cos(star.theta) + ell_a);
        let positionY = Math.floor(star.rho * ell_b * Math.sin(star.theta) + ell_b);
        let opacity = (Math.pow((positionX - ell_a)/ell_a, 2) + Math.pow((positionY - ell_b)/ell_b, 2)) * Math.random() + 0.5;

        gsap.to(star, {
            opacity: opacity, 
            width: dim, 
            height: dim, 
            top: positionY, 
            left: positionX, 
            duration: stars_single_animation_lenght}, 
            "<+=".concat(delay))
        .then(result => { result._targets[0].ready = true; });
        
        stars.unshift(star); 
        moving.unshift(star);
        container.appendChild(star);
    }
}

function spawnGems() {
    let delay = (stars_total_animation_lenght - stars_single_animation_lenght)/6;
    let gem_index = 0;

    for (let i=0; i<6; i++) {
        let star = document.createElement("img");
        star.velocity = Math.random() * (velocity_to - velocity_from) + velocity_from;
        star.ready = false;

        star.src = "images/gems/gem".concat(gem_index).concat(".svg");
        star.className = "celestial star gem";
        star.id = "gem".concat(gem_index);
        
        let zoom = gsap.to(star, {
            paused: true,
            scale: 2,
            rotation: 360,
            duration: 1
        });
        let clickOnce = gsap.to(star, {
            paused: true,
            scale: 3,
            ease: "elastic.out(i.75,0.4)",
            duration: 1
        });
        let click = gsap.to(star, {
            paused: true,
            rotation: 720,
            duration: 3,
            ease: 'none',
            repeat: -1
        });
        star.anim = {};
        star.anim.zoom = zoom;
        star.anim.clickOnce = clickOnce;
        star.anim.click = click;
        star.addEventListener("mouseenter", gemEvent);
        star.addEventListener("mouseleave", gemEvent);
        star.addEventListener("click", gemEvent);
        star.clicked = false
        
        star.rho = Math.random() * 0.8 + 0.2;
        star.theta = Math.random() * Math.PI * 2;
        
        let positionX = Math.floor(star.rho * ell_a * Math.cos(star.theta) + ell_a);
        let positionY = Math.floor(star.rho * ell_b * Math.sin(star.theta) + ell_b);

        gem_index++;
        
        gsap.to(star, {
            opacity: 1, 
            width: gem_dim, 
            height: gem_dim, 
            top: positionY, 
            left: positionX, 
            duration: stars_single_animation_lenght}, 
            "<+=".concat(delay))
        .then(result => { result._targets[0].ready = true; });

        gems.push(star); 
        moving.push(star);
        container.appendChild(star);
    }
}

function removeStars(num_stars) {
    let delay = (stars_total_animation_lenght - stars_single_animation_lenght)/num_stars;

    if (num_stars > stars.length)
        num_stars = stars.length;
        
    for (let i=0; i<num_stars; i++) {
        stars[0].ready = false;
        gsap.to(stars[0], {
            opacity: 0, 
            top: "50%", 
            left: "50%",
            scale: 0, 
            duration: stars_single_animation_lenght})
        .then(result => result._targets[0].remove());

        stars.shift(); 
        moving.shift();
    }
}

spawnStars(num_stars, stars_total_animation_lenght);
spawnGems();

/* Add icons */

timeline.to(".icon:not(.secret)", {opacity: 0.5, visibility: "visible", duration: 3}, "<start");

var showTitle = gsap.to("#icon_title", {
    paused: true,
    opacity: 1,
    duration: 1
});

function addIcon(icon, rho, theta, clickEvent) {
    icon.ready = true;

    // icon.rho = Math.max(Math.random(), Math.random()) * 0.3 + 0.4;
    icon.rho = rho;
    icon.theta = theta;
    icon.velocity = (velocity_to - velocity_from);

    positionX = Math.floor(icon.rho * ell_a * Math.cos(icon.theta) + ell_a);
    positionY = Math.floor(icon.rho * ell_b * Math.sin(icon.theta) + ell_b);

    icon.style.top = "".concat(positionY).concat("px");
    icon.style.left = "".concat(positionX).concat("px");

    var zoom = gsap.to(icon, {
        paused: true,
        scale: 1.5,
        opacity: 1,
        duration: 0.5
    });
    var click = gsap.to(icon, {
        paused: true,
        scale: 2,
        duration: 0.2
    });
    icon.anim = {};
    icon.anim.zoom = zoom;
    icon.anim.click = click;
    icon.anim.showTitle = showTitle;
    icon.addEventListener("click", clickEvent);
    icon.addEventListener("mouseenter", iconEvent);
    icon.addEventListener("mouseleave", iconEvent);

    icons.push(icon);
    moving.push(icon);
}

for (let i=0; i<icon_order.length; i++) {
    let icon = document.querySelector(".icon[num='".concat(icon_order[i]).concat("']"))
    addIcon(icon, 0.5, Math.PI * 2 * i/icon_order.length, iconEvent);
}

for (let i=0; i<settings_order.length; i++) {
    let icon = document.querySelector("#setting".concat(i));
    addIcon(icon, 0.75, Math.PI * 2 * i/settings_order.length, settingEvent);
}

/* Move objects */

// function movePseudoEllipse() {
//     for (let x in moving) {
//         let star = moving[x]
//         let top = Number(star.style.top.replace('px',''))
//         let left = Number(star.style.left.replace('px',''))

//         let theta = Math.atan((top - ell_b)/(left - ell_a));
//         if (left < ell_a)
//             theta += Math.PI;
//         let new_x = -Math.sin(theta) * star.rho * norm_a * star.velocity * computation_interval + left
//         let new_y = Math.cos(theta) * star.rho * norm_b * star.velocity * computation_interval + top
        
//         gsap.to(star, {top: new_y, left: new_x, duration: computation_interval, ease:"none"});
//     }
//     setTimeout(movePseudoEllipse, computation_interval * 1000);
// }

function moveEllipse() {
    if (inside_galaxy) {
        setTimeout(moveEllipse, computation_interval * 1000);
        return;
    }
        
    for (let x in moving) {
        let star = moving[x]

        if (!star.ready) {
            console.log();
            continue;
        }

        star.theta = star.theta + (star.velocity)/180*Math.PI * computation_interval 
        let new_x = ell_a * (1 + Math.cos(star.theta) * star.rho)
        let new_y = ell_b * (1 + Math.sin(star.theta) * star.rho)
        gsap.to(star, {top: new_y, left: new_x, duration: computation_interval, ease:"none"});
    }
    setTimeout(moveEllipse, computation_interval * 1000);
}
// setTimeout(moveEllipse, stars_total_animation_lenght * 1000 + 100);
moveEllipse();

/* Stars event */

function clearGems() {
    clicked_gems = [];
    for (let i in gems) {
        gems[i].clicked = false;
        gems[i].anim.click.pause();
        gems[i].anim.clickOnce.reverse();
        gems[i].anim.zoom.play();
        gems[i].anim.zoom.reverse();
    }
}

function gemEvent(event) {
    let gem = event.srcElement;
    
    if (event.type == "click") {
        if (!gem.clicked) {
            gem.clicked = true;
            gem.anim.clickOnce.play();
            gem.anim.click.play();

            clicked_gems.push(gem.id);
            
            if (clicked_gems.length == 6) {
                if (clicked_gems[0] == "gem0" && clicked_gems[1] == "gem1" && clicked_gems[2] == "gem2" && clicked_gems[3] == "gem3" && clicked_gems[4] == "gem4" && clicked_gems[5] == "gem5" && !gems_found) {
                    gems_found = true;

                    pauseSong(song);
                    song = song1;
                    playSong(song);
                    
                    gsap.to(".secret", {opacity: 0.5, visibility: "visible", duration: 2, delay:0.5});
                } else {
                    playNote(gem_unselect);
                }
                clearGems();
            } else {
                playNote(gem_select);
            }
        } else {
            playNote(gem_unselect);
            clearGems();
        }
    } else if (event.type == "mouseenter") {
        if (!gem.clicked)
            gem.anim.zoom.play();
    } else if (event.type == "mouseleave") {
        if (!gem.clicked)
            gem.anim.zoom.reverse();
    }
        
}

/* Icons event */

function iconEvent(event) {
    let icon = event.srcElement;

    if (event.type == "click" && !inside_galaxy) {
        inside_galaxy = true;

        icon.anim.click.play().then(() => { icon.anim.click.reverse(); }).then(() => {icon.anim.showTitle.reverse(); icon.anim.zoom.reverse(); });
        
        timeline.pause()
        tl_escape.timeScale(1).play()
        tl_escapestars = gsap.timeline()
        for (let x in moving) {
            let star = moving[x]
            let new_x = ell_a * (1 + Math.cos(star.theta) * (star.rho * 3))
            let new_y = ell_b * (1 + Math.sin(star.theta) * (star.rho * 3))
            tl_escapestars.to(star, {top: new_y, left: new_x, duration: 1, opacity: 0, scale:5, ease:"expo.inOut"}, "<+=0.005");
        }
    }
    else if (event.type == "mouseenter") {
        icon.anim.zoom.play();
        playNote(icon_hover);

        if (icon.className.includes("secret"))
            document.getElementById("icon_title").style.color = "rgb(218, 165, 32, 1)";
        else
            document.getElementById("icon_title").style.color = "rgb(255, 255, 255, 0.5)";
        document.getElementById("icon_title").innerText = icon.attributes.name.value;

        icon.anim.showTitle.play();
    } else if (event.type == "mouseleave") {
        icon.anim.zoom.reverse();
        icon.anim.showTitle.reverse();
    }
}

function settingEvent(event) {
    let icon = event.srcElement;

    icon.anim.click.play().then(() => { icon.anim.click.reverse(); });

    if (icon.id == "setting0") {
        items = stars.concat(gems);
        if (!icon.clicked) {
            for (let x in items)
                items[x].rho = Math.random()/5 -0.1 + 0.5
        } else {
            for (let x in items)
                if (items[x].className.includes("gem")) { items[x].rho = Math.random()*0.8 + 0.2 } else { items[x].rho = Math.max(Math.random(), Math.random()) * rho_multiplier; }
        }
    }
    if (icon.id == "setting1") {
        spawnStars(20, stars_total_animation_lenght/2);
    }
    if (icon.id == "setting2") {
        removeStars(20);
    }
    if (icon.id == "setting3") {
        let anim = gsap.to(".gem", {paused: true, scale: 3, duration: 0.5, ease: "circ.out"});
        anim.play().then(() => anim.reverse() );
    }
    if (icon.id == "setting4") {
        if (!icon.clicked)
            playSong(song);
        else
            pauseSong(song);
    }

    icon.clicked = !icon.clicked;
}

/* Exit */
var zoom = gsap.to(exit, {
    paused: true,
    scale: 1.5,
    opacity: 1,
    duration: 0.5
});
exit.anim = {};
exit.anim.zoom = zoom;
exit.addEventListener("click", exitEvent);
exit.addEventListener("mouseenter", exitEvent);
exit.addEventListener("mouseleave", exitEvent);

function exitEvent(event) {
    let exit = event.srcElement;

    if (event.type == "click") {
        tl_escapestars.reverse().then(() => {timeline.resume(); inside_galaxy = false; });
        tl_escape.timeScale(2).reverse()
    }
    else if (event.type == "mouseenter") {
        playNote(icon_hover);
        exit.anim.zoom.play();
    } else if (event.type == "mouseleave") {
        exit.anim.zoom.reverse();
    }
}