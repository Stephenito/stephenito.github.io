gsap.registerPlugin(PixiPlugin);
gsap.registerPlugin(ScrollToPlugin);

import {pagesFunctions, pageTimeline} from "./pages.js"

window.onresize = function(){ location.reload(); }

/* Constants */

const star_dim_from = 2;
const star_dim_to = 10;
const gem_dim = (window.innerHeight + window.innerWidth)/250;
const icon_dim = (window.innerHeight + window.innerWidth)/50;

const num_stars = 300;
const stars_single_animation_lenght = 1;
const stars_total_animation_lenght = 3;
const velocity_from = 2; 
const velocity_to = 8;
const icon_velocity = 3;
const velocity_from_r = velocity_from * Math.PI / 180; 
const velocity_to_r = velocity_to * Math.PI / 180; 
const computation_interval = 0.2; // s
const opacity_interval = 1;

var ell_a = window.innerWidth / 2;
var ell_b = window.innerHeight / 2;
const ell_min = Math.min(ell_a, ell_b);
const norm_a = ell_a/Math.sqrt((Math.pow(ell_a,2) + Math.pow(ell_b,2)))
const norm_b = ell_b/Math.sqrt((Math.pow(ell_a,2) + Math.pow(ell_b,2)))

const icon_order = [3, 1, 2, 5, 4, 7, 6, 8, 9, 0];
const settings_order = [0, 1, 2, 3, 4, 5, 6, 7];

const languages = ["en", "it"];
const languages_src = ["images/icons/flag-us.svg", "images/icons/flag-it.svg"];

/* Translations */

const help_tips_en = [
    "Help",
    "You can change language",
    "For faster browsing, you can disable animations",
    "Icons on the inner orbit are personal pages",
    "Icons on the outer orbit are... not personal pages",
    "Check them out! Press all the buttons you can!",
    "Make sure to explore the fractal!",
    "Why are there stars of different colour?",
    "Have you seen Marvel's films?",
    "The order is important!"
];
const help_tips_it = [
    "Aiuto",
    "E' possibile cambiare lingua",
    "Per una navigazione più veloce, è possibile disattivare le animazioni",
    "Le icone sull'orbita interna sono pagine personali",
    "Le icone sull'orbita esterna... non sono pagine",
    "Scoprile! Premi tutti le icone!",
    "Ricordati di guardare il frattale prima di uscire",
    "Perché ci sono stelle di colore diverso?",
    "Hai visto i film Marvel?",
    "L'ordine è importante!"
];
const desc_icons = {
    "icon0": ["Awards", "Premi"],
    "icon1": ["Coding & Tools", "Programmazione"],
    "icon2": ["Education", "Istruzione"],
    "icon3": ["Sport", "Sport"],
    "icon4": ["Languages", "Lingue"],
    "icon5": ["Music", "Musica"],
    "icon6": ["Philosophy", "Filosofia"],
    "icon7": ["Projects", "Progetti"],
    "icon8": ["Skills & Knowledge", "Abilità e conoscenze"],
    "icon9": ["Work experience", "Esperienza lavorativa"],
    "setting0": ["Draw fractal", "Disegna frattale"],
    "setting1": ["Spawn stars", "Crea stelle"],
    "setting2": ["Remove stars", "Rimuovi stelle"],
    "setting3": ["Show gems", "Rivela gemme"],
    "setting4": ["Play/pause music", "Accendi/spegni musica"],
    "setting5": ["Help", "Aiuto"],
    "setting6": ["English", "Italiano"],
    "setting7": ["Disable/Enable animations", "Disattiva/Abilita animazioni"]
};

const fractalCanvas = document.getElementById("fractal_canvas");
fractalCanvas.width = window.innerWidth;
fractalCanvas.height = window.innerHeight;
const ctx = fractalCanvas.getContext("2d");
var imageData = ctx.createImageData(window.innerWidth, window.innerHeight);
// ctx.imageSmoothingEnabled = false;

/* Adjust CSS */

const root = document.querySelector(":root");
root.style.setProperty("--icon-dim", icon_dim.toString() + "px");
root.style.setProperty("--gem-dim", gem_dim.toString() + "px");

/* PixiJS */

const app = new PIXI.Application();

await app.init({
    canvas: document.getElementById("star_canvas"),
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0
});

const texture_star = await PIXI.Assets.load('images/star.svg');

/* Audio */

var gem_select = new Audio("audio/gem-select.mp3");
var gem_unselect = new Audio("audio/gem-unselect.mp3");
gem_select.volume = 0.1;
gem_unselect.volume = 0.1;

var universe_sounds = new Audio("audio/universe_sounds.mp3");
var interstellar = new Audio("audio/interstellar.mp3");

var icon_click = new Audio("audio/icon-hover.mp3");
icon_click.volume = 0.2;

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
interstellar.volume = 0.6;

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

/* Functions */

function spawnStars(num_stars, animation_length) {
    let delay = (animation_length - stars_single_animation_lenght)/num_stars;

    for (let i=0; i<num_stars; i++) {
        // let star = document.createElement("img");
        // star.velocity = Math.random() * (velocity_to - velocity_from) + velocity_from;
        
        // star.src = "images/star.svg";
        // star.className = "celestial star";
        
        // star.rho = Math.max(Math.random(), Math.random()) * rho_multiplier;
        // star.theta = Math.random() * Math.PI * 2;
        // let dim = Math.ceil(Math.random() * (star_dim_to - star_dim_from) + star_dim_from);
        // let x = Math.floor(star.rho * ell_a * Math.cos(star.theta));
        // let y = Math.floor(star.rho * ell_b * Math.sin(star.theta));
        // let opacity = (Math.pow((x)/ell_a, 2) + Math.pow((y)/ell_b, 2) + 0.5) * Math.max(Math.random(), Math.random()) + 0.2;
        let opacity = 0.5;

        // moving.unshift(star);
        // container.appendChild(star);

        let star = new PIXI.Sprite(texture_star);

        star.velocity = Math.random() * (velocity_to_r - velocity_from_r) + velocity_from_r;
        star.rho = Math.max(Math.random(), Math.random()) * rho_multiplier;
        star.theta = Math.random() * Math.PI * 2;
        let dim = Math.ceil(Math.random() * (star_dim_to - star_dim_from) + star_dim_from);
        star.width = dim;
        star.height = dim;
        star.ready = false;

        app.stage.addChild(star);

        app.ticker.add(() => {
            if (star.ready && !inside_galaxy) {
                star.theta = star.theta + (star.velocity)/180*Math.PI;
                star.x = ell_a + ell_a * Math.cos(star.theta) * star.rho;
                star.y = ell_b + ell_b * Math.sin(star.theta) * star.rho;
            }
        });

        let x = ell_a + Math.floor(star.rho * ell_a * Math.cos(star.theta));
        let y = ell_b + Math.floor(star.rho * ell_b * Math.sin(star.theta));

        gsap.fromTo(star, { pixi: {alpha: 0, x: ell_a, y: ell_b} }, {
            pixi: {alpha: opacity, 
            width: dim, 
            height: dim, 
            y: y, 
            x: x}, 
            duration: stars_single_animation_lenght}, 
            "<+=".concat(delay))
        .then(result => { result._targets[0].ready = true; });

        stars.unshift(star); 
    }
}

function spawnGems() {
    let delay = (stars_total_animation_lenght - stars_single_animation_lenght)/6;
    let gem_index = 0;

    for (let i=0; i<6; i++) {
        let star = document.createElement("img");
        star.velocity = Math.random() * (velocity_to - velocity_from) + velocity_from;
        star.setAttribute("ready", false);

        star.src = "images/gems/gem".concat(gem_index).concat(".svg");
        star.className = "celestial star gem";
        star.id = "gem".concat(gem_index);
        
        let zoom = gsap.to(star, {
            paused: true,
            scale: 2,
            rotation: 360,
            duration: 1
        });
        let zoom_rev = gsap.to(star, {
            paused: true,
            scale: 1,
            rotation: 0,
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
        star.anim.zoom_rev = zoom_rev;
        star.anim.clickOnce = clickOnce;
        star.anim.click = click;
        star.addEventListener("mouseenter", gemEvent);
        star.addEventListener("mouseleave", gemEvent);
        star.addEventListener("click", gemEvent);
        star.clicked = false
        
        star.rho = Math.random() * 0.8 + 0.2;
        star.theta = Math.random() * Math.PI * 2;
        
        let x = Math.floor(star.rho * ell_a * Math.cos(star.theta));
        let y = Math.floor(star.rho * ell_b * Math.sin(star.theta));

        gem_index++;
        
        gsap.to(star, {
            opacity: 1, 
            width: gem_dim, 
            height: gem_dim, 
            y: y, 
            x: x, 
            duration: stars_single_animation_lenght}, 
            "<+=".concat(delay))
        .then(result => { result._targets[0].setAttribute("ready", true); });

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
        gsap.to(stars[0], { pixi: {
            alpha: 0, 
            y: ell_b, 
            x: ell_a,
            scale: 0}, 
            duration: stars_single_animation_lenght}, 
            "<+=".concat(delay));

        stars.shift(); 
        // moving.shift();
    }
}

function addIcon(icon, rho, theta, clickEvent) {
    icon.setAttribute("ready", true);

    // icon.rho = Math.max(Math.random(), Math.random()) * 0.3 + 0.4;
    icon.rho = rho;
    icon.theta = theta;
    icon.velocity = icon_velocity;

    let x = Math.floor(icon.rho * ell_a * Math.cos(icon.theta));
    let y = Math.floor(icon.rho * ell_b * Math.sin(icon.theta));

    // x = Math.floor(icon.rho * ell_min * Math.cos(icon.theta));
    // y = Math.floor(icon.rho * ell_min * Math.sin(icon.theta));

    icon.style.y = "".concat(y).concat("px");
    icon.style.x = "".concat(x).concat("px");

    var zoom = gsap.to(icon, {
        paused: true,
        scale: 1.5,
        opacity: 1,
        duration: 0.5
    });
    var zoom_rev = gsap.to(icon, {
        paused: true,
        scale: 1,
        opacity: 0.5,
        duration: 0.5
    });
    icon.anim = {};
    icon.anim.zoom = zoom;
    icon.anim.zoom_rev = zoom_rev;
    icon.anim.showTitle = showTitle;
    icon.addEventListener("click", clickEvent);
    icon.addEventListener("mouseenter", iconEvent);
    icon.addEventListener("mouseleave", iconEvent);

    icons.push(icon);
    moving.push(icon);
}

/* Move objects */

function moveEllipse() {
    if (inside_galaxy) {
        setTimeout(moveEllipse, computation_interval * 1000);
        return;
    }
        
    for (let i in moving) {
        let star = moving[i]

        if (star.getAttribute("ready") == "false")
            continue;
            
        star.theta = star.theta + (star.velocity)/180*Math.PI * computation_interval 
        star.next_X = ell_a * Math.cos(star.theta) * star.rho
        star.next_Y = ell_b * Math.sin(star.theta) * star.rho
        if (star.className.includes("icon")) {
            star.next_X -= icon_dim/2;
            star.next_Y -= icon_dim/2;
        }
    }

    gsap.to(".celestial[ready=true]", {
        y: function (index, target, targets) { return target.next_Y; }, 
        x: function (index, target, targets) { return target.next_X; },  
        duration: computation_interval, 
        ease:"none"});

    setTimeout(moveEllipse, computation_interval * 1000);
}

// function moveCircle() {
//     if (inside_galaxy) {
//         setTimeout(moveCircle, computation_interval * 1000);
//         return;
//     }
        
//     for (let i in icons) {
//         let star = icons[i]

//         if (star.getAttribute("ready") == "false")
//             continue;
            
//         star.theta = star.theta + (star.velocity)/180*Math.PI * computation_interval 
//         star.next_X = ell_min * Math.cos(star.theta) * star.rho
//         star.next_Y = ell_min * Math.sin(star.theta) * star.rho
//     }

//     gsap.to(".icon[ready=true]", {
//         y: function (index, target, targets) { return target.next_Y; }, 
//         x: function (index, target, targets) { return target.next_X; },  
//         duration: computation_interval, 
//         ease:"none"});

//     setTimeout(moveCircle, computation_interval * 1000);
// }
// moveCircle();

function changeOpacity() {
    if (inside_galaxy) {
        setTimeout(changeOpacity, opacity_interval * 1000);
        return;
    }
        
    for (let i in stars) {
        if (stars[i].ready)
            gsap.to(stars[i], { pixi: {
                alpha: "random(0.2, 0.7)" },
                duration: opacity_interval, 
                ease:"none"});
    }
    
    setTimeout(changeOpacity, opacity_interval * 1000);
}

/* Events */

function clearGems() {
    clicked_gems = [];
    for (let i in gems) {
        gems[i].clicked = false;
        gems[i].anim.click.pause();
        // gems[i].anim.clickOnce.reverse()
        gems[i].anim.zoom_rev.restart()
    }
}

function gemEvent(event) {
    let gem = event.target;
    
    if (event.type == "click") {
        if (!gem.clicked) {
            gem.clicked = true;
            gem.anim.clickOnce.restart();
            gem.anim.click.restart();

            clicked_gems.push(gem.id);
            
            if (clicked_gems.length == 6) {
                if (clicked_gems[0] == "gem0" && clicked_gems[1] == "gem1" && clicked_gems[2] == "gem2" && clicked_gems[3] == "gem3" && clicked_gems[4] == "gem4" && clicked_gems[5] == "gem5" && !gems_found) {
                    gems_found = true;

                    if (document.getElementById("setting4").clicked) {
                        pauseSong(song);
                        song = song1;
                        playSong(song);
                    } else {
                        song = song1;
                    }
                    
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
            gem.anim.zoom.restart();
    } else if (event.type == "mouseleave") {
        if (!gem.clicked)
            gem.anim.zoom_rev.restart();
    }
        
}

function iconEvent(event) {
    let icon = event.target;

    if (event.type == "click" && !inside_galaxy) {
        inside_galaxy = true;

        playNote(icon_click);

        icon.anim.showTitle.reverse(); 
        if (dis_anim == 1)
            icon.anim.zoom.reverse();
        else {
            icon.anim.zoom.seek(0);
            // icon.anim.zoom_rev.seek(0);
        }
        
        timeline.pause();
        tl_escape = gsap.timeline();
        tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(50,0,20), rgb(70,0,30), rgb(0,0,20))", duration: 1 * dis_anim, ease:"none"}, "start");
        tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(50,0,20), rgb(70,0,30))", duration: 0.3 * dis_anim, ease:"none"});
        tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(0,0,20), rgb(50,0,20)", duration: 0.3 * dis_anim, ease:"none"});
        tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(0,0,20), rgb(0,0,20)", duration: 0.1 * dis_anim, ease:"none"});
        tl_escape.to(container, {display: "none", duration: 0});
        tl_escape.to("#star_canvas", {display: "none", duration: 0});
        tl_escape.to("#exit_container", {display: "block", duration: 0})
        tl_escape.to(exit, {opacity: 0.7, display: "block", duration: 1 * dis_anim})

        tl_escapestars = gsap.timeline();
        for (let x in stars) {
            let star = stars[x]
            let X = ell_a + ell_a * Math.cos(star.theta) * (star.rho * 3)
            let Y = ell_b + ell_b * Math.sin(star.theta) * (star.rho * 3)
            tl_escapestars.to(star, {pixi: { y: Y, x: X, alpha: 0, scale:3}, duration: 1 * dis_anim, ease:"expo.inOut"}, "<+=".concat(1/(stars.length + moving.length) * dis_anim));
        }
        for (let x in moving) {
            let star = moving[x]
            let X = ell_a * Math.cos(star.theta) * (star.rho * 3)
            let Y = ell_b * Math.sin(star.theta) * (star.rho * 3)
            tl_escapestars.to(star, {y: Y, x: X, duration: 1 * dis_anim, opacity: 0, scale:3, ease:"expo.inOut"}, "<+=".concat(1/(stars.length + moving.length) * dis_anim))
                .then(() => { 
                    document.getElementsByTagName("html")[0].style.overflowY = "auto";
                    window.onresize = null;
                    pagesFunctions[icon.getAttribute("num")](); 
                    icon.style.borderColor = "gold";
                });
        }
    }
    else if (event.type == "mouseenter") {
        icon.anim.zoom.restart();

        if (icon.className.includes("secret"))
            document.getElementById("icon_title").style.color = "rgb(218, 165, 32, 1)";
        else
            document.getElementById("icon_title").style.color = "rgb(255, 255, 255, 0.5)";
        document.getElementById("icon_title").innerHTML = icon.attributes.name.value;

        icon.anim.showTitle.restart();
    } else if (event.type == "mouseleave") {
        icon.anim.zoom.reverse();
        icon.anim.showTitle.reverse();
    }
}

function settingEvent(event) {
    let icon = event.target;

    playNote(icon_click);

    if (icon.id == "setting0") {
        ctx.clearRect(0, 0, fractalCanvas.width, fractalCanvas.height);
        fractal_zoom = 1;
        fractal_offx = 0;
        fractal_offy = 0;

        tl_fractal = gsap.timeline()

        timeline.pause();
        tl_fractal.to(".celestial, #star_canvas", {opacity: 0, display: "none", duration: 1}, "start");
        tl_fractal.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(0,0,20), rgb(0,0,20)", duration: 1}, "start");
        tl_fractal.to("#fractal_buttons", {display: "block", opacity: 1, duration: 0.5});

        // mandelbrotGPU(window.innerWidth, window.innerHeight, 1, 0, 0);
        fractal_worker.postMessage([window.innerWidth, window.innerHeight, fractal_maxiterations, fractal_palette, 1, 0, 0]);
    }
    if (icon.id == "setting1") {
        spawnStars(50, stars_total_animation_lenght/2);
    }
    if (icon.id == "setting2") {
        removeStars(50);
    }
    if (icon.id == "setting3") {
        if (!icon.animating) {
            icon.animating = true;
            let anim = gsap.to(".gem", {paused: true, scale: 3, duration: 0.5, ease: "circ.out"});
            anim.restart().then(() => anim.reverse() ).then(() => icon.animating = false);
        }
    }
    if (icon.id == "setting4") {
        if (!icon.clicked) {
            playSong(song);
            icon.style.borderColor = "gold";
        } else {
            pauseSong(song);
            icon.style.borderColor = "grey";
        }
    }
    if (icon.id == "setting5") {
        clearInterval(icon.interval);

        if (typeof icon.n_clicks === "undefined")
            icon.n_clicks = 0;

        let help_tips = (language == "en") ? help_tips_en : help_tips_it;

        icon.n_clicks = (icon.n_clicks + 1) % help_tips.length;

        let text = (icon.n_clicks == 0) ? help_tips[icon.n_clicks] : help_tips[icon.n_clicks] + "<br>" + icon.n_clicks + "/" + (help_tips.length - 1)
        icon.setAttribute("name", text);
        document.getElementById("icon_title").innerHTML = text;

        let tl_help = gsap.timeline();
        if (icon.n_clicks == 1) {
            tl_help.to("#setting6", {scale: 1.5, opacity: 1, duration: 1, ease: "power4.out"})
                .then(() => tl_help.reverse());
        } else if (icon.n_clicks == 2) {
            tl_help.to("#setting7", {scale: 1.5, opacity: 1, duration: 1, ease: "power4.out"})
                .then(() => tl_help.reverse());
        } else if (icon.n_clicks == 3) {
            tl_help.to(".icon:not(.setting)", {scale: 1.5, opacity: 1, duration: 1, ease: "power4.out"})
                .then(() => tl_help.reverse());
        } else if (icon.n_clicks == 4) {
            tl_help.to(".icon.setting", {scale: 1.5, opacity: 1, duration: 1, ease: "power4.out"})
                .then(() => tl_help.reverse());
        } else if (icon.n_clicks == 6) {
            tl_help.to("#setting0", {scale: 1.5, opacity: 1, duration: 1, ease: "power4.out"})
                .then(() => tl_help.reverse());
        }
    }
    if (icon.id == "setting6") {
        let newindex = (languages.indexOf(language) + 1) % languages.length;
        language = languages[newindex];

        icon.setAttribute("src", languages_src[newindex]);
        document.getElementById("icon_title").innerHTML = desc_icons[icon.id][newindex];

        for (let icon_tochange of document.getElementsByClassName("icon"))
            icon_tochange.setAttribute("name", desc_icons[icon_tochange.id][newindex]);

        if (newindex == 0) {
            root.style.setProperty("--lan-it", "none");
            root.style.setProperty("--lan-en", "inline-block");
        } else if (newindex == 1) {
            root.style.setProperty("--lan-it", "inline-block");
            root.style.setProperty("--lan-en", "none");
        }
        document.getElementById("f_s_palette").selectedIndex = newindex;
    }
    if (icon.id == "setting7") {
        if (!icon.clicked) {
            dis_anim = 0;
            root.style.setProperty("--anim-len", "0s");

            icon.style.borderColor = "gold";
        } else {
            dis_anim = 1;
            root.style.setProperty("--anim-len", "2s");

            icon.style.borderColor = "grey";
        }
    }

    icon.clicked = !icon.clicked;
}

function exitEvent(event) {
    let exit = event.target;

    if (event.type == "click") {
        playNote(icon_click);
        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
        
        pageTimeline.timeScale(2).reverse()
            .then(() => { tl_escape.timeScale(2).reverse(); tl_escapestars.reverse()
            .then(() => { 
                timeline.resume(); 
                inside_galaxy = false;
                window.onresize = function(){ location.reload(); };
            }); 
        });
    }
    else if (event.type == "mouseenter") {
        exit.anim.zoom.restart();
    } else if (event.type == "mouseleave") {
        exit.anim.zoom.reverse();
    }
}

/* Start */

var language = "en";

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

var fractal_computing = false;
var fractal_settings_on = false;
var fractal_palette = "yellow";
var fractal_zoom;
var fractal_offx;
var fractal_offy; 
var fractal_maxiterations = document.getElementById("f_s_iterations").getAttribute("value");
// var f_s_iterations_max = document.getElementById("f_s_iterations").getAttribute("max");

/* Fractal initialization */

var fractal_worker = new Worker("fractals.js");

fractal_worker.addEventListener("message", function (e) {
    imageData.data.set(e.data);
    ctx.putImageData(imageData, 0, 0);

    gsap.to("#fractal_canvas", {opacity: 1, display:"block", duration: 0.5});
    fractal_computing = false;
});

document.getElementById("fractal_canvas").addEventListener("click", (event) => {
    if (!fractal_settings_on && !fractal_computing) {
        gsap.to("#fractal_canvas", {opacity: 0.3, duration: 0.5});
        fractal_offx = fractal_offx + (event.clientX - window.innerWidth/2) / fractal_zoom;
        fractal_offy = fractal_offy + (event.clientY - window.innerHeight/2) / fractal_zoom;
        fractal_zoom = fractal_zoom * 4;
        
        // document.getElementById("f_s_iterations").setAttribute("max", f_s_iterations_max * Math.log2(fractal_zoom))

        fractal_computing = true;
        fractal_worker.postMessage([window.innerWidth, window.innerHeight, fractal_maxiterations, fractal_palette, fractal_zoom, fractal_offx, fractal_offy]);
    }
});

document.getElementById("exit_fractal").addEventListener("click", (event) => {
    gsap.to("#fractal_canvas", {opacity: 0, display: "none", duration: 0.5})   
        .then( () => tl_fractal.reverse()
        .then( () => timeline.resume() ));
});

document.getElementById("fractal_settings_btn").addEventListener("click", (event) => {
    if (!event.target.clicked)
        gsap.to("#fractal_settings", {opacity: 1, display: "block", duration: 0.5});
    else
        gsap.to("#fractal_settings", {opacity: 0, display: "none", duration: 0.5});
    
    fractal_settings_on = !fractal_settings_on;
    event.target.clicked = !event.target.clicked;
});

document.getElementById("f_s_iterations").oninput = (e) => { 
    fractal_maxiterations = e.target.value; 
    e.target._tippy.setContent(e.target.value);
};
document.getElementById("f_s_iterations").onclick = (e) => { 
    if (!fractal_computing) {
        gsap.to("#fractal_canvas", {opacity: 0.3, duration: 0.5});

        fractal_computing = true;
        fractal_worker.postMessage([window.innerWidth, window.innerHeight, fractal_maxiterations, fractal_palette, fractal_zoom, fractal_offx, fractal_offy]);
    }
};

document.getElementById("f_s_palette").onchange = (e) => {
    fractal_palette = e.target.value;

    if (!fractal_computing) {
        gsap.to("#fractal_canvas", {opacity: 0.3, duration: 0.5});

        fractal_computing = true;
        fractal_worker.postMessage([window.innerWidth, window.innerHeight, fractal_maxiterations, fractal_palette, fractal_zoom, fractal_offx, fractal_offy]);
    }
}

tippy("#f_s_iterations", {
    theme: 'tippy',
    arrow: false,
    animation: 'shift-away',
    hideOnClick: false,
    allowHTML: true
});

/* Start animation */

var timeline = gsap.timeline();
var tl_escape;
var tl_escapestars;
var tl_fractal;

var dis_anim = 1;

timeline.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(100,0,50), rgb(0, 0, 20), black)", duration: 2, ease:"sine.inOut"}, "start");
timeline.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(150,0,70), rgb(0, 0, 50), black)", duration: 6, ease:"sine.inOut", repeat:-1, yoyo:true});

spawnStars(num_stars, stars_total_animation_lenght);
spawnGems();

var showTitle = gsap.to("#icon_title", {
    paused: true,
    opacity: 1,
    duration: 1
});

for (let i=0; i<icon_order.length; i++) {
    let icon = document.querySelector(".icon[num='".concat(icon_order[i]).concat("']"))
    addIcon(icon, 0.5, Math.PI * 2 * i/icon_order.length, iconEvent);
}

for (let i=0; i<settings_order.length; i++) {
    let icon = document.querySelector("#setting".concat(i));
    addIcon(icon, 0.75, Math.PI * 2 * i/settings_order.length, settingEvent);

    if (icon.id == "setting3")
        icon.animating = false;
    if (icon.id == "setting5")
        icon.interval = setInterval(() => gsap.to(icon, {scale: 1.5, opacity: 1, duration: 0.5, ease: "power2.out"}).then(gsap.to(icon, {delay:0.5, scale: 1, opacity: 0.5, duration: 0.5, ease: "power2.in"})), 5000);
}

moveEllipse();
changeOpacity();

timeline.to(".icon:not(.secret)", {opacity: 0.5, visibility: "visible", duration: 3}, "<start");

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

export {dis_anim};