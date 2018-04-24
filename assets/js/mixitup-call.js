(function ($) {
    'use strict';

    /**
     * Calls Mixitup library on homepage's
     * case studies
     */
    Drupal.behaviors.callMixitup = {
        attach: function (context, settings) {
            $(document).find('#section-case-studies').once('khawa-filter-case-studies').each(function() {
                $("#container-mixitup").mixItUp();
            });
        }
    };

})(jQuery);
