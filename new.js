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

var main_stream = null;

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

var available_models = {
    "microsoft-coco": {
        "name": "Microsoft COCO",
        "version": 9,
        "video": "",
        "confidence": 0.6,
        "imageGrid": [
            "https://media.roboflow.com/homepage/000000000544_jpg.rf.f588881eb2c2829187797d304e3a941d.jpg?ik-sdk-version=javascript-1.4.3&updatedAt=1675241561128",
            "https://media.roboflow.com/homepage/000000000064_jpg.rf.654457cc709530d859531d38bb990ec8.jpg?ik-sdk-version=javascript-1.4.3&updatedAt=1675241561271",
            "https://media.roboflow.com/homepage/000000000321_jpg.rf.c38501b6894584ac21c859cd4390e75e.jpg?ik-sdk-version=javascript-1.4.3&updatedAt=1675241561164",
            "https://media.roboflow.com/homepage/000000000250_jpg.rf.47b3fb8b6ed29e369cc361720b5f21f5.jpg?ik-sdk-version=javascript-1.4.3&updatedAt=1675241560704"
        ],
        "model": null
    },
    "construction-site-safety": {
        "name": "Worksite Safety",
        "version": 27,
        "confidence": 0.3,
        "video": "https://media.roboflow.com/homepage/Worksite_Safety/Screen_Recording_2023-02-15_at_11.09.23_AM.mov?ik-sdk-version=javascript-1.4.3&updatedAt=1676479657201",
        "imageGrid": [
            "https://media.roboflow.com/homepage/Worksite_Safety/Screenshot_2023-02-15_at_11.07.02_AM_Large.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676480555712",
            "https://media.roboflow.com/homepage/Worksite_Safety/Screenshot_2023-02-15_at_11.06.04_AM_Large.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676480555618",
            "https://media.roboflow.com/homepage/Worksite_Safety/001548_jpg.rf.01a671015cc2ceefdbaf0801b4913d12.jpg?ik-sdk-version=javascript-1.4.3&updatedAt=1676479636902",
            "https://media.roboflow.com/homepage/Worksite_Safety/image_818_jpg.rf.d804cf6e52c8a47cf294d98c587594d1.jpg?ik-sdk-version=javascript-1.4.3&updatedAt=1676479636223"
        ],
        "model": null
    },
    "containers-detection-db0c2": {
        "name": "Logistics",
        "version": 1,
        "confidence": 0.3,
        "video": "https://media.roboflow.com/homepage/Logistics/Screen_Recording_2023-02-15_at_11.36.30_AM.mov?ik-sdk-version=javascript-1.4.3&updatedAt=1676479651726",
        "imageGrid": [
            "https://media.roboflow.com/homepage/Logistics/pexels-fakhri-ailatat-6585817_Medium.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676540925200",
            "https://media.roboflow.com/homepage/Logistics/pexels-zeka-alrizki-12779104_Medium.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676540925006",
            "https://media.roboflow.com/homepage/Logistics/pexels-frans-van-heerden-1624695_Medium.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676540924972",
            "https://media.roboflow.com/homepage/Logistics/pexels-freestocksorg-122164_Medium.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676540924810"
        ],
        "model": null
    },
    "sku-110k": {
        "name": "Retail",
        "version": 4,
        "confidence": 0.3,
        "video": "https://media.roboflow.com/homepage/Retail/Screen_Recording_2023-02-15_at_10.29.04_AM.mov?ik-sdk-version=javascript-1.4.3&updatedAt=1676479650130",
        "imageGrid": [
            "https://media.roboflow.com/homepage/Retail/Screenshot_2023-02-15_at_9.47.00_AM_Medium.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676541028965",
            "https://media.roboflow.com/homepage/Retail/Screenshot_2023-02-15_at_9.46.41_AM_Medium.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676541028957",
            "https://media.roboflow.com/homepage/Retail/pexels-nothing-ahead-7451957_Medium.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676541028849",
            "https://media.roboflow.com/homepage/Retail/Screenshot_2023-02-15_at_9.49.03_AM_Medium.jpeg?ik-sdk-version=javascript-1.4.3&updatedAt=1676541028405"
        ],
        "model": null
    }
};

// populate model select
var model_select = document.getElementById("model-select");

for (var item in available_models) {
    var option = document.createElement("option");
    option.text = available_models[item]["name"];
    option.value = item;
    model_select.add(option);
}

var current_model_name = "microsoft-coco";
var current_model_version = 9;
const API_KEY = "rf_U7AD2Mxh39N7jQ3B6cP8xAyufLH3";
const DETECT_API_KEY = "4l5zOVomQmkAqlTJPVKN";
const CAMERA_ACCESS_URL = "https://uploads-ssl.webflow.com/5f6bc60e665f54545a1e52a5/63d40cd1de273045d359cf9a_camera-access2.png";
const LOADING_URL = "https://uploads-ssl.webflow.com/5f6bc60e665f54545a1e52a5/63d40cd2210b56e0e33593c7_loading-camera2.gif";
var webcamLoop = false;
var no_detection_count = 0;
var canvas_painted = false;
var all_predictions = [];

var canvas = document.getElementById("video_canvas");
var ctx = canvas.getContext("2d");

var model = null;

function detectFrame() {
    if (!model) return requestAnimationFrame(detectFrame);
    if (!canvas_painted) {
        var video_start = document.getElementById("video1");
        video_start.style.display = "block";
        canvas.style.display = "block";
        canvas.style.width = video_start.width + "px";
        canvas.style.height = video_start.height + "px";
        canvas.width = video_start.width;
        canvas.height = video_start.height;
        canvas.top = video_start.top;
        canvas.left = video_start.left;
        canvas.style.top = video_start.top + "px";
        canvas.style.left = video_start.left + "px";
        canvas.style.position = "absolute";
        canvas.style.display = "absolute";
        canvas_painted = true;
    }
    if (document.getElementById("loading_picture")) {
        document.getElementById("loading_picture").style.display = "none";
    }
    if (webcamLoop) {
        model.detect(video).then(function (predictions) {
            requestAnimationFrame(detectFrame);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBbox(ctx, video, predictions);
            });
    } else {
        main_stream.getTracks().forEach(function(track) {
            track.stop();
        });
        return true;
    }
}

// when user scrolls past #model-select, stop webcam
window.addEventListener("scroll", function() {
    if (window.scrollY > 100) {
        webcamLoop = false;
    }
    // if comes back up, start webcam
    if (window.scrollY < 100) {
        webcamLoop = true;
    }
});

async function apiRequest (image) {
    var version = available_models[current_model_name]["version"];
    var name = current_model_name;

    var url = "https://detect.roboflow.com/" + name + "/" + version + "?api_key=" + DETECT_API_KEY;
    
    // no cors
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: image,
        redirect: "follow",
    }).then((response) => response.json()
    ).then(resJson => { return resJson["predictions"] });
}

async function getModel() {
    var model = await roboflow
    .auth({
        publishable_key: API_KEY,
    })
    .load({
        model: current_model_name,
        version: current_model_version,
    });

    model.configure({
        threshold: available_models[current_model_name]["confidence"],
        max_objects: 50
    });

    return model;
}

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
    document.getElementById("example_demo").style.display = "none";
    // if video1, show it
    if (document.getElementById("video1")) {
        document.getElementById("video1").style.display = "none";
    } else if (document.getElementById("video1") && document.getElementById("video1").style.display == "block") {
        return;
    }
    // show picture canvas
        document.getElementById("picture_canvas").style.display = "block";
    webcamInference();
    });

var bounding_box_colors = {};

function switchModel() {
    current_model_name = document.getElementById("model-select").value;
    current_model_version = available_models[current_model_name]["version"];

    if (document.getElementById("video1")) {
        document.getElementById("video1").style.display = "none";
        // hide video_canvas
        document.getElementById("video_canvas").style.display = "none";
    }

    if (current_model_name == "microsoft-coco") {
        document.getElementById("picture_canvas").style.display = "none";
        document.getElementById("example_demo").style.display = "block";
        document.getElementById("picture").style.display = "none";
        // show video
        document.getElementById("video").style.display = "block";
        document.getElementById("video").play();
        // hide command tray
        // document.getElementById("prechosen_images_parent").style.display = "none";
    } else {
        document.getElementById("picture_canvas").style.display = "none";
        document.getElementById("example_demo").style.display = "none";
        document.getElementById("picture").style.display = "block";
        document
        .getElementById("picture")
        .addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
        document
        .getElementById("picture")
        .addEventListener("drop", processDrop);
    }

    // IF MODEL IS microsoft-coco, change 

    // change prechosen_images_parent srcs
    var prechosen_images = document.getElementById(
        "prechosen_images"
    );

    var prechosen_images = prechosen_images.children;

    for (var i = 0; i < prechosen_images.length; i++) {
        prechosen_images[i].src = available_models[current_model_name]["imageGrid"][i];
    }

    // hide webcam button if model is not microsoft-coco
    if (current_model_name != "microsoft-coco") {
        document.getElementById("webcam-predict").style.display = "none";
    } else {
        document.getElementById("webcam-predict").style.display = "inline";
    }

    // change video to use new one
    // var video = document.getElementById("video_source");
    // video.src = available_models[current_model_name]["video"];

    if (webcamLoop) {
        setImageState(
            LOADING_URL,
            "video_canvas"
        );
    }

    model = getModel();
}

// apply switchModel to select
document.getElementById("model-select").addEventListener("change", switchModel);

function setImageState(src, canvas = "picture_canvas") {
    var canvas = document.getElementById(canvas);
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.style.width = width + "px";
    img.style.height = height + "px";
    img.height = height;
    img.width = width;
    img.onload = function () {
    ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
    };
}

function drawBbox(ctx, video, predictions) {
  ctx.beginPath();
  var [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] =
    getCoordinates(video);

  drawBoundingBoxes(predictions, video, ctx, scalingRatio, sx, sy);
}

function drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy, fromDetectAPI = false) {
    if (predictions.length > 0) {
      all_predictions = predictions;
    }

    if (no_detection_count > 2) {
      all_predictions = predictions;
      no_detection_count = 0;
    }

    if (predictions.length == 0) {
      no_detection_count += 1;
    }

    for (var i = 0; i < predictions.length; i++) {
    var confidence = predictions[i].confidence;
    ctx.scale(1, 1);

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

    var prediction = predictions[i];
    var x = prediction.bbox.x - prediction.bbox.width / 2;
    var y = prediction.bbox.y - prediction.bbox.height / 2;
    var width = prediction.bbox.width;
    var height = prediction.bbox.height;

    if (!fromDetectAPI) {
        x -= sx;
        y -= sy;

        x *= scalingRatio;
        y *= scalingRatio;
        width *= scalingRatio;
        height *= scalingRatio;
    }

    // if box is partially outside 640x480, clip it
    if (x < 0) {
        width += x;
        x = 0;
    }

    if (y < 0) {
        height += y;
        y = 0;
    }

    // if first prediction, double label size


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
    // if (i == 0) {
    //     text.width *= 2;
    // }

    // set x y fill text to be within canvas x y, even if x is outside
    // if (y < 0) {
    //     y = -40;
    // }
    if (y < 20) {
        y = 30
    }

    // make sure label doesn't leave canvas

    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(x - 2, y - 30, text.width + 4, 30);
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
    // show loading_picture
    document.getElementById("loading_picture").style.display = "block";
    changeElementState(["picture_canvas", "prechosen_images_parent", "picture", "video1", "video", "video_canvas"]);
  
      navigator.mediaDevices
        // not user facing camera
        .getUserMedia({ video: { facingMode: "environment" } })
        .then(function (stream) {
            main_stream = stream;
  
        var canvas = document.getElementById("video_canvas");
        var ctx = canvas.getContext("2d");
        // hide canvas
          // change to front-facing camera
          // delete video1 if exists
          if (document.getElementById("video1")) {
              video = document.getElementById("video1");
          } else {
            video = document.createElement("video");
            video.style.display = "none";
          }
          video.srcObject = stream;
          video.id = "video1";
          // hide video
          video.setAttribute("playsinline", "");
          video.setAttribute("muted", "");
  
          // add after canvas
          document.getElementById("video_canvas").after(video);
  
          video.onloadedmetadata = function () {
              video.play();
              // hide video
          }
          // on full load
          video.onplay = function () {
              height = video.videoHeight;
              width = video.videoWidth;
      
              video.setAttribute("width", width);
              video.setAttribute("height", height);
              video.style.width = width + "px";
              video.style.height = height + "px";
  
              canvas.style.width = width + "px";
              canvas.style.height = height + "px";
              canvas.width = width;
              canvas.height = height;

              roboflow
                .auth({
                  publishable_key: API_KEY,
                })
                .load({
                  model: current_model_name,
                  version: current_model_version,
                })
                .then(function (m) {
                  model = m;
                  // images must have confidence > 0.7 to be returned by the model
                  m.configure({ threshold: available_models[current_model_name].confidence });
                  video.style.display = "block";
                  webcamLoop = true;
                  var result = detectFrame();
                  video_canvas.style.display = "block";
  
                  if (result) {
                      m.teardown();
                      // disable webcam
                      stream.getTracks().forEach(function (track) {
                          track.stop();
                    });
                  }
                })
                .catch(function (err) {
                  setImageState(CAMERA_ACCESS_URL, "video_canvas");
                });
          };
  
          ctx.scale(1, 1);
        })
        .catch(function (err) {
            setImageState(CAMERA_ACCESS_URL, "video_canvas");
      });
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
        var sWidth = sHeight * canvasRatio;
        var sx = (imageWidth - sWidth) / 2;
    }

    var scalingRatio = dWidth / sWidth;

    if (scalingRatio == Infinity) {
        scalingRatio = 1;
    }

    return [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio];
}

function getBase64Image(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    var dataURL = canvas.toDataURL("image/jpeg");
    return dataURL;
}

function imageInference(e) {
    webcamLoop = false;
    // replace canvas with image
    document.getElementById("picture_canvas").style.display = "block";

    changeElementState(["picture", "example_demo", "video_canvas"], "none");
    // hide video1
    if (document.getElementById("video1")) {
        document.getElementById("video1").style.display = "none";
    }

    var canvas = document.getElementById("picture_canvas");
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = e.src;
    img.crossOrigin = "anonymous";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    img.onload = function () {
        setImageState(
            LOADING_URL,
            "picture_canvas"
        );
    var [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] =
        getCoordinates(img);

    var base64 = getBase64Image(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    apiRequest(base64).then(function (predictions) {
        ctx.beginPath();
        // draw image to canvas
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        var predictions = predictions.map(function (prediction) {
            return {
                bbox: { x: prediction.x, y: prediction.y, width: prediction.width, height: prediction.height},
                class: prediction.class,
                confidence: prediction.confidence,
        }});

        drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy, true);
    });
    };
}

function processDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    // hide #picture
    changeElementState(["picture", "example_demo", "video_canvas", "picture_canvas"], "none");
    // document.getElementById("picture_canvas").style.display = "block";
    // show loading image
    document.getElementById("loading_picture").style.display = "block";

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
        img.crossOrigin = "anonymous";
        img.onload = function () {
        var [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] =
            getCoordinates(img);

        // send to api
        var base64 = getBase64Image(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

        apiRequest(base64).then(function (predictions) {
            document.getElementById("loading_picture").style.display = "none";
            document.getElementById("picture_canvas").style.display = "block";
            ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            var predictions = predictions.map(function (prediction) {
                return {
                    bbox: { x: prediction.x, y: prediction.y, width: prediction.width, height: prediction.height},
                    class: prediction.class,
                    confidence: prediction.confidence,
            }});
            ctx.beginPath();
            drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy);
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

function changeElementState (elements, state = "none") {
    for (var i = 0; i < elements.length; i++) {
        if (document.getElementById(elements[i])) {
            document.getElementById(elements[i]).style.display = state;
        }
    }
}

// click on image-predict, show image inference
document.getElementById("image-predict").addEventListener("click", function () {
    // show prechosen_images_parent
    var to_hide = ["picture_canvas", "example_demo", "video", "video_canvas", "video1"];
    changeElementState(to_hide);
    changeElementState(["prechosen_images_parent", "picture"], "block");
    // set event handler on image
    document.getElementById("picture").addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
    });
    document.getElementById("picture").addEventListener("drop", processDrop);
});
