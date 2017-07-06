/**=========================================================
 * Module: aside-toggle.js
 * Toggle the aside between normal an collapsed state
 * State applied to body so all elements can be notified
 * Targeted elements must have [data-toggle="aside"]
 =========================================================*/

(function($, window, document){

  var Selector = '[data-toggle="aside"]',
      $body = $('body');

  $(document).on('click', Selector, function (e) {
      e.preventDefault();
      
      $body.toggleClass('aside-toggled');

  });

}(jQuery, window, document));

/**=========================================================
 * Module: sidebar-menu.js
 * Provides a simple way to implement bootstrap collapse plugin using a target 
 * next to the current element (sibling)
 * Targeted elements must have [data-toggle="collapse-next"]
 =========================================================*/
(function($, window, document){

  var collapseSelector = '[data-toggle="collapse-next"]',
      colllapsibles    = $('.sidebar .collapse').collapse({toggle: false}),
      toggledClass     = 'aside-toggled',
      $body            = $('body'),
      phone_mq         = 768; // media querie

  $(function() {

    $(document)
      .on('click', collapseSelector, function (e) {
          e.preventDefault();
          
          if ($(window).width() > phone_mq &&
              $body.hasClass(toggledClass)) return;

          // Try to close all of the collapse areas first
          colllapsibles.collapse('hide');
          // ...then open just the one we want
          var $target = $(this).siblings('ul');
          $target.collapse('show');

      })
      // Submenu when aside is toggled
      .on('click', '.sidebar > .nav > li', function() {

        if ($body.hasClass(toggledClass) &&
          $(window).width() > phone_mq) {

            $('.sidebar > .nav > li')
              .not(this)
              .removeClass('open')
              .end()
              .filter(this)
              .toggleClass('open');
        }

      });

  });


}(jQuery, window, document));

/**=========================================================
 * Module: tooltips.js
 * Initialize Bootstrap tooltip with auto placement
 =========================================================*/

(function($, window, document){

  $(function(){

    $('[data-toggle="tooltip"]').tooltip({
      container: 'body',
      placement: function (context, source) {
                    //return (predictTooltipTop(source) < 0) ?  "bottom": "top";
                    var pos = "top";
                    if(predictTooltipTop(source) < 0)
                      pos = "bottom";
                    if(predictTooltipLeft(source) < 0)
                      pos = "right";
                    return pos;
                }
    });

  });

  // Predicts tooltip top position 
  // based on the trigger element
  function predictTooltipTop(el) {
    var top = el.offsetTop;
    var height = 40; // asumes ~40px tooltip height

    while(el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
    }
    return (top - height) - (window.pageYOffset);
  }

  // Predicts tooltip top position 
  // based on the trigger element
  function predictTooltipLeft(el) {
    var left = el.offsetLeft;
    var width = el.offsetWidth;

    while(el.offsetParent) {
      el = el.offsetParent;
      left += el.offsetLeft;
    }
    return (left - width) - (window.pageXOffset);
  }

}(jQuery, window, document));
