
var pageTimeline;
var subpageTimeline;

function getRGBfromProgress(level, out_string) {
    let red = 0; let green = 0; let blue = 0;

    if (level <= 3) {
        if (out_string) return 'red';

        red = 139;
    } else if (level <= 6) {
        if (out_string) return 'yellow';

        red = 200;
        green = 200;
    } else {
        if (out_string) return 'green';

        green = 139;
    }

    return "#" + red.toString(16).padStart(2, '0') + green.toString(16).padStart(2, '0') + blue.toString(16).padStart(2, '0'); 
}

function showPage(num) {
    pageTimeline = gsap.timeline();

    pageTimeline.to(".page[num='" + num.toString() + "']", {display: "block", opacity: 1, duration: 1, ease:"none"})

                .to(".progress", {
                    width: function (index, target, targets) { return "".concat(target.getAttribute("level"), "0%"); }, 
                    backgroundColor: function (index, target, targets) { return getRGBfromProgress(parseInt(target.getAttribute("level")), false); },
                    duration: 1
                })
}

function initPages() {
    let bars = document.getElementsByClassName("bar");
    for (let bar of bars) {
        tippy(bar, {
            theme: 'tippy-' + getRGBfromProgress(parseInt(bar.children[0].getAttribute("level")), true),
            arrow: false,
            animation: 'shift-away',
            allowHTML: true
        });
    }

    let subpages_buttons = document.getElementsByClassName("page-to-btn");
    for (let btn of subpages_buttons) {
        let zoom = gsap.to(btn, {
            paused: true,
            scale: 1.5,
            opacity: 1,
            duration: 0.5
        });
        btn.addEventListener("mouseenter", () => zoom.play());
        btn.addEventListener("mouseleave", () => zoom.reverse());
        btn.addEventListener("click", (e) => toSubpage(e.target.getAttribute("num")));
    }
    
    let subpages_back_buttons = document.getElementById("subpage_reverse");
    let zoom = gsap.to(subpages_back_buttons, {
        paused: true,
        scale: 1.5,
        opacity: 1,
        duration: 0.5
    });
    subpages_back_buttons.addEventListener("mouseenter", () => zoom.play());
    subpages_back_buttons.addEventListener("mouseleave", () => zoom.reverse());
    subpages_back_buttons.addEventListener("click", () => subpageTimeline.reverse());
}

function toSubpage(to) {
    subpageTimeline = gsap.timeline();
    subpageTimeline.to(".page[num='" + to[0] + "'], #exit_container", {
        x: "-100%",
        ease: "power2.in",
        duration: 1
    });
    subpageTimeline.to(".page[num='" + to[0] + "'], #exit_container", {
        opacity: 0,
        display: "none",
        duration: 0
    });
    subpageTimeline.to(".page[num='" + to + "']", {
        opacity: 1,
        display: "block",
        duration: 0
    }, "<");
    subpageTimeline.to("#subpage_reverse", {
        opacity: 0.5,
        display: "block",
        duration: 0
    }, "<");
    subpageTimeline.fromTo(".page[num='" + to + "'], #subpage_reverse_container", {
        x: "100%",
        ease: "power2.out",
        duration: 1
    }, {
        x: "0%"
    });
}

function page0() {
    showPage(0);
}

function page1() {
    showPage(1);
}

function page2() {
    showPage(2);
}

function page3() {
    showPage(3);
}

function page4() {
    showPage(4);
}

function page5() {
    showPage(5);
}

function page6() {
    showPage(6);
}

function page7() {
    showPage(7);
}

function page8() {
    showPage(8);
}

function page9() {
    showPage(9);
}

initPages();
const pagesFunctions = [page0, page1, page2, page3, page4, page5, page6, page7, page8, page9];
export {pagesFunctions, pageTimeline}