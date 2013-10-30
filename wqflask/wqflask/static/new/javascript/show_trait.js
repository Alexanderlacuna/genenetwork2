// Generated by CoffeeScript 1.6.1
(function() {
  var Stat_Table_Rows, is_number,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  console.log("start_b");

  is_number = function(o) {
    return !isNaN((o - 0) && o !== null);
  };

  Stat_Table_Rows = [
    {
      vn: "n_of_samples",
      pretty: "N of Samples",
      digits: 0
    }, {
      vn: "mean",
      pretty: "Mean",
      digits: 2
    }, {
      vn: "median",
      pretty: "Median",
      digits: 2
    }, {
      vn: "std_error",
      pretty: "Standard Error (SE)",
      digits: 2
    }, {
      vn: "std_dev",
      pretty: "Standard Deviation (SD)",
      digits: 2
    }, {
      vn: "min",
      pretty: "Minimum",
      digits: 2
    }, {
      vn: "max",
      pretty: "Maximum",
      digits: 2
    }, {
      vn: "range",
      pretty: "Range (log2)",
      digits: 2
    }, {
      vn: "range_fold",
      pretty: "Range (fold)",
      digits: 2
    }, {
      vn: "interquartile",
      pretty: "Interquartile Range",
      url: "/glossary.html#Interquartile",
      digits: 2
    }
  ];

  $(function() {
    var Histogram, block_by_attribute_value, block_by_index, block_outliers, change_stats_value, create_value_dropdown, edit_data_change, export_sample_table_data, get_sample_table_data, hide_no_value, hide_tabs, make_table, on_corr_method_change, populate_sample_attributes_values_dropdown, process_id, reset_samples_table, sample_group_types, sample_lists, show_hide_outliers, stats_mdp_change, update_stat_values;
    Histogram = (function() {

      function Histogram(sample_list, sample_group) {
        var longest_sample_name, sample,
          _this = this;
        this.sample_list = sample_list;
        this.sample_group = sample_group;
        this.get_samples();
        console.log("sample names:", this.sample_names);
        longest_sample_name = d3.max((function() {
          var _i, _len, _ref, _results;
          _ref = this.sample_names;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            sample = _ref[_i];
            _results.push(sample.length);
          }
          return _results;
        }).call(this));
        this.margin = {
          top: 20,
          right: 20,
          bottom: longest_sample_name * 7,
          left: 40
        };
        this.plot_width = this.sample_vals.length * 15 - this.margin.left - this.margin.right;
        this.plot_height = 500 - this.margin.top - this.margin.bottom;
        this.x_buffer = this.plot_width / 20;
        this.y_buffer = this.plot_height / 20;
        this.y_min = d3.min(this.sample_vals);
        this.y_max = d3.max(this.sample_vals) * 1.1;
        this.svg = this.create_svg();
        this.plot_height -= this.y_buffer;
        this.create_scales();
        this.create_graph();
        d3.select("#color_attribute").on("change", function() {
          var attribute;
          attribute = $("#color_attribute").val();
          console.log("attribute:", attribute);
          if ($("#update_bar_chart").html() === 'Sort By Name') {
            return _this.svg.selectAll(".bar").data(_this.sorted_samples()).transition().duration(1000).style("fill", function(d) {
              var attr_color_dict;
              attr_color_dict = _this.get_attr_color_dict();
              return attr_color_dict[attribute][d[2][attribute]];
            }).select("title").text(function(d) {
              return d[1];
            });
          } else {
            return _this.svg.selectAll(".bar").data(_this.sample_attr_vals).transition().duration(1000).style("fill", function(d) {
              var attr_color_dict;
              attr_color_dict = _this.get_attr_color_dict();
              return attr_color_dict[attribute][d[attribute]];
            });
          }
        });
        d3.select("#update_bar_chart").on("click", function() {
          var sortItems, sorted_sample_names, x_scale;
          if ($("#update_bar_chart").html() === 'Sort By Value') {
            $("#update_bar_chart").html('Sort By Name');
            sortItems = function(a, b) {
              return a[1] - b[1];
            };
            _this.svg.selectAll(".bar").data(_this.sorted_samples()).transition().duration(1000).attr("y", function(d) {
              return _this.y_scale(d[1]);
            }).attr("height", function(d) {
              return _this.plot_height - _this.y_scale(d[1]);
            }).style("fill", "steelblue").select("title").text(function(d) {
              return d[1];
            });
            sorted_sample_names = (function() {
              var _i, _len, _ref, _results;
              _ref = this.sorted_samples();
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                sample = _ref[_i];
                _results.push(sample[0]);
              }
              return _results;
            }).call(_this);
            x_scale = d3.scale.ordinal().domain(sorted_sample_names).rangeBands([0, _this.plot_width], .1);
            $('.x.axis').remove();
            return _this.add_x_axis(x_scale);
          } else {
            $("#update_bar_chart").html('Sort By Value');
            _this.svg.selectAll(".bar").data(_this.sample_vals).transition().duration(1000).attr("y", function(d) {
              return _this.y_scale(d);
            }).attr("height", function(d) {
              return _this.plot_height - _this.y_scale(d);
            }).style("fill", "steelblue").select("title").text(function(d) {
              return d;
            });
            x_scale = d3.scale.ordinal().domain(_this.sample_names).rangeBands([0, _this.plot_width], .1);
            $('.x.axis').remove();
            return _this.add_x_axis(x_scale);
          }
        });
      }

      Histogram.prototype.get_attr_color_dict = function() {
        var attr_color_dict, attribute_info, color, i, key, this_color_dict, value, _i, _len, _ref, _ref1;
        color = d3.scale.category20();
        attr_color_dict = {};
        _ref = js_data.attribute_names;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          attribute_info = _ref[key];
          this_color_dict = {};
          _ref1 = attribute_info.distinct_values;
          for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
            value = _ref1[i];
            this_color_dict[value] = color(i);
          }
          attr_color_dict[attribute_info.name] = this_color_dict;
        }
        return attr_color_dict;
      };

      Histogram.prototype.get_samples = function() {
        var attr_vals, attribute, key, sample, _i, _j, _len, _len1, _ref, _ref1;
        this.sample_names = (function() {
          var _i, _len, _ref, _results;
          _ref = this.sample_list;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            sample = _ref[_i];
            if (sample.value !== null) {
              _results.push(sample.name);
            }
          }
          return _results;
        }).call(this);
        this.sample_vals = (function() {
          var _i, _len, _ref, _results;
          _ref = this.sample_list;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            sample = _ref[_i];
            if (sample.value !== null) {
              _results.push(sample.value);
            }
          }
          return _results;
        }).call(this);
        this.attributes = (function() {
          var _results;
          _results = [];
          for (key in this.sample_list[0]["extra_attributes"]) {
            _results.push(key);
          }
          return _results;
        }).call(this);
        console.log("attributes:", this.attributes);
        this.sample_attr_vals = [];
        if (this.attributes.length > 0) {
          _ref = this.sample_list;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            sample = _ref[_i];
            attr_vals = {};
            _ref1 = this.attributes;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              attribute = _ref1[_j];
              attr_vals[attribute] = sample["extra_attributes"][attribute];
            }
            this.sample_attr_vals.push(attr_vals);
          }
        }
        return console.log("sample_attr_vals:", this.sample_attr_vals);
      };

      Histogram.prototype.create_svg = function() {
        var svg;
        svg = d3.select("#bar_chart").append("svg").attr("class", "bar_chart").attr("width", this.plot_width + this.margin.left + this.margin.right).attr("height", this.plot_height + this.margin.top + this.margin.bottom).append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        return svg;
      };

      Histogram.prototype.create_scales = function() {
        this.x_scale = d3.scale.ordinal().domain(this.sample_names).rangeBands([0, this.plot_width], .1);
        return this.y_scale = d3.scale.linear().domain([this.y_min * 0.75, this.y_max]).range([this.plot_height, this.y_buffer]);
      };

      Histogram.prototype.create_graph = function() {
        this.add_x_axis(this.x_scale);
        this.add_y_axis();
        return this.add_bars();
      };

      Histogram.prototype.add_x_axis = function(scale) {
        var xAxis,
          _this = this;
        xAxis = d3.svg.axis().scale(scale).orient("bottom");
        return this.svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + this.plot_height + ")").call(xAxis).selectAll("text").style("text-anchor", "end").style("font-size", "12px").attr("dx", "-.8em").attr("dy", "-.3em").attr("transform", function(d) {
          return "rotate(-90)";
        });
      };

      Histogram.prototype.add_y_axis = function() {
        var yAxis;
        yAxis = d3.svg.axis().scale(this.y_scale).orient("left").ticks(5);
        return this.svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end");
      };

      Histogram.prototype.add_bars = function() {
        var _this = this;
        return this.svg.selectAll(".bar").data(_.zip(this.sample_names, this.sample_vals)).enter().append("rect").style("fill", "steelblue").attr("class", "bar").attr("x", function(d) {
          return _this.x_scale(d[0]);
        }).attr("width", this.x_scale.rangeBand()).attr("y", function(d) {
          return _this.y_scale(d[1]);
        }).attr("height", function(d) {
          return _this.plot_height - _this.y_scale(d[1]);
        }).append("svg:title").text(function(d) {
          return d[1];
        });
      };

      Histogram.prototype.sorted_samples = function() {
        var sample_list, sorted,
          _this = this;
        if (this.sample_attr_vals.length > 0) {
          sample_list = _.zip(this.sample_names, this.sample_vals, this.sample_attr_vals);
        } else {
          sample_list = _.zip(this.sample_names, this.sample_vals);
        }
        sorted = _.sortBy(sample_list, function(sample) {
          return sample[1];
        });
        console.log("sorted:", sorted);
        return sorted;
      };

      return Histogram;

    })();
    sample_lists = js_data.sample_lists;
    sample_group_types = js_data.sample_group_types;
    new Histogram(sample_lists[0]);
    $('.stats_samples_group').change(function() {
      var all_samples, group;
      $('#bar_chart').remove();
      $('#bar_chart_container').append('<div id="bar_chart"></div>');
      group = $(this).val();
      console.log("group:", group);
      if (group === "samples_primary") {
        return new Histogram(sample_lists[0]);
      } else if (group === "samples_other") {
        return new Histogram(sample_lists[1]);
      } else if (group === "samples_all") {
        all_samples = sample_lists[0].concat(sample_lists[1]);
        return new Histogram(all_samples);
      }
    });
    hide_tabs = function(start) {
      var x, _i, _results;
      _results = [];
      for (x = _i = start; start <= 10 ? _i <= 10 : _i >= 10; x = start <= 10 ? ++_i : --_i) {
        _results.push($("#stats_tabs" + x).hide());
      }
      return _results;
    };
    stats_mdp_change = function() {
      var selected;
      selected = $(this).val();
      hide_tabs(0);
      return $("#stats_tabs" + selected).show();
    };
    change_stats_value = function(sample_sets, category, value_type, decimal_places) {
      var current_value, id, in_box, the_value, title_value;
      id = "#" + process_id(category, value_type);
      console.log("the_id:", id);
      in_box = $(id).html;
      current_value = parseFloat($(in_box)).toFixed(decimal_places);
      the_value = sample_sets[category][value_type]();
      console.log("After running sample_sets, the_value is:", the_value);
      if (decimal_places > 0) {
        title_value = the_value.toFixed(decimal_places * 2);
        the_value = the_value.toFixed(decimal_places);
      } else {
        title_value = null;
      }
      console.log("*-* the_value:", the_value);
      console.log("*-* current_value:", current_value);
      if (the_value !== current_value) {
        $(id).html(the_value).effect("highlight");
      }
      if (title_value) {
        return $(id).attr('title', title_value);
      }
    };
    update_stat_values = function(sample_sets) {
      var category, row, _i, _len, _ref, _results;
      _ref = ['samples_primary', 'samples_other', 'samples_all'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        category = _ref[_i];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = Stat_Table_Rows.length; _j < _len1; _j++) {
            row = Stat_Table_Rows[_j];
            console.log("Calling change_stats_value");
            _results1.push(change_stats_value(sample_sets, category, row.vn, row.digits));
          }
          return _results1;
        })());
      }
      return _results;
    };
    edit_data_change = function() {
      var already_seen, checkbox, checked, name, real_value, row, rows, sample_sets, table, tables, _i, _j, _len, _len1;
      already_seen = {};
      sample_sets = {
        samples_primary: new Stats([]),
        samples_other: new Stats([]),
        samples_all: new Stats([])
      };
      console.log("at beginning:", sample_sets);
      tables = ['samples_primary', 'samples_other'];
      for (_i = 0, _len = tables.length; _i < _len; _i++) {
        table = tables[_i];
        rows = $("#" + table).find('tr');
        for (_j = 0, _len1 = rows.length; _j < _len1; _j++) {
          row = rows[_j];
          name = $(row).find('.edit_sample_sample_name').html();
          name = $.trim(name);
          real_value = $(row).find('.edit_sample_value').val();
          console.log("real_value:", real_value);
          checkbox = $(row).find(".edit_sample_checkbox");
          checked = $(checkbox).attr('checked');
          if (checked && is_number(real_value) && real_value !== "") {
            console.log("in the iffy if");
            real_value = parseFloat(real_value);
            sample_sets[table].add_value(real_value);
            console.log("checking name of:", name);
            if (!(name in already_seen)) {
              console.log("haven't seen");
              sample_sets['samples_all'].add_value(real_value);
              already_seen[name] = true;
            }
          }
        }
      }
      console.log("towards end:", sample_sets);
      return update_stat_values(sample_sets);
    };
    make_table = function() {
      var header, key, row, row_line, table, the_id, the_rows, value, _i, _len, _ref, _ref1;
      header = "<thead><tr><th>&nbsp;</th>";
      console.log("js_data.sample_group_types:", js_data.sample_group_types);
      _ref = js_data.sample_group_types;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
        console.log("aa key:", key);
        console.log("aa value:", value);
        the_id = process_id("column", key);
        header += "<th id=\"" + the_id + "\">" + value + "</th>";
      }
      header += "</thead>";
      console.log("windex header is:", header);
      the_rows = "<tbody>";
      for (_i = 0, _len = Stat_Table_Rows.length; _i < _len; _i++) {
        row = Stat_Table_Rows[_i];
        console.log("rowing");
        row_line = "<tr>";
        if (row.url != null) {
          row_line += "<td id=\"" + row.vn + "\"><a href=\"" + row.url + "\">" + row.pretty + "</a></td>";
        } else {
          row_line += "<td id=\"" + row.vn + "\">" + row.pretty + "</td>";
        }
        console.log("box - js_data.sample_group_types:", js_data.sample_group_types);
        _ref1 = js_data.sample_group_types;
        for (key in _ref1) {
          if (!__hasProp.call(_ref1, key)) continue;
          value = _ref1[key];
          console.log("apple key:", key);
          the_id = process_id(key, row.vn);
          console.log("the_id:", the_id);
          row_line += "<td id=\"" + the_id + "\">foo</td>";
        }
        row_line += "</tr>";
        console.log("row line:", row_line);
        the_rows += row_line;
      }
      the_rows += "</tbody>";
      table = header + the_rows;
      console.log("table is:", table);
      return $("#stats_table").append(table);
    };
    process_id = function() {
      var processed, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      /* Make an id or a class valid javascript by, for example, eliminating spaces
      */

      processed = "";
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        console.log("value:", value);
        value = value.replace(" ", "_");
        if (processed.length) {
          processed += "-";
        }
        processed += value;
      }
      return processed;
    };
    show_hide_outliers = function() {
      var label;
      console.log("FOOBAR in beginning of show_hide_outliers");
      label = $('#show_hide_outliers').val();
      console.log("lable is:", label);
      if (label === "Hide Outliers") {
        return $('#show_hide_outliers').val("Show Outliers");
      } else if (label === "Show Outliers") {
        console.log("Found Show Outliers");
        $('#show_hide_outliers').val("Hide Outliers");
        return console.log("Should be now Hide Outliers");
      }
    };
    on_corr_method_change = function() {
      var corr_method;
      console.log("in beginning of on_corr_method_change");
      corr_method = $('select[name=corr_method]').val();
      console.log("corr_method is:", corr_method);
      $('.correlation_desc').hide();
      $('#' + corr_method + "_r_desc").show().effect("highlight");
      if (corr_method === "lit") {
        return $("#corr_sample_method_options").hide();
      } else {
        return $("#corr_sample_method_options").show();
      }
    };
    $('select[name=corr_method]').change(on_corr_method_change);
    create_value_dropdown = function(value) {
      return "<option val=" + value + ">" + value + "</option>";
    };
    populate_sample_attributes_values_dropdown = function() {
      var attribute_info, key, sample_attributes, selected_attribute, value, _i, _len, _ref, _ref1, _results;
      console.log("in beginning of psavd");
      $('#attribute_values').empty();
      sample_attributes = {};
      _ref = js_data.attribute_names;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        attribute_info = _ref[key];
        sample_attributes[attribute_info.name] = attribute_info.distinct_values;
      }
      console.log("[visa] attributes is:", sample_attributes);
      selected_attribute = $('#exclude_menu').val().replace("_", " ");
      console.log("selected_attribute is:", selected_attribute);
      _ref1 = sample_attributes[selected_attribute];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        value = _ref1[_i];
        _results.push($(create_value_dropdown(value)).appendTo($('#attribute_values')));
      }
      return _results;
    };
    if (js_data.attribute_names.length > 0) {
      populate_sample_attributes_values_dropdown();
    }
    $('#exclude_menu').change(populate_sample_attributes_values_dropdown);
    block_by_attribute_value = function() {
      var attribute_name, cell_class, exclude_by_value,
        _this = this;
      attribute_name = $('#exclude_menu').val();
      exclude_by_value = $('#attribute_values').val();
      cell_class = ".column_name-" + attribute_name;
      return $(cell_class).each(function(index, element) {
        var row;
        if ($.trim($(element).text()) === exclude_by_value) {
          row = $(element).parent('tr');
          return $(row).find(".trait_value_input").val("x");
        }
      });
    };
    $('#exclude_group').click(block_by_attribute_value);
    block_by_index = function() {
      var end_index, index, index_list, index_set, index_string, start_index, _i, _j, _k, _len, _len1, _ref, _results;
      index_string = $('#remove_samples_field').val();
      index_list = [];
      _ref = index_string.split(",");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        index_set = _ref[_i];
        if (index_set.indexOf('-') !== -1) {
          try {
            start_index = parseInt(index_set.split("-")[0]);
            end_index = parseInt(index_set.split("-")[1]);
            for (index = _j = start_index; start_index <= end_index ? _j <= end_index : _j >= end_index; index = start_index <= end_index ? ++_j : --_j) {
              index_list.push(index);
            }
          } catch (error) {
            alert("Syntax error");
          }
        } else {
          index = parseInt(index_set);
          console.log("index:", index);
          index_list.push(index);
        }
      }
      console.log("index_list:", index_list);
      _results = [];
      for (_k = 0, _len1 = index_list.length; _k < _len1; _k++) {
        index = index_list[_k];
        if ($('#block_group').val() === "primary") {
          console.log("block_group:", $('#block_group').val());
          console.log("row:", $('#Primary_' + index.toString()));
          _results.push($('#Primary_' + index.toString()).find('.trait_value_input').val("x"));
        } else if ($('#block_group').val() === "other") {
          console.log("block_group:", $('#block_group').val());
          console.log("row:", $('#Other_' + index.toString()));
          _results.push($('#Other_' + index.toString()).find('.trait_value_input').val("x"));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    $('#block_by_index').click(block_by_index);
    hide_no_value = function() {
      var _this = this;
      return $('.value_se').each(function(_index, element) {
        if ($(element).find('.trait_value_input').val() === 'x') {
          return $(element).hide();
        }
      });
    };
    $('#hide_no_value').click(hide_no_value);
    block_outliers = function() {
      var _this = this;
      return $('.outlier').each(function(_index, element) {
        return $(element).find('.trait_value_input').val('x');
      });
    };
    $('#block_outliers').click(block_outliers);
    reset_samples_table = function() {
      var _this = this;
      return $('.trait_value_input').each(function(_index, element) {
        console.log("value is:", $(element).val());
        $(element).val($(element).data('value'));
        console.log("data-value is:", $(element).data('value'));
        return $(element).parents('.value_se').show();
      });
    };
    $('#reset').click(reset_samples_table);
    get_sample_table_data = function() {
      var other_samples, primary_samples, samples,
        _this = this;
      samples = {};
      primary_samples = [];
      other_samples = [];
      $('#sortable1').find('.value_se').each(function(_index, element) {
        var attribute_info, key, row_data, _ref;
        row_data = {};
        row_data.name = $.trim($(element).find('.column_name-Sample').text());
        row_data.value = $(element).find('.edit_sample_value').val();
        if ($(element).find('.edit_sample_se').length !== -1) {
          row_data.se = $(element).find('.edit_sample_se').val();
        }
        _ref = js_data.attribute_names;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          attribute_info = _ref[key];
          row_data[attribute_info.name] = $.trim($(element).find('.column_name-' + attribute_info.name.replace(" ", "_")).text());
        }
        console.log("row_data is:", row_data);
        return primary_samples.push(row_data);
      });
      console.log("primary_samples is:", primary_samples);
      samples.primary_samples = primary_samples;
      samples.other_samples = other_samples;
      return samples;
    };
    export_sample_table_data = function() {
      var format, json_sample_data, sample_data;
      sample_data = get_sample_table_data();
      console.log("sample_data is:", sample_data);
      json_sample_data = JSON.stringify(sample_data);
      console.log("json_sample_data is:", json_sample_data);
      $('input[name=export_data]').val(json_sample_data);
      console.log("export_data is", $('input[name=export_data]').val());
      format = $('#export_format').val();
      if (format === "excel") {
        $('#trait_data_form').attr('action', '/export_trait_excel');
      } else {
        $('#trait_data_form').attr('action', '/export_trait_csv');
      }
      console.log("action is:", $('#trait_data_form').attr('action'));
      return $('#trait_data_form').submit();
    };
    $('#export').click(export_sample_table_data);
    console.log("before registering block_outliers");
    $('#block_outliers').click(block_outliers);
    console.log("after registering block_outliers");
    _.mixin(_.str.exports());
    $('#edit_sample_lists').change(edit_data_change);
    console.log("loaded");
    make_table();
    edit_data_change();
    return console.log("end");
  });

}).call(this);
