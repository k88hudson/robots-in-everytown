// PLUGIN: FILMGRAIN

(function ( Popcorn ) {

function transformGrain( element, w, h ){
  var x = Math.random() * w,
      y = Math.random() * h,
      opacity = Math.random(),
      rotation = Math.random() * 360;

  element.style.webkitTransform = "rotate("+rotation+"deg)";
  element.style.mozTranform = "rotate("+rotation+"deg)";
  element.style.top = y + "px";
  element.style.left = x + "px";
  element.style.opacity = opacity;
}

/**
 This 
 */
  Popcorn.plugin( "filmgrain", {
      manifest: {
        about: {
          name: "Popcorn film grain plugin",
          version: "0.1",
          author: "Kate Hudson",
          website: "http://github.com/k88hudson"
        },
        options: {
          start: {
            elem: "input",
            type: "number",
            label: "In"
          },
          end: {
            elem: "input",
            type: "number",
            label: "Out"
          },
          width: {
            elem: "input",
            type: "number",
            label: "Width (px)",
            "default": 700,
            editable: true
          },
          height: {
            elem: "input",
            type: "number",
            label: "Height (px)",
            "default": 480,
            editable: true
          },
          pluginDirectory: {
            elem: "input",
            type: "text",
            label: "Plugin directory (e.g. js/filmgrain/)",
            "default": "js/plugins/filmgrain/"
          },
          target: "video-overlay",
        }
      },
      _setup: function( options ) {
        var img,
            target = document.getElementById( options.target );

        options.pluginDirectory = options.pluginDirectory;

        options._img1 = document.createElement( "div" );
        options._img1.style.position = "absolute";
        options._img1.style.display = "none";
        options._img1.innerHTML = "<img src=\""+options.pluginDirectory+"scratch1.png\">";

        options._img2 = document.createElement( "div" );
        options._img2.style.position = "absolute";
        options._img2.style.display = "none";
        options._img2.innerHTML = "<img src=\""+options.pluginDirectory+"scratch2.png\">";

        options._img3 = document.createElement( "div" );
        options._img3.style.position = "absolute";
        options._img3.style.display = "none";
        options._img3.innerHTML = "<img src=\""+options.pluginDirectory+"scratch3.png\">";

        options._line = document.createElement( "div" );
        options._line.style.height = options.height + "px";
        options._line.style.position = "absolute";
        options._line.style.top = 0;
        options._line.style.width = "1px";
        options._line.style.display = "none";
        options._line.style.background = "#FFF";

        if ( !target && Popcorn.plugin.debug ) {
          throw new Error( "target container doesn't exist" );
        }
        // add the widget's div to the target div
        target && target.appendChild( options._img1 );
        target && target.appendChild( options._img2 );
        target && target.appendChild( options._img3 );
        target && target.appendChild( options._line );
        
      },
      start: function( event, options ) {
        options._img1.style.display = "block";
        options._img2.style.display = "block";
        options._img3.style.display = "block";
        options._line.style.display = "block";
      },
      frame: function( event, options, time ) {
        transformGrain( options._img1, options.width, options.height);
        transformGrain( options._img2, options.width, options.height);
        transformGrain( options._img3, options.width, options.height);
        options._line.style.left = Math.random() * options.width + "px";
        options._line.style.opacity = .5 - (Math.random() * .8);
      },
      end: function( event, options ) {
        options._img1.style.display = "none";
        options._img2.style.display = "none";
        options._img3.style.display = "none";
        options._line.style.display = "none";
      },
      _teardown: function( options ) {
        document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._img1 );
        document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._img2 );
        document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._img3 );
        document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._line );
      }
  });
})( Popcorn );
