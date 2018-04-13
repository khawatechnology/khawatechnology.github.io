(function ($) {
    'use strict';

    /**
     * Calls Owl Carousel on homepage's clients
     * or on case studies
     */
    Drupal.behaviors.owlCarousel = {
        attach: function (context, settings) {
            /**
             * Calls Owl Carousel on homepage's clients
             */
            $(context).find('#owl-clients').once('owl-clients').each(function () {
                $(this).owlCarousel({
                    autoplay: true,
                    items: 3,
                    loop: true,
                    dots: false,
                    nav: false,
                    responsive:{
                        0:{
                            items: 2
                        },
                        450:{
                            items: 3
                        }
                    }
                });
            });
            /**
             * Calls Owl Carousel on case studies (case study page)
             */
            $(context).find('#owl-case-studies').once('owl-case-studies').each(function () {
                $(this).find('.owl-carousel').owlCarousel({
                    autoplay: false,
                    items: 3,
                    loop: true,
                    dots: false,
                    nav: true,
                    navContainer: '.owl-buttons',
                    navText: ['', ''],
                    responsive:{
                        0:{
                            items: 2
                        },
                        450:{
                            items: 3
                        }
                    }
                });
            });
        }
    };

})(jQuery);
