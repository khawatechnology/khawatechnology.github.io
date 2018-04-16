(function ($) {

    'use strict';

    $(document).ready(function(){
        // Call jRespond and add breakpoints.
        var jRes = jRespond([
            {
                label: 'handheld',
                enter: 0,
                exit: 767
            },
            {
                label: 'desktop',
                enter: 768,
                exit: 10000
            }
        ]);

        /**
         * Add navigation bar animation when scrolling
         */
        var $header = $('#header');
        if ($header.length >= 1) {
            KhawaTheme.updateNavBar($(document).scrollTop(), $header);

            $(window).scroll(function() {
                KhawaTheme.updateNavBar($(document).scrollTop(), $header)
            });
        }

        /**
         * Automatically scroll down mobile menu when opening
         * language links.
         */
        var $language_navbar = $('#language-switcher');
        var $navbar_default = $('nav.navbar-default');
        if ($language_navbar.length >= 1) {
            var $language_dropdown = $language_navbar.find('#language-menu-dropdown');
            $language_dropdown.on('shown.bs.dropdown', function () {
                $navbar_default.scrollTop($navbar_default.prop("scrollHeight"));
            })
        }

        /**
         * Add smooth scrolling to homepage menu elements
         */
        var $main_navigation = $('#main-navigation');
        if ($main_navigation.length >= 1) {
            smoothScroll.init({
                selector: '#main-navigation a'
            });
        }

        /**
         * Close navbar dropdown when link clicked on mobile
         */
        if ($header.length >= 1) {
            jRes.addFunc({
                breakpoint: 'handheld',
                enter: function () {
                    $header.find('#main-navigation ul a').click(function () {
                        $(".navbar-collapse").collapse('hide');
                    });
                }
            });
        }

        /**
         * Smooth scroll to page top when clicking the footer scroll to top button
         */
        var $scroll_top = $('#scroll-top');
        if ($scroll_top.length >= 1) {
            $scroll_top.click(function (){
                $('html, body').animate({
                    scrollTop: 0
                }, 800);
                return false;
            });
        }

        // /**
        //  * Add scroll spy to main navigation.
        //  */
        var $body = $('body');
        // Add scroll spy on body.
        if ($body.length >= 1) {
            $body.css('position', 'relative');
            $body.scrollspy({ target: '#nav' });
            KhawaTheme.updateIsActive($(this));
        }

        // When scroll spy updates.
        var $nav = $main_navigation.find('ul.nav');
        if ($nav.length >= 1) {
            $nav.on('activate.bs.scrollspy', function () {
                KhawaTheme.updateIsActive($nav);
            });
        }

        /**
         * Harmonize the height of technology boxes.
         */
        var $section_techno = $('#section-technologies');
        if ($section_techno.length >= 1) {
            jRes.addFunc({
                breakpoint: 'desktop',
                enter: function () {
                    var $row = $section_techno.find('.row.mb');
                    var maxHeight = 0;
                    var $cols = $row.find('.techno-box');
                    $cols.each(function () {
                        var currentHeight = $(this).height();
                        if (currentHeight > maxHeight) {
                            maxHeight = currentHeight;
                        }

                    });
                    $cols.each(function () {
                        $(this).height(maxHeight);
                    });
                }
            });
            // Auto height on mobile.
            jRes.addFunc({
                breakpoint: 'handheld',
                enter: function () {
                    var $row = $section_techno.find('.row.mb');
                    var $cols = $row.find('.techno-box');
                    $cols.each(function () {
                        $(this).height('auto');
                    });
                }
            });

        }
    });
})(jQuery);

KhawaTheme = {
    updateNavBar: function (scrollPos, $header) {
        var nav_height = 92;
        var $nav = $header.find('#nav');
        if (scrollPos < nav_height) {
            $header.removeClass('shrinked').addClass('tr-nav');
            if ($nav.hasClass('index-nav')) {
                $nav.addClass('navbar-transparent');
                $nav.removeClass('navbar-opaque');
            }
        } else {
            $header.addClass('shrinked').removeClass('tr-nav');
            if ($nav.hasClass('index-nav')) {
                $nav.removeClass('navbar-transparent');
                $nav.addClass('navbar-opaque');
            }
        }
    },
    updateIsActive: function($list) {
        $list.find('li a').each(function(){$(this).removeClass('is-active')});
        $list.find('li.active a').addClass('is-active');
    }
};
