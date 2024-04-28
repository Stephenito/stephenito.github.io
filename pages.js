var pageTimeline;

function page0() {

}

function page1() {
    pageTimeline = gsap.timeline();
    pageTimeline.to(".page[num='1']", {display: "block", opacity: 1, duration: 1, ease:"none"})
                .to(".progress", {
                    width: function (index, target, targets) { return "".concat(target.getAttribute("level")).concat("0%"); }, 
                    backgroundColor: function (index, target, targets) { 
                        let level = parseInt(target.getAttribute("level"));
                        let red = 0;
                        let green = 0;
                        
                        if (level <= 3) {
                            red = 139;
                        } else if (level <= 6) {
                            red = 200;
                            green = 200;
                        } else {
                            green = 139;
                        }

                        return "#" + red.toString(16).padStart(2, '0') + green.toString(16).padStart(2, '0') + "00"; 
                    },
                    duration: 1
                });
}

function page2() {
    
}

function page3() {
    
}

function page4() {
    
}

function page5() {
    
}

function page6() {
    
}

function page7() {
    
}

function page8() {
    
}

function page9() {
    
}

const pagesFunctions = [page0, page1, page2, page3, page4, page5, page6, page7, page8, page9];
export {pagesFunctions, pageTimeline}