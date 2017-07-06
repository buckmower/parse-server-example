<script>
$(function () {

  'use strict';

  var console = window.console || { log: function () {} },
      $alert = $('.docs-alert'),
      $message = $alert.find('.message'),
      showMessage = function (message, type) {
        $message.text(message);

        if (type) {
          $message.addClass(type);
        }

        $alert.fadeIn();

        setTimeout(function () {
          $alert.fadeOut();
        }, 3000);
      };

  // Demo
  // -------------------------------------------------------------------------

  (function () {
    var $image = $('#uploadedProfilePicImgOnDisplay'),
        $dataX = $('#dataX'),
        $dataY = $('#dataY'),
        $dataHeight = $('#dataHeight'),
        $dataWidth = $('#dataWidth'),
        $dataRotate = $('#dataRotate'),
        options = {
          // data: {
          //   x: 420,
          //   y: 60,
          //   width: 640,
          //   height: 360
          // },
          // strict: false,
          // responsive: false,
          // checkImageOrigin: false

          // modal: false,
          // guides: false,
          // highlight: false,
          // background: false,

          // autoCrop: false,
          // autoCropArea: 0.5,
          // dragCrop: false,
          // movable: false,
          // resizable: false,
          // rotatable: false,
          // zoomable: false,
          // touchDragZoom: false,
          // mouseWheelZoom: false,

           minCanvasWidth: 256,
           minCanvasHeight: 256,
          // minCropBoxWidth: 160,
          // minCropBoxHeight: 90,
          // minContainerWidth: 320,
          // minContainerHeight: 180,

          // build: null,
          // built: null,
          // dragstart: null,
          // dragmove: null,
          // dragend: null,
          // zoomin: null,
          // zoomout: null,

          aspectRatio: 256/256,
          preview: '.profile-img-preview',
          crop: function (data) {
            $dataX.val(Math.round(data.x));
            $dataY.val(Math.round(data.y));
            $dataHeight.val(Math.round(data.height));
            $dataWidth.val(Math.round(data.width));
            $dataRotate.val(Math.round(data.rotate));
          }
        };
        $image.on({
          'build.cropper': function (e) {
            console.log(e.type);
          },
          'built.cropper': function (e) {
            console.log(e.type);
          },
          'dragstart.cropper': function (e) {
            console.log(e.type, e.dragType);
          },
          'dragmove.cropper': function (e) {
            console.log(e.type, e.dragType);
          },
          'dragend.cropper': function (e) {
            console.log(e.type, e.dragType);
          },
          'zoomin.cropper': function (e) {
            console.log(e.type);
          },
          'zoomout.cropper': function (e) {
            console.log(e.type);
          }
        }).cropper(options);
    // Tooltips
    $('[data-toggle="tooltip"]').tooltip();

  }());

});
// Methods
$(document).on('click', 'button[data-method]', function () {
  var data = $(this).data(),
      $target,
      result;

  if (data.method) {
    data = $.extend({}, data); // Clone a new one

    if (typeof data.target !== 'undefined') {
      var $target = $(data.target);

      if (typeof data.option === 'undefined') {
        try {
          data.option = JSON.parse($target.val());
        } catch (e) {
          console.log(e.message);
        }
      }
    }

    var result = $('#uploadedProfilePicImgOnDisplay').cropper(data.method, data.option);

    if ($.isPlainObject(result) && $target) {
      try {
        $target.val(JSON.stringify(result));
      } catch (e) {
        console.log(e.message);
      }
    }
    $("#submitCustomUserPicture").on('click', function(e) {
       sendFileToParse(result);
    });
  }
  function sendFileToParse(result){
     var fileInput = document.getElementById('inputProfileImage');
     var file = fileInput.files[0];
     var imageType = /image.*/;
     if (file.type.match(imageType)) {
      var reader = new FileReader();

      var name = file.name;
        var parseFile = new Parse.File(name, file);
        parseFile.save().then(function(parseFile){
          var UserPictures = new Parse.Object("UserPictures");
          if ((typeof parseFile !== "undefined") && (parseFile !== "") && (parseFile !== null)) {
             UserPictures.set("cropCoordinates", result.getData());
             UserPictures.set("picture", parseFile);
             UserPictures.set("pageObjectID", "<%= puserid %>");
             UserPictures.save();
             return true;
          } else {
             return false;
          }
         }).then(function(complete){
            location.reload(true);
         });
     }
  };
});
</script>