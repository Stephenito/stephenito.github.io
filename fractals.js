
/* Fractals */

const palette_rainbow = [
    [255, 0, 0],
    [255, 165, 0],
    [255, 255, 0],
    [0, 255, 0],
    [0, 0, 255],
    [75, 0, 130],
    [238, 130, 238]
];

const palette_yellow = [
    [0,0,0],
    [255,255,0]
];

var width;
var height;

var palette;

var conn_len = 1;

onmessage = function (e) {
    width = e.data[0];
    height = e.data[1];
    switch (e.data[3]) {
        case "yellow":
            palette = palette_yellow;
            break;
        case "rainbow":
            palette= palette_rainbow;
            break;
    }

    // console.time("standard");
    // mandelbrot(e.data[2], e.data[3], e.data[4], e.data[5]);
    // console.timeEnd("standard");

    console.time("border");
    mandelbrotBorder(e.data[2], e.data[4], e.data[5], e.data[6]);
    console.timeEnd("border");
}

function mandelbrot(max_iterations, zoom, offset_x, offset_y) {
    const fractalImage = new Uint8ClampedArray(width * height * 4).fill(0);

    for (let x=0; x<width; x++) {
        for (let y=0; y<height; y++) {
            let i = mandelbrotGetIterations(x, y, max_iterations, zoom, offset_x, offset_y);
            mandelbrotColorPixel(fractalImage, x, y, i, max_iterations)
        }
    }

    self.postMessage(fractalImage);
}

function mandelbrotBorder(max_iterations, zoom, offset_x, offset_y) {
    const fractalImage = new Uint8ClampedArray(width * height * 4).fill(0);
    var iterationsArray = []; 
    for(let i=0; i<width; i++) {
        iterationsArray[i] = [];
        for(let j=0; j<height; j++) 
            iterationsArray[i][j] = -1;
    }

    for (let x=0; x<width; x++) {
        for (let y=0; y<height; y++) {
            if (iterationsArray[x][y] > -1)
                continue;
                
            let i = mandelbrotGetIterations(x, y, max_iterations, zoom, offset_x, offset_y);
            iterationsArray[x][y] = i;

            if (i == max_iterations && isBorder(iterationsArray, x, y, max_iterations))
                borderTrackAndFill(iterationsArray, x, y, max_iterations, zoom, offset_x, offset_y);
        }
    }

    for (let x=0; x<width; x++)
        for (let y=0; y<height; y++)
            mandelbrotColorPixel(fractalImage, x, y, iterationsArray[x][y], max_iterations, zoom);

    self.postMessage(fractalImage);
}

function mandelbrotGetIterations(x, y, max_iterations, zoom, offset_x, offset_y) {
    let module_threshold = 4;

    let scaling = (width/height > 1.5) ? height/2 : width/3;
    let c_re = ((x - width/2) / zoom + offset_x) / scaling;
    let c_im = ((y - height/2) / zoom + offset_y) / scaling;

    let i = 0;
    let re = 0;
    let im = 0;
    let re2 = 0;
    let im2 = 0;
    let new_re = 0;
    let new_im = 0;

    for (i = 0; i < max_iterations && re2 + im2 < module_threshold; i++) {
        re2 = re * re;
        im2 = im * im;
        new_re = re2 - im2 + c_re;
        new_im = (re + re) * im + c_im;

        re = new_re;
        im = new_im;
    }

    return i;
}

function mandelbrotColorPixel(fractalImage, x, y, iterations, max_iterations, zoom) {
    let index = (y * width + x) * 4;

    if (iterations == max_iterations) {
        fractalImage[index] = 0;
        fractalImage[index+1] = 0;
        fractalImage[index+2] = 0;
        fractalImage[index+3] = 255;
    } else {
        let concentration = Math.pow(iterations/max_iterations, 0.3);
        let new_iterations = concentration * max_iterations;
        let band_width = (max_iterations / (palette.length - 1));

        let color_index = Math.floor(concentration * (palette.length - 1));
        let color_perc = (new_iterations - color_index * band_width) / band_width;

        fractalImage[index] = palette[color_index][0] * (1 - color_perc) + palette[color_index + 1][0] * color_perc;
        fractalImage[index+1] = palette[color_index][1] * (1 - color_perc) + palette[color_index + 1][1] * color_perc;
        fractalImage[index+2] = palette[color_index][2] * (1 - color_perc) + palette[color_index + 1][2] * color_perc;
        // fractalImage[index+3] = (iterations > max_iterations/16 ? 255 : 254 * Math.pow(iterations/(max_iterations/16), 1.5) + 1);
        fractalImage[index+3] = 255 * iterations/(50 * (Math.log10(zoom) + 1));
    }
}

function borderTrackAndFill(iterationsArray, x, y, max_iterations, zoom, offset_x, offset_y) {
    let border = [];
    let index = 0;
    border.push([x, y]);
    
    while (border.length > index) {
        let x, y;
        [x, y] = border[index++];

        for (let x1 = x-conn_len; x1 <= x+conn_len && x1 >= 0 && x1 < width; x1++)
            for (let y1 = y-conn_len; y1 <= y+conn_len && y1 >= 0 && y1 < height; y1++)
                if (iterationsArray[x1][y1] == -1 && isBorder(iterationsArray, x1, y1, max_iterations)) {
                    border.push([x1,y1])
                    iterationsArray[x1][y1] = mandelbrotGetIterations(x1, y1, max_iterations, zoom, offset_x, offset_y);
                }
    }
    
    index = 0;
    while (border.length > index) {
        let x, y;
        [x, y] = border[index++];

        borderFill(iterationsArray, x, y, max_iterations);
    }
}

function borderFill(iterationsArray, x, y, max_iterations) {
    let fill = [];
    let index = 0;
    fill.push([x, y]);
    
    while (fill.length > index) {
        let x, y;
        [x, y] = fill[index++];

        for (let x1 = x-conn_len; x1 <= x+conn_len && x1 >= 0 && x1 < width; x1++)
            for (let y1 = y-conn_len; y1 <= y+conn_len && y1 >= 0 && y1 < height; y1++) {
                if (iterationsArray[x1][y1] == -1 && isInsideBorder(iterationsArray, x1, y1, max_iterations)) {
                    fill.push([x1, y1]);
                    iterationsArray[x1][y1] = max_iterations;
                }
            }
    }
}

function isBorder(iterationsArray, x, y, max_iterations) {
    let inside = false;
    let outside = false;

    for (let x1 = x-conn_len; x1 <= x+conn_len && x1 >= 0 && x1 < width; x1++)
        for (let y1 = y-conn_len; y1 <= y+conn_len && y1 >= 0 && y1 < height; y1++) {
            if (iterationsArray[x1][y1] == max_iterations)
                inside = true;
            else if (iterationsArray[x1][y1] > -1)
                outside = true;
        }

    return inside && (outside || x <= 1 || x >= width-2 || y <= 1 || y >= height-2);
}

function isInsideBorder(iterationsArray, x, y, max_iterations) {
    let inside = false;
    let outside = false;

    for (let x1 = x-1; x1 <= x+1 && x1 >= 0 && x1 < width; x1++)
        for (let y1 = y-1; y1 <= y+1 && y1 >= 0 && y1 < height; y1++) {
            if (iterationsArray[x1][y1] == max_iterations)
                inside = true;
            else if (iterationsArray[x1][y1] > -1)
                outside = true;
        }

    return inside && !outside;
}