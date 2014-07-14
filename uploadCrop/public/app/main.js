//Inside scripts/main.js
require(["app/uploadImage"], function (uploadCrop) {
    var uc = new uploadCrop(
        {
            urls:{
                cropApiUrl:'/crop'
            },
            cropContainerSelector:'#cropContainer',
            previewContainerSelector:'#previewContainer',
            cropBtnSelector:'#cropBtn',
            fileBtnSelector:'#fileupload',
            cropSetting:{
                selectorW:100, //选择框大小
                selectorH:100,
                windowW:400, //框大小
                windowH:400,
                previewW:150, //预览框大小
                previewH:150
            }
        }
    );

    var uploadCallback,
        cropHandler,

        uploadCallback = function (url) {     //图片上传成功回调

        };


    cropHandler = function (res) {   //点击 剪切 ok

    };

    uc.run({cropHandler:cropHandler, uploadHandler:uploadCallback});
});