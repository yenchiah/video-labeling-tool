(function () {
  "use strict";

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // Create the class
  //
  var Util = function () {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Variables
    //

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Private methods
    //

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Privileged methods
    //
    // Safely get the value from a variable, return a default value if undefined
    var safeGet = function (v, default_val) {
      if (typeof default_val === "undefined") default_val = "";
      return (typeof v === "undefined") ? default_val : v;
    };
    this.safeGet = safeGet;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Public methods
    //
    // Get the the root url of the API
    this.getRootApiUrl = function () {
      var root_url;
      var url_hostname = window.location.hostname;
      var is_localhost = url_hostname.indexOf("localhost");
      var is_staging = url_hostname.indexOf("staging");
      if (is_localhost >= 0) {
        root_url = "http://localhost:5000/api/v1/";
      } else {
        if (is_staging >= 0) {
          root_url = "https://staging.api.smoke.createlab.org/api/v1/";
        } else {
          root_url = "https://api.smoke.createlab.org/api/v1/";
        }
      }
      return root_url;
    };

    // Get the the Google Analytics id
    this.getGoogleAnalyticsId = function () {
      var ga_id;
      var url_hostname = window.location.hostname;
      var is_localhost = url_hostname.indexOf("localhost");
      var is_staging = url_hostname.indexOf("staging");
      if (is_localhost >= 0) {
        ga_id = "UA-10682694-25";
      } else {
        if (is_staging >= 0) {
          ga_id = "UA-10682694-25";
        } else {
          ga_id = "UA-10682694-26";
        }
      }
      return ga_id;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Constructor
    //
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // Register to window
  //
  if (window.edaplotjs) {
    window.edaplotjs.Util = Util;
  } else {
    window.edaplotjs = {};
    window.edaplotjs.Util = Util;
  }
})();