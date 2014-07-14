uploadCrop
==========
upload and crop an image.
encapsulated with requirejs.

-----------------------------usage-------------------------------------
<script type="text/javascript" data-main="app" src="lib/require.js"></script>
is the only script that is needed by the app.

main.js
is the startup js where you can config you app.

configuration options:

urls:cropApiUrl:'/crop'

cropContainerSelector:'#cropContainer',

previewContainerSelector:'#previewContainer',

cropBtnSelector:'#cropBtn',

fileBtnSelector:'#fileupload',

cropSetting:
                selectorW:100, //选择框大小
                selectorH:100,
                windowW:400, //框大小
                windowH:400,
                previewW:150, //预览框大小
                previewH:150
            

        
uploadCallback //upload successfuly callback

cropHandler   //crop successfuly callback
