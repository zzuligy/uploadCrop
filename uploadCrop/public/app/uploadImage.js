define(['jquery', 'jquery.fileupload', 'jquery.cropzoom'], function ( $ ) {
    function Upload(setting) {

        var cropSetting = {    //default crop setting
                selectorW:150, //选择框大小
                selectorH:150,
                windowW:180, //框大小
                windowH:180,
                previewW:150, //预览框大小
                previewH:150
            },
            config = function (setting) {
                this.urls = setting.urls;
                this.cropContainer = setting.cropContainerSelector;
                this.previewContainer = setting.previewContainerSelector;
                this.cropBtn = setting.cropBtnSelector;
                this.fileBtn = setting.fileBtnSelector;
                this.cropSetting = setting.cropSetting ? $.extend({}, cropSetting, setting.cropSetting) : cropSetting;

                var errMessage = {
                    unFileExist:'The fileSelector must be a input( type=file )',
                    unDefined:'[cropContainerSelector, previewContainerSelector, fileBtnSelector] must setted'
                }

                if ( typeof this.fileBtn == 'undefined' || !/file/.test( $( this.fileBtn).attr( 'type' ) ) ) {
                    throw new Error(errMessage.unFileExist);
                }
                if (typeof this.cropContainer == 'undefined' || typeof this.previewContainer == 'undefined') {
                    throw new Error(errMessage.unDefined);
                }
            };
        config.call(this, setting); //initilization

        /*
        * application run main method
        * */
        this.run = function( callbacks )  {
            var self = this,
                cropHandler = callbacks['cropHandler'],
                uploadHandler = callbacks['uploadHandler'];

            self.uploadImage( uploadHandler );
            $(this.cropBtn).on('click', function(){
                self.cropOnServer( cropHandler );
            });
        },

        /*
         *upload  image to server and crop it after uploaded.
         * @param {Function}  callback function after upload successly
         * */
        this.uploadImage = function ( callbak ) {

            var fileSelector = this.fileBtn,
                fileJO = $(fileSelector),
                urls = this.urls,
                dUrl = urls.defaultUrl,
                self = this;


            $.image = {};
            this.urls.uploadUrl = null; //清空默认

            this.cropLocalImage(dUrl);  //启动剪切插件

            $(fileSelector).fileupload({
                dataType:'json',
                add:function (e, data) {
                    data.submit();
                },
                done:function (e, data) {
                    urls.uploadUrl = (url = data._response.result.url);
                    callbak.call(this, url);       //上传成功回调函数
                    self.cropLocalImage(url);    //启动剪切插件
                }
            });

        };

        /*
         * @returns {Bollean} Returns true if there is a uploaded image, false otherwise.
         * */
        this.isUploaded = function () {
            return !!this.urls.uploadUrl;
        };

        //-----------------------crop part
        this.cropInstance = null;

        /*
         *crop the local image
         *@param {String} url of the image to be cropped
         * */
        this.cropLocalImage = function (url) {

            var cropzoom,
                previewContainer = this.previewContainer,
                cropContainer = this.cropContainer,
                width = this.width,
                height = this.height,
                setting = this.cropSetting,
                self = this,
                equalScale = self.util.equalScale;

            cropzoom = function (originalWidth, originalHeight) {
                var appearWidth, appearHeight, selectorD, windowToPreviewScale, appearDimension, previewDimension,
                    setting = self.cropSetting,
                    windowW = setting.windowW, windowH = setting.windowH,
                    previewW = setting.previewW, previewH = setting.previewH,
                    windowToPreviewScale = windowW / previewW;

                //get equal scale appear dimension
                appearDimension = equalScale({ w:windowW, h:windowH }, { w:originalWidth, h:originalHeight }).dimension;
                appearWidth = appearDimension.w, appearHeight = appearDimension.h;
                //get equal scale  preview dimension
                previewDimension = equalScale({ w:setting.previewW, h:setting.previewH }, { w:originalWidth, h:originalHeight }).dimension;
                selectorD = appearDimension.h > appearDimension.w ? appearDimension.w : appearDimension.h;

                self.cropInstance = $(cropContainer).cropzoom({
                    width:appearWidth,
                    height:appearHeight,
                    bgColor:'#ccc',
                    enableRotation:false,
                    enableZoom:false,
                    selector:{       //选择框
                        w:selectorD / 2,
                        h:selectorD / 2,
                        maxHeight:selectorD,
                        maxWidth:selectorD,
                        centered:true,
                        bgInfoLayer:'#fff',
                        borderColor:'blue',
                        borderColorHover:'yellow',
                        aspectRatio:true
                    },
                    image:{
                        source:url,
                        width:appearWidth,
                        height:appearHeight
                        //   minZoom: 30,
                        // maxZoom: 150
                    }
                });
            };

            this.util.getImgSize(url + '?stamp=' + Math.random().toFixed(3), cropzoom);

            $(previewContainer).css({ position:'relative', width:setting.previewW, height:setting.previewH, overflow:'hidden' });
            $(previewContainer + ' img').attr('src', url);

            //set crop region dimension of preview image when dragMove event trigger
            $(window).on('dragMove', function (e, data) {
                console.info(e, data);
                var d = data,
                    previewImage = $(previewContainer + ' img'),
                    originalWidth = $.image.w,
                    originalHeight = $.image.h,

                    cropRegionW = d.x2 - d.x1, cropRegionH = d.y2 - d.y1,
                    sw = setting.previewW / cropRegionW , sh = setting.previewH / cropRegionH,
                    cropRegion = { w:d.x2 - d.x1, h:d.y2 - d.y1 };

                previewImage.css({position:'absolute'});
                previewImage.css({ width:originalWidth * sw, height:originalHeight * sh, top:-d.y1 * sh, left:-d.x1 * sw, margin:'0pximportant' });

            });
        };

        /*
         *send crop params to the server for cropping the image
         *@param {Function} the function callback after cropped in server
         * @returns {Object} Returns a deferred object for synchronose programming.
         * */
        this.cropOnServer = function ( callback ) {
            return this.cropInstance.send(this.urls.cropApiUrl, 'POST', {}, callback); //dfd
        };

        this.util = {
            //等比例缩放图形
            equalScale:function (windowDimension, imgDimension) {
                var scaleX, scaleY, appearDimension, maxScale,
                    windowW = windowDimension.w, windowH = windowDimension.h,
                    imgW = imgDimension.w, imgH = imgDimension.h;

                scaleX = imgW / windowW, scaleY = imgH / windowH;
                maxScale = scaleX > scaleY ? scaleX : scaleY;
                appearDimension = { w:imgW / maxScale, h:imgH / maxScale };
                return { dimension:appearDimension, maxScale:maxScale };
            },
            /*
             * get image original size
             * @param {String} url the url which point to the image for  it's original dimension
             * @param {Function} callback the function called after geting the dimension of the image.
             * */
            getImgSize:function (url, callback) {
                var self = this, newImg = new Image(); //建立新的图片对象
                newImg.src = url;
                $(newImg).on('load', function (e) {
                    var width = this.width,
                        height = this.height;
                    $.image.w = width;
                    $.image.h = height;
                    callback && callback(width, height);
                    console.log('重新计算图片原始大小')
                })
            }
        };
    }

    return Upload;
});