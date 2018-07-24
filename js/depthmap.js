var DepthMap = (function() {

    /* VARS */

    var cOutput = {};
    var imageSize = {};
    var canvas = {};

    var w, h, ml, mt = 0;
    var renderer = {};

    var stage, container, foreground = {};
    var fr, fg = {};

    var mousex, mousey = 0;
    var ploader = {};

    var paused = false;
    
    var debuger = false;
    var debugEl = {};



    /* SETTINGS MOUSE MOVE - lower number - more impact */

    var scaleX_param = 50;
    var scaleY_param = 40;

    var scaleX_param_Touch = 15;
    var scaleY_param_Touch = 15;


    var options = {
        depthmap: '',
        ismobile: false,
        size: {
            w: 0,
            h: 0
        }
    };



    // tilt limitations
    var minY = -20;
    var maxY = 100;

    var minX = -50;
    var maxX = 50;



    /* SCALING CALCULATIONS */
    var Cover = (function() {



        function getScreenWidth() {
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        }


        function getScreeneight() {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        }



        function getWidth(parrent) {
            return parrent.offsetWidth;
        }


        function getHeight(parrent) {
            return parrent.offsetHeight;
        }




        var w = 0;
        var h = 0;


        function getAspectRatio(imgsize) {
            return imgsize.w / imgsize.h;
        }



        return {
            calc: function(imgsize, parrent) {

                w = getWidth(parrent);
                h = getHeight(parrent);


                var ar = getAspectRatio(imgsize);

                var newsize = {
                    w: 0,
                    h: 0,
                    mL: 0,
                    mT: 0,
                    bodyWidth: w,
                    bodyHeight: h
                };



                newsize.w = w;
                newsize.h = ((w * imgsize.h) / imgsize.w);



                if (newsize.h < h) {

                    newsize.w = imgsize.w * h / imgsize.h;
                    newsize.h = h;


                }

                newsize.mT = (newsize.h - h) / 2;
                newsize.mL = (newsize.w - w) / 2;


                for (var key in newsize) {
                    if (newsize.hasOwnProperty(key)) {
                        newsize[key] = parseInt(newsize[key]);
                    }
                }

                return newsize;
            }
        };


    })();


    function debug() {
        debugEl = document.createElement('div');
        debugEl.style.position = 'absolute';
        debugEl.style.left = '0px';
        debugEl.style.top = '0px';
        debugEl.style.backgroundColor = '#fff';
        debugEl.style.color = '#000';
        debugEl.style.fontSize = '24px';
        debugEl.style.zIndex = '2';
        cOutput.appendChild(debugEl);
    }



    /* EXPOSE API */

    var exp = {

        init: function(_options) {

            if (_options) {
                options = _options;

                if (options.scaleX_param) scaleX_param = options.scaleX_param;
                if (options.scaleY_param) scaleY_param = options.scaleY_param;

                if (options.scaleX_param_Touch) scaleX_param_Touch = options.scaleX_param_Touch;
                if (options.scaleY_param_Touch) scaleY_param_Touch = options.scaleY_param_Touch;
                

                if(options.debuger) debuger = options.debuger;
            }


            cOutput = document.getElementById(options.id);

            imageSize = Cover.calc(options.size, cOutput);


            w = imageSize.w;
            h = imageSize.h;
            mL = imageSize.mL;
            mT = imageSize.mT;

            renderer = new PIXI.WebGLRenderer(w, h);

            cOutput.appendChild(renderer.view);


            stage = new PIXI.Container();
            container = new PIXI.Container();
            foreground = new PIXI.Container();


            stage.addChild(container);
            stage.addChild(foreground);




            mousex = w / 2;
            mousey = h / 2;
            ploader = new PIXI.loaders.Loader();


            exp.setup();



        },

        eventsOn: function() {

            window.addEventListener("resize", exp.windowResize);

            cOutput.addEventListener("mousemove", exp.mouseMove);
            cOutput.addEventListener("touchmove", exp.touchMove);

            // mobile & tablet
            if (options.tilt) {
                if (window.DeviceOrientationEvent) {
                    window.addEventListener("deviceorientation", function(event) {
                        exp.onTilt(event.alpha, event.beta, event.gamma);
                    }, true);
                } else if (window.DeviceMotionEvent) {
                    window.addEventListener('devicemotion', function(event) {
                        exp.onTilt(event.acceleration.x * 2, event.acceleration.y * 2, event.acceleration.z * 2);
                    }, true);
                } else {
                    window.addEventListener("MozOrientation", function(event) {
                        exp.onTilt(orientation.x * 50, orientation.y * 50, orientation.z * 50);
                    }, true);
                }
            }



        },

        eventsOf: function() {
            window.removeEventListener("resize", exp.windowResize);
        },

        onTilt: function(alpha, beta, gama) {


            if (gama > minX && gama < maxX) {
                mousex = Math.floor((gama * w) / maxX);
                f.scale.x = (w / 2 - mousex) / scaleX_param;
            }



            if (beta > minY && beta < maxY) {
                mousey = Math.floor((beta * h) / maxY);
                f.scale.y = (h / 2 - mousey) / (scaleY_param * 0.2);
            }


            if(debuger){
                debugEl.innerHTML = mousex + '<br/>' + mousey;
            }


        },


        windowResize: function() {
            imageSize = Cover.calc(options.size, cOutput);

            w = imageSize.w;
            h = imageSize.h;
            mL = imageSize.mL;
            mT = imageSize.mT;

            canvas.getAttribute('width', w);
            canvas.getAttribute('height', h);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';


            if (options.centered) {
                fg.x = -(mL);
                d.x = -(mL);
            }

        },

        mouseMove: function(e) {

            mousex = e.clientX;
            mousey = e.clientY;

            f.scale.x = (window.innerWidth / 2 - mousex) / scaleX_param;
            f.scale.y = (window.innerHeight / 2 - mousey) / scaleY_param;


            debugEl.innerHTML = f.scale.x + '<br/>' + f.scale.y;

        },

        touchMove: function(e) {

            mousex = e.changedTouches[0].pageX;
            mousey = e.changedTouches[0].pageY;

            f.scale.x = (window.innerWidth / 2 - mousex) / scaleX_param_Touch;
            f.scale.y = (window.innerHeight / 2 - mousey) / scaleY_param_Touch;

        },



        pause: function() {
            paused = true;
        },

        resume: function() {
            paused = false;
            exp.animate();
        },

        animate: function() {

            if (paused) {
                return;
            }



            renderer.render(stage);
            requestAnimationFrame(exp.animate);
        },


        startDepthMap: function() {

            var texture = {};

            if (options.video) {
                var video = document.createElement("video");
                video.preload = "auto";
                video.loop = true;
                video.playsinline = true;
                video.webkitPlaysinline = true;
                video.muted = true;

                video.src = options.videosrc;
                texture = PIXI.Texture.fromVideo(video);
            } else {
                texture = ploader.resources.image.texture;
            }


            fg = new PIXI.Sprite(texture);
            fg.width = w;
            fg.height = h;

            fg.x = 0;
            fg.y = -mT;

            foreground.addChild(fg);



            d = new PIXI.Sprite(ploader.resources.depth.texture);
            d.width = w;
            d.height = h;
            d.x = 0;
            d.y = -mT;

            stage.addChild(d);


            f = new PIXI.filters.DisplacementFilter(d);
            stage.filters = [f];


            if (options.centered) {
                fg.x = -(mL);
                d.x = -(mL);
            }



            canvas = cOutput.getElementsByTagName('canvas')[0];

            if(debuger){
                debug();
            }

            exp.eventsOn();
            exp.windowResize();
            exp.animate();

        },


        setup: function() {

            if (!options.video) {
                ploader.add('image', options.image);
            }
            ploader.add('depth', options.depthmap);

            ploader.once('complete', exp.startDepthMap);
            ploader.load();

        }

    };


    return exp;


})();