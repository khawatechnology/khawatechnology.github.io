(function ($) {
    'use strict';

    /**
     * Calls Morphext library on background image
     * custom block's taglines
     */
    Drupal.behaviors.callMorphext = {
        attach: function (context, settings) {
            $(document).find('#section-top').once('khawa-rotate-tagline').each(function() {
                // Rotate services in background image block's tagline
                $("#js-rotate-service").Morphext({
                    // The [in] animation type. Refer to Animate.css for a list of available animations.
                    animation: "fadeInDown",
                    // An array of phrases to rotate are created based on this separator. Change it if you wish to separate the phrases differently (e.g. So Simple | Very Doge | Much Wow | Such Cool).
                    separator: ",",
                    // The delay between the changing of each phrase in milliseconds.
                    speed: 3000
                });

                // Rotate web products in background image block's tagline
                $("#js-rotate-product").Morphext({
                    // The [in] animation type. Refer to Animate.css for a list of available animations.
                    animation: "fadeInUp",
                    // An array of phrases to rotate are created based on this separator. Change it if you wish to separate the phrases differently (e.g. So Simple | Very Doge | Much Wow | Such Cool).
                    separator: ",",
                    // The delay between the changing of each phrase in milliseconds.
                    speed: 3000
                });
            });
        }
    };

})(jQuery);
