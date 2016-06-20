/* jshint browser: true, varstmt: false, jquery: true */

'use strict';

$(document).ready(function() {
  $('.listing').each(function() {
    var nav = $(this).children('ul.nav');
    var tabs = $(this).children('.tab-content');

    var selectedIdx = -1;

    select(0);

    $(nav).children().each(function(index) {
      $(this).click(function() {
        select(index);
      });
    });

    function select(idx) {
      if (idx != selectedIdx) {
        if (selectedIdx != -1) {
          $($(nav).children()[selectedIdx]).removeClass('active');
          $($(tabs).children()[selectedIdx]).removeClass('active');
        }

        selectedIdx = idx;

        $($(nav).children()[selectedIdx]).addClass('active');
        $($(tabs).children()[selectedIdx]).addClass('active');
      }
    }
  });
});
