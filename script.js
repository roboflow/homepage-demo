// if user is on mobile resolution
if (window.matchMedia("(max-width: 500px)").matches) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var picture_canvas = document.getElementById("picture_canvas");
    picture_canvas.width = width;
    picture_canvas.height = height;
} else {
    var width = 640;
    var height = 480;
}

var color_choices = [
    "#C7FC00",
    "#FF00FF",
    "#8622FF",
    "#FE0056",
    "#00FFCE",
    "#FF8000",
    "#00B7EB",
    "#FFFF00",
    "#0E7AFE",
    "#FFABAB",
    "#0000FF",
    "#CCCCCC",
];

const MODEL_NAME = "microsoft-coco";
const API_KEY = "";
const MODEL_VERSION = 9;

// write function to get mdoel and return it
async function getModel() {
    var model = await roboflow
    .auth({
        publishable_key: API_KEY,
    })
    .load({
        model: MODEL_NAME,
        version: MODEL_VERSION,
    });

    return model;
}

var model = getModel();

// run inference

document.getElementById("video").setAttribute("playsinline", "");
document.getElementById("video").play();

document.getElementById("video").addEventListener(
    "ended",
    function () {
    this.currentTime = 0;
    this.play();
    },
    false
);

document
    .getElementById("webcam-predict")
    .addEventListener("click", function () {
    document.getElementById("picture_canvas").style.display = "block";
    document.getElementById("example_demo").style.display = "none";
    webcamInference();
    });

var bounding_box_colors = {};

function setImageState(src) {
    var canvas = document.getElementById("picture_canvas");
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.style.width = width + "px";
    img.style.height = height + "px";
    img.height = height;
    img.width = width;
    img.onload = function () {
    ctx.drawImage(img, 0, 0, width, height);
    };
}

function drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy) {
    for (var i = 0; i < predictions.length; i++) {
    var confidence = predictions[i].confidence;

    if (confidence < 0.5) {
        continue;
    }

    if (predictions[i].class in bounding_box_colors) {
        ctx.strokeStyle = bounding_box_colors[predictions[i].class];
    } else {
        // random color
        var color =
        color_choices[Math.floor(Math.random() * color_choices.length)];
        ctx.strokeStyle = color;
        // remove color from choices
        color_choices.splice(color_choices.indexOf(color), 1);

        bounding_box_colors[predictions[i].class] = color;
    }

    var rect = canvas.getBoundingClientRect();

    var prediction = predictions[i];
    var x = prediction.bbox.x - prediction.bbox.width / 2;
    var y = prediction.bbox.y - prediction.bbox.height / 2;
    var width = prediction.bbox.width;
    var height = prediction.bbox.height;

    console.log(sx, sy);

    console.log(x, y, width, height);

    x -= sx;
    y -= sy;

    x *= scalingRatio;
    y *= scalingRatio;
    width *= scalingRatio;
    height *= scalingRatio;

    // if box is fully outside 640x480, skip it
    // if (x > width || y > height || x + width < 0 || y + height < 0) {
    //     continue;
    // }

    // if box is partially outside 640x480, clip it
    if (x < 0) {
        width += x;
        x = 0;
    }

    if (y < 0) {
        height += y;
        y = 0;
    }

    var scaling = window.devicePixelRatio;

    ctx.rect(x, y, width, width);

    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fill();

    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = "4";
    ctx.strokeRect(x, y, width, height);
    // put colored background on text
    var text = ctx.measureText(
        prediction.class + " " + Math.round(confidence * 100) + "%"
    );
    // convert to rgba
    var rgba = ctx.strokeStyle.replace(")", ", 0.5)").replace("rgb", "rgba");

    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(x - 2, y - 30, text.width + 10, 30);
    // use monospace font
    ctx.font = "15px monospace";
    // use black text
    ctx.fillStyle = "black";
    ctx.fillText(
        prediction.class + " " + Math.round(confidence * 100) + "%",
        x,
        y - 10
    );
    }
}

function webcamInference() {
    setImageState(
    "https://uploads-ssl.webflow.com/5f6bc60e665f54545a1e52a5/63d40cd2210b56e0e33593c7_loading-camera2.gif"
    );
    // hide prechosen_images_parent
    document.getElementById("prechosen_images_parent").style.display = "none";
    document.getElementById("picture").style.display = "none";
    // hide picture canvas, show video canvas
    document.getElementById("picture_canvas").style.display = "none";
    document.getElementById("video_canvas").style.display = "block";

    console.log("webcam inference");
    console.log("video1", document.getElementById("video1"));

    if (
    document.getElementById("video1") &&
    document.getElementById("video1").style
    ) {
    document.getElementById("video1").style.display = "block";
    } else {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(function (stream) {
        // if video exists, show it
        // create video element
        var video = document.createElement("video");
        video.srcObject = stream;
        video.id = "video1";
        video.setAttribute("playsinline", "");
        video.play();

        video.height = height;
        video.style.height = height + "px";
        video.width = width;
        video.style.width = width + "px";

        var canvas = document.getElementById("video_canvas");
        var ctx = canvas.getContext("2d");

        video.addEventListener(
            "loadeddata",
            function () {
            setInterval(function () {
                model.then(function (model) {
                model.detect(video).then(function (predictions) {
                    ctx.drawImage(video, 0, 0, width, height);

                    ctx.beginPath();

                    drawBoundingBoxes(predictions, canvas, ctx, 1, 0, 0);
                });
                });
            }, 1000 / 100);
            },
            false
        );
        })
        .catch(function (err) {
        // replace with img
        setImageState(
            "https://uploads-ssl.webflow.com/5f6bc60e665f54545a1e52a5/63d40cd1de273045d359cf9a_camera-access2.png"
        );
        });
    }
}

function getCoordinates(img) {
    var dx = 0;
    var dy = 0;
    var dWidth = 640;
    var dHeight = 480;

    var sy;
    var sx;
    var sWidth = 0;
    var sHeight = 0;

    var imageWidth = img.width;
    var imageHeight = img.height;

    const canvasRatio = dWidth / dHeight;
    const imageRatio = imageWidth / imageHeight;

    // scenario 1 - image is more vertical than canvas
    if (canvasRatio >= imageRatio) {
    var sx = 0;
    var sWidth = imageWidth;
    var sHeight = sWidth / canvasRatio;
    var sy = (imageHeight - sHeight) / 2;
    } else {
    // scenario 2 - image is more horizontal than canvas
    var sy = 0;
    var sHeight = imageHeight;
    const sWidth = sHeight * canvasRatio;
    var sx = (imageWidth - sWidth) / 2;
    }

    var scalingRatio = dWidth / sWidth;

    // if swidth or height are undefined

    return [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio];
}

function imageInference(e) {
    // replace canvas with image
    console.log(e);
    document.getElementById("picture").style.display = "none";
    document.getElementById("picture_canvas").style.display = "block";
    document.getElementById("example_demo").style.display = "none";
    document.getElementById("video_canvas").style.display = "none";

    var canvas = document.getElementById("picture_canvas");
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = e.src;
    img.crossOrigin = "anonymous";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    img.onload = function () {
    var [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] =
        getCoordinates(img);

    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    console.log(sx, sy, sWidth, sHeight, "D");

    model.then(function (model) {
        model.detect(img).then(function (predictions) {
        ctx.beginPath();
        drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy);
        });
    });
    };
}

function processDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    // hide #picture
    document.getElementById("picture").style.display = "none";
    document.getElementById("picture_canvas").style.display = "block";
    document.getElementById("example_demo").style.display = "none";
    document.getElementById("video_canvas").style.display = "none";

    // clear canvas if necessary
    if (document.getElementById("picture_canvas").getContext) {
    var canvas = document.getElementById("picture_canvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    var canvas = document.getElementById("picture_canvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var file = e.dataTransfer.files[0];
    var reader = new FileReader();

    reader.readAsDataURL(file);

    // only allow png, jpeg, jpg
    if (
    file.type == "image/png" ||
    file.type == "image/jpeg" ||
    file.type == "image/jpg"
    ) {
    reader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;
        img.onload = function () {
        var [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] =
            getCoordinates(img);

        console.log(sx, sy, sWidth, sHeight, "D");
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

        model.then(function (model) {
            model.detect(img).then(function (predictions) {
            ctx.beginPath();
            drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy);
            });
        });
        };
        document
        .getElementById("picture_canvas")
        .addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
        document
        .getElementById("picture_canvas")
        .addEventListener("drop", processDrop);
    };
    }
}

// click on image-predict, show image inference
document.getElementById("image-predict").addEventListener("click", function () {
    // show prechosen_images_parent
    document.getElementById("prechosen_images_parent").style.display = "block";
    document.getElementById("picture_canvas").style.display = "none";
    document.getElementById("picture").style.display = "block";
    document.getElementById("example_demo").style.display = "none";
    document.getElementById("video").style.display = "none";
    // set event handler on image
    document.getElementById("picture").addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    });
    document.getElementById("picture").addEventListener("drop", processDrop);
});
