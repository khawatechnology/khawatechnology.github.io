(function ($) {
    'use strict';

    // Call jRespond and add breakpoints.
    // var jRes = jRespond([
    //     {
    //         label: 'handheld',
    //         enter: 0,
    //         exit: 767
    //     },
    //     {
    //         label: 'desktop',
    //         enter: 768,
    //         exit: 10000
    //     }
    // ]);

    /**
     * Add navigation bar animation when scrolling
     */
    // Drupal.behaviors.khawaNavBarScroll = {
    //     attach: function (context) {
    //         var _this = this;
    //         $(context).find('#header').once('khawa-nav-bar').each(function () {
    //             var $header = $(this);
    //             _this.updateNavBar($(document).scrollTop(), $header);
    //
    //             $(window).scroll(function() {
    //                 _this.updateNavBar($(document).scrollTop(), $header)
    //             });
    //         });
    //     },
    //
    //     updateNavBar: function(scrollPos, $header) {
    //         var nav_height = 92;
    //         var $nav = $header.find('#nav');
    //         if (scrollPos < nav_height) {
    //             $header.removeClass('shrinked').addClass('tr-nav');
    //             if ($nav.hasClass('index-nav')) {
    //                 $nav.addClass('navbar-transparent');
    //                 $nav.removeClass('navbar-opaque');
    //             }
    //         } else {
    //             $header.addClass('shrinked').removeClass('tr-nav');
    //             if ($nav.hasClass('index-nav')) {
    //                 $nav.removeClass('navbar-transparent');
    //                 $nav.addClass('navbar-opaque');
    //             }
    //         }
    //
    //     }
    //
    // };
    //
    // /**
    //  * Automatically scroll down mobile menu when opening
    //  * language links.
    //  */
    // Drupal.behaviors.khawaScrollDownLanguageLinks = {
    //     attach: function (context) {
    //         $(context).find('#block-languageswitcher ul.nav').once('scroll-down-language-links').each(function() {
    //             var $language_navbar = $(this);
    //             var $language_dropdown = $language_navbar.find('#language-menu-dropdown');
    //             $language_dropdown.on('shown.bs.dropdown', function () {
    //                 $language_navbar.find('nav.navbar-default').scrollTop($('nav.navbar-default').prop("scrollHeight"));
    //             })
    //         });
    //     }
    // };
    //
    // /**
    //  * Add smooth scrolling to homepage menu elements
    //  */
    // Drupal.behaviors.khawaSmoothScroll = {
    //     attach: function (context) {
    //         $(context).find('#main-navigation').once('smooth-scroll').each(function() {
    //             //Smooth Scroll//
    //             smoothScroll.init({
    //                 selector: '#main-navigation a'
    //             });
    //         });
    //     }
    // };
    //
    // /**
    //  * Close navbar dropdown when link clicked on mobile
    //  */
    // Drupal.behaviors.khawaNavMobile = {
    //     attach: function (context) {
    //         $(context).find('#header').once('khawa-nav-bar-mobile').each(function () {
    //             var $header = $(this);
    //             // register enter and exit functions for a single breakpoint
    //             jRes.addFunc({
    //                 breakpoint: 'handheld',
    //                 enter: function () {
    //                     $header.find('#main-navigation ul a').click(function () {
    //                         $(".navbar-collapse").collapse('hide');
    //                     });
    //                 }
    //             });
    //         });
    //     }
    // };
    //
    // /**
    //  * Smooth scroll to page top when clicking the footer scroll to top button
    //  */
    // Drupal.behaviors.khawaScrollTop = {
    //     attach: function(context) {
    //         $(context).find('#scroll-top').once('khawa-scroll-top').click(function () {
    //             $('html, body').animate({
    //                 scrollTop: 0
    //             }, 800);
    //             return false;
    //         });
    //     }
    // };
    //
    // /**
    //  * Add scroll spy to main navigation.
    //  */
    // Drupal.behaviors.khawaScrollSpy = {
    //     attach: function (context) {
    //         var _this = this;
    //
    //         // Add scroll spy on body.
    //         $(context).find('body').once('scroll-spy').each(function() {
    //             var $body = $(this);
    //             $body.css('position', 'relative');
    //             $body.scrollspy({ target: '#nav' });
    //             _this.updateIsActive($(this));
    //         });
    //
    //         // When scroll spy updates.
    //         $(context).find('#main-navigation ul.nav').once('on-activate-scrollspy').each(function () {
    //             var $list = $(this);
    //             $list.on('activate.bs.scrollspy', function () {
    //                 _this.updateIsActive($(this));
    //             });
    //         });
    //     },
    //
    //     // Update drupal is-active class.
    //     updateIsActive: function($list) {
    //         $list.find('li a').each(function(){$(this).removeClass('is-active')});
    //         $list.find('li.active a').addClass('is-active');
    //
    //     }
    // };
    //
    // /**
    //  * Harmonize the height of technology boxes.
    //  */
    // Drupal.behaviors.technoBoxEqualHeigh = {
    //     attach: function (context) {
    //         $(context).find('#section-technologies').once('khawa-techno-box-equal-height').each(function () {
    //             var $section = $(this);
    //             // Equal boxes size when on desktop.
    //             jRes.addFunc({
    //                 breakpoint: 'desktop',
    //                 enter: function () {
    //                     var $row = $section.find('.row.mb');
    //                     var maxHeight = 0;
    //                     var $cols = $row.find('.techno-box');
    //                     $cols.each(function () {
    //                         var currentHeight = $(this).height();
    //                         if (currentHeight > maxHeight) {
    //                             maxHeight = currentHeight;
    //                         }
    //
    //                     });
    //                     $cols.each(function () {
    //                         $(this).height(maxHeight);
    //                     });
    //                 }
    //             });
    //             // Auto height on mobile.
    //             jRes.addFunc({
    //                 breakpoint: 'handheld',
    //                 enter: function () {
    //                     var $row = $section.find('.row.mb');
    //                     var $cols = $row.find('.techno-box');
    //                     $cols.each(function () {
    //                         $(this).height('auto');
    //                     });
    //                 }
    //             });
    //         });
    //     }
    // };

})(jQuery);
