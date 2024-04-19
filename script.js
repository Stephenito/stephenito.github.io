/* Variables */

const star_dim_from = 2;
const star_dim_to = 10;
const gem_dim = star_dim_to;

const num_stars = 200;
const stars_single_animation_lenght = 1;
const stars_total_animation_lenght = 3;
const velocity_from = 40; // px/s
const velocity_to = 200; // px/s
const computation_interval = 0.1; // s

const ell_a = window.innerWidth / 2;
const ell_b = window.innerHeight / 2;
const norm_a = ell_a/Math.sqrt((Math.pow(ell_a,2) + Math.pow(ell_b,2)))
const norm_b = ell_b/Math.sqrt((Math.pow(ell_a,2) + Math.pow(ell_b,2)))

const icon_dim = 40;
const icon_order = [3, 1, 2, 5, 4, 7, 6, 8, 9, 0];

/* Start */

var timeline = gsap.timeline();
var tl_escape = gsap.timeline({paused: true});

var stars = [];
var icons = [];
var clicked_gems = [];
var gem_index = 0;

const container = document.getElementById("container")

let theta = Math.atan(ell_b/ell_a);
let norm1 = Math.sqrt(Math.pow(Math.cos(theta) * ell_a, 2) + Math.pow(Math.sin(theta) * ell_b, 2))
let norm = Math.sqrt(Math.pow(ell_a, 2) + Math.pow(ell_b, 2));
let rho_multiplier = norm/norm1;

timeline.fromTo("body", {backgroundImage: "black"}, {backgroundImage: "radial-gradient(ellipse closest-side, rgb(100,0,50), rgb(0, 0, 20), black)", duration: 3, ease:"sine.inOut"}, "start");
timeline.fromTo("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(100,0,50), rgb(0, 0, 20), black)"}, {backgroundImage: "radial-gradient(ellipse closest-side, rgb(150,0,70), rgb(0, 0, 50), black)", duration: 6, ease:"sine.inOut", repeat:-1, yoyo:true});

var exit = document.getElementById("exit")

tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(50,0,20), rgb(70,0,30), rgb(0,0,20))", duration: 0.8, ease:"none"}, "start");
tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(50,0,20), rgb(70,0,30))", duration: 0.2, ease:"none"});
tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(0,0,20), rgb(50,0,20)", duration: 0.2, ease:"none"});
tl_escape.to("body", {backgroundImage: "radial-gradient(ellipse closest-side, rgb(0,0,20), rgb(0,0,20), rgb(0,0,20)", duration: 0.1, ease:"none"});
tl_escape.to("#container", {display: "none"});
tl_escape.to(exit, {opacity: 0.5, display: "block", duration: 1})

/* Create stars */

var delay = 0;
for (let i=0; i<num_stars + 6; i++) {
    var gem = i % (Math.floor(num_stars/6)) == 0 && i != 0;
    var star = document.createElement("img");
    star.velocity = Math.random() * (velocity_to - velocity_from)/2 + velocity_from;

    if (!gem) {
        star.src = "images/star.svg";
        star.className = "celestial star";
        
        rho = Math.max(Math.random(), Math.random()) * rho_multiplier;
        theta = Math.random() * Math.PI * 2;

        dim = Math.ceil(Math.random() * (star_dim_to - star_dim_from) + star_dim_from);

        positionX = Math.floor(rho * ell_a * Math.cos(theta) + ell_a);
        positionY = Math.floor(rho * ell_b * Math.sin(theta) + ell_b);
        opacity = (Math.pow((positionX - ell_a)/ell_a, 2) + Math.pow((positionY - ell_b)/ell_b, 2)) * Math.random() + 0.5;
    } else {
        star.src = "images/gems/gem".concat(gem_index).concat(".svg");
        star.className = "celestial star gem";
        star.id = "gem".concat(gem_index);
        
        var zoom = gsap.to(star, {
            paused: true,
            scale: 2,
            rotation: 360,
            duration: 1
        });
        var clickOnce = gsap.to(star, {
            paused: true,
            scale: 3,
            ease: "elastic.out(i.75,0.4)",
            duration: 1
        });
        var click = gsap.to(star, {
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
        
        rho = Math.random() * 0.8 + 0.2;
        theta = Math.random() * Math.PI * 2;
        
        dim = gem_dim;
        opacity = 1;

        gem_index++;

        positionX = Math.floor(rho * ell_a * Math.cos(theta) + ell_a);
        positionY = Math.floor(rho * ell_b * Math.sin(theta) + ell_b);
    }

    star.rho = rho;
    star.theta = theta;

    delay += (stars_total_animation_lenght - stars_single_animation_lenght)/num_stars;
    timeline.to(star, {
        opacity: opacity, 
        width: dim, 
        height: dim, 
        top: positionY, 
        left: positionX, 
        duration: stars_single_animation_lenght}, 
        "start+=".concat(delay));

    container.appendChild(star);
    stars[i] = star;
}

/* Set icon values */

icons = document.getElementsByClassName("icon");
for (let x in icons) {
    icons[x].width = icon_dim;
    icons[x].height = icon_dim;
}

/* Animate icons */

timeline.to(".icon:not(.secret)", {opacity: 0.5, visibility: "visible", duration: 2, delay:0.5}, ">start")

var showTitle = gsap.to("#icon_title", {
    paused: true,
    opacity: 1,
    duration: 1
});

icons = []
num_icons = icon_order.length;
for (let i=0; i<num_icons; i++) {
    icon = document.querySelector(".icon[num='".concat(icon_order[i]).concat("']"))

    // rho = Math.max(Math.random(), Math.random()) * 0.3 + 0.4;
    rho = 0.5;
    theta = Math.PI * 2 * i/num_icons;

    icon.rho = rho
    icon.theta = theta

    positionX = Math.floor(rho * ell_a * Math.cos(theta) + ell_a);
    positionY = Math.floor(rho * ell_b * Math.sin(theta) + ell_b);

    velocity = (velocity_to - velocity_from);

    icon.style.top = "".concat(positionY).concat("px");
    icon.style.left = "".concat(positionX).concat("px");

    icon.velocity = velocity;

    var zoom = gsap.to(icon, {
        paused: true,
        scale: 1.5,
        opacity: 1,
        duration: 0.5
    });
    var click = gsap.to(icon, {
        paused: true,
        scale: 2.5,
        ease: "back.out(4)",
        duration: 0.5
    });
    icon.anim = {};
    icon.anim.zoom = zoom;
    // icon.anim.click = click;
    icon.anim.showTitle = showTitle;
    icon.addEventListener("click", iconEvent);
    icon.addEventListener("mouseenter", iconEvent);
    icon.addEventListener("mouseleave", iconEvent);

    icons.push(icon);
}

num_settings = 1
for (let i=0; i<num_settings; i++) {
    icon = document.querySelector(".setting");

    rho = 0.75;
    theta = Math.PI * 2 * i/num_settings;

    icon.rho = rho
    icon.theta = theta

    positionX = Math.floor(rho * ell_a * Math.cos(theta) + ell_a);
    positionY = Math.floor(rho * ell_b * Math.sin(theta) + ell_b);

    velocity = (velocity_to - velocity_from);

    icon.style.top = "".concat(positionY).concat("px");
    icon.style.left = "".concat(positionX).concat("px");

    icon.velocity = velocity;

    var zoom = gsap.to(icon, {
        paused: true,
        scale: 1.5,
        opacity: 1,
        duration: 0.5
    });
    icon.anim = {};
    icon.anim.zoom = zoom;
    icon.anim.showTitle = showTitle;
    icon.addEventListener("click", settingEvent);
    icon.addEventListener("mouseenter", iconEvent);
    icon.addEventListener("mouseleave", iconEvent);

    icon.clicked = false;
    icons.push(icon);
}

/* Move objects */

var moving = stars.concat(icons)

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

var stopAnimation = false;
function moveEllipse() {
    if (stopAnimation) {
        setTimeout(moveEllipse, computation_interval * 1000);
        return;
    }
        
    for (let x in moving) {
        let star = moving[x]

        star.theta = star.theta + (star.velocity/10)/180*Math.PI * computation_interval 
        let new_x = ell_a * (1 + Math.cos(star.theta) * star.rho)
        let new_y = ell_b * (1 + Math.sin(star.theta) * star.rho)
        gsap.to(star, {top: new_y, left: new_x, duration: computation_interval, ease:"none"});
    }
    setTimeout(moveEllipse, computation_interval * 1000);
}
setTimeout(moveEllipse, stars_total_animation_lenght * 1000 + 100);

/* Stars event */

function gemEvent(event) {
    let gem = event.srcElement;
    
    if (event.type == "click") {
        if (!gem.clicked) {
            gem.clicked = true;
            gem.anim.clickOnce.play();
            gem.anim.click.play();

            clicked_gems.push(gem.id);
            
            if (clicked_gems.length == 6) {
                if (clicked_gems[0] == "gem0" && clicked_gems[1] == "gem1" && clicked_gems[2] == "gem2" && clicked_gems[3] == "gem3" && clicked_gems[4] == "gem4" && clicked_gems[5] == "gem5") {
                    gsap.to(".secret", {opacity: 0.5, visibility: "visible", duration: 2, delay:0.5})
                }

                clicked_gems = [];
                gem.clicked = false;
                gem.anim.click.pause();
                gem.anim.clickOnce.reverse();
                gem.anim.zoom.play();
                gem.anim.zoom.reverse();

                gems = document.getElementsByClassName("gem");
                for (let i in gems) {
                    if (gems[i].clicked)
                        gems[i].click();
                }
            }
        } else {
            clicked_gems = [];
            gem.clicked = false;
            gem.anim.click.pause();
            gem.anim.clickOnce.reverse();
            gem.anim.zoom.play();
            gem.anim.zoom.reverse();
            
            gems = document.getElementsByClassName("gem");
            for (let i in gems) {
                if (gems[i].clicked)
                    gems[i].click();
            }
        }
    } else if (event.type == "mouseenter") {
        if (!gem.clicked) {
            gem.anim.zoom.play();
        }
    } else if (event.type == "mouseleave") {
        if (!gem.clicked) {
            gem.anim.zoom.reverse();
        }
    }
}

/* Icons event */

var tl_escapestars;

function iconEvent(event) {
    let icon = event.srcElement;

    if (event.type == "click" && !stopAnimation) {
        stopAnimation = true;

        // icon.anim.click.play();
        icon.anim.showTitle.reverse();
        
        timeline.pause()
        tl_escape.timeScale(1).play()
        tl_escapestars = gsap.timeline()
        for (let x in moving) {
            let star = moving[x]
    
            let new_x = ell_a * (1 + Math.cos(star.theta) * (star.rho * 3))
            let new_y = ell_b * (1 + Math.sin(star.theta) * (star.rho * 3))
            
            tl_escapestars.to(star, {top: new_y, left: new_x, duration: 2, opacity: 0, scale:5, ease:"expo.inOut"}, "<+=0.002");
        }
    }
    else if (event.type == "mouseenter") {
        icon.anim.zoom.play();

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

    if (icon.id == "setting0") {
        if (!icon.clicked) {
            for (let x in stars)
                stars[x].rho = Math.random()/5 -0.1 + 0.5
        } else {
            for (let x in stars)
                if (stars[x].className.includes("gem")) { stars[x].rho = Math.random()*0.8 + 0.2 } else { stars[x].rho = Math.max(Math.random(), Math.random()) * rho_multiplier; }
        }
            
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
        tl_escapestars.reverse().then(() => {timeline.resume(); stopAnimation = false; });
        tl_escape.timeScale(2).reverse()
    }
    else if (event.type == "mouseenter") {
        exit.anim.zoom.play();
    } else if (event.type == "mouseleave") {
        exit.anim.zoom.reverse();
    }
}