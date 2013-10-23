// Generated by CoffeeScript 1.6.1
(function() {

  $(function() {
    var add, deselect_all, invert, select_all;
    select_all = function() {
      console.log("selected_all");
      return $(".trait_checkbox").prop('checked', true);
    };
    deselect_all = function() {
      return $(".trait_checkbox").prop('checked', false);
    };
    invert = function() {
      return $(".trait_checkbox").trigger('click');
    };
    add = function() {
      var traits;
      traits = $("#trait_table input:checked").map(function() {
        return $(this).val();
      }).get();
      console.log("checked length is:", traits.length);
      console.log("checked is:", traits);
      return $.colorbox({
        href: "/collections/add?traits=" + traits
      });
    };
    $("#select_all").click(select_all);
    $("#deselect_all").click(deselect_all);
    $("#invert").click(invert);
    return $("#add").click(add);
  });

}).call(this);
