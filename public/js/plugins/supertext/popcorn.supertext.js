// PLUGIN: Footnote/Text

(function ( Popcorn ) {

  /**
   * This is a modified form of the Footnote popcorn plug-in
   * Instead of hiding/showing using style.display, it adds and removes an 'active' class.
   * Required options are start, end, and text. Other options are optional.
   * If you do not specify a target, supertext will generate subtitles.
   *
   * Example:
     var p = Popcorn('#video')
        .supertext({
          start: 5, // seconds
          end: 15, // seconds
          text: 'This video made exclusively for drumbeat.org',
          defaultTransition: 400, //in milliseconds
          baseClass: 'supertext',
          activeClass: 'active',
          target: 'targetdiv',
          callback: function() {
            console.log("Supertext is playing!");
          }
        });
   *
   */
    var styleSheet, subtitleStyleSheet, subtitleContainer;

    Popcorn.plugin( "supertext" , {

      manifest: {
        about: {
          name: "Popcorn supertext Plugin",
          version: "0.1",
          author: "@k88hudson",
          website: "http://k88.ca"
        },
        options: {
          text: {
            elem: "input",
            type: "text",
            label: "Text"
          },
          start: {
            elem: "input",
            type: "number",
            label: "Start"
          },
          end: {
            elem: "input",
            type: "number",
            label: "End"
          },
          defaultTransition: {
            elem: "input",
            type: "number",
            label: "Default Transition Time (in milliseconds)"
          },
          innerCSS: {
            elem: "input",
            type: "text",
            label: "Inner CSS"
          },
          innerDivStyles: {
            elem: "input",
            type: "text",
            label: "Inner Div CSS"
          },
          innerClasses: {
            elem: "input",
            type: "text",
            label: "Inner Classes"
          },
          target: "supertext-container"
        }
      },
    _setup: function( options ) {

      var transition, innerDivStyles;

      if( options.defaultTransition && styleSheet ) {
        styleSheet.parentNode.removeChild( styleSheet );
        styleSheet = undefined;
      }

      //Create the stylesheet if it is not set
      if(! styleSheet) {
        if( options.defaultTransition ) {
          transition = options.defaultTransition/1000 
        }
        else {
          transition = .5;
        }

        styleSheet = document.createElement('style');
        styleSheet.setAttribute('type', 'text/css');
        styleSheet.appendChild(
          document.createTextNode(
            '.supertext-container {\n' +
            '  overflow: hidden;\n' +
            '}\n' +
            ' .supertext-on {\n' +
            '  visibility: visible;\n' +
            '  opacity: 1;\n' +
            '  /* Show */\n' +
            '  -webkit-transition: opacity '+transition+'s linear '+transition+'s;\n' +
            '  -moz-transition: opacity '+transition+'s linear '+transition+'s;\n' +
            '  -o-transition: opacity '+transition+'s linear '+transition+'s;\n' +
            '  transition: opacity '+transition+'s linear '+transition+'s;\n' +
            '}\n' +
            ' .supertext-off {\n' +
            '  visibility: hidden;\n' +
            '  opacity: 0;\n' +
            '  /* Hide */\n' +
            '  -webkit-transition: visibility 0s '+transition+'s, opacity '+transition+'s linear;\n' +
            '  -moz-transition: visibility 0s '+transition+'s, opacity '+transition+'s linear;\n' +
            '  -o-transition: visibility 0s '+transition+'s, opacity '+transition+'s linear;\n' +
            '  transition: visibility 0s '+transition+'s, opacity '+transition+'s linear;\n' +
            '}\n' +
            ' .supertext-off > div {\n' +
            '  margin-top: -10000px;\n' +
            '  -webkit-transition: margin-top 0s '+transition+'s;\n' +
            '  -moz-transition: margin-top 0s '+transition+'s;\n' +
            '  -o-transition: margin-top 0s '+transition+'s;\n' +
            '  transition: margin-top 0s '+transition+'s;\n' +
            '}\n'
        ));

       // var headElements = document.head.childNodes;
        document.head.appendChild(styleSheet);
      }

      options._target = document.getElementById( options.target );

      //Check if the target container exists
      if ( !options._target && !subtitleContainer) {
        if(!subtitleStyleSheet) {
          subtitleStyleSheet = document.createElement("style");
          subtitleStyleSheet.setAttribute('type', 'text/css');
          document.head.appendChild(subtitleStyleSheet);
        }
        console.log("subs", this);
        subtitleContainer = createDefaultContainer( this, "supertext-subtitles-" + this.media.id )
        subtitleContainer.className = "supertext-subtitles";
        subtitleStyleSheet.appendChild(
        document.createTextNode( '.supertext-subtitles { \n'+
          '  font-family: "Helvetica Neue", Helvetica, sans-serif;\n'+
          '  text-align: center;\n'+
          '  text-shadow: 0 0 4px #000;\n'+
          '  color: #FFF;\n'+
          '}\n'+
          'supertext-subtitles .supertext-container {\n'+
          '  position: absolute;\n' +
          '  bottom: 0px;\n'+
          '  width: 100%;\n'+
          '}\n'
        ));
      }

      if ( !options._target ) {
        options._target = subtitleContainer;
      }

      //Check if active and base classes are provided
      if( !options.baseClass ) {
        options.baseClass = "supertext-container";
      }
      if( !options.inactiveClass ) {
        options.inactiveClass = "supertext-off";
      }
      if( !options.activeClass ) {
        options.activeClass = "supertext-on";
      }
        
      options._container = document.createElement( "div" );
      options._container.className = options.baseClass + " " + options.inactiveClass;

      innerDivStyles = "";
      options.innerCSS && ( innerDivStyles += ' style="'+ options.innerCSS + '"');
      options.innerClasses &&  ( innerDivStyles += ' class="'+ options.innerClasses +'"' );
      options._container.innerHTML  = '<div' + innerDivStyles + '>' + options.text + '</div>';
      options._target && options._target.appendChild( options._container );

      //Run the callback
      if(typeof options.callback === "function") {
        options.callback();
      }

    },
  
    start: function( event, options ){
      //Hide other active elements in the target container first
      var activeElements = options._target.querySelectorAll("."+options.activeClass);
      for(var i=0;i<activeElements.length;i++) {
        removeClass(activeElements[i], options.activeClass);
        addClass(activeElements[i], options.inactiveClass);
      }
      removeClass(options._container, options.inactiveClass);
      addClass(options._container, options.activeClass);
    },
   
    end: function( event, options ){
      removeClass(options._container, options.activeClass);
      addClass(options._container, options.inactiveClass);
    },
    _teardown: function( options ) {
      options._target && options._target.removeChild( options._container );
    }
  });

  //Helpers

  //Modified from subtitle plugin
  createDefaultContainer = function( context, containerID ) {

    var ctxContainer = context.container = document.createElement( "div" ),
        style = ctxContainer.style,
        media = context.media;

    console.log( "sub", context.position(), context.media.offsetTop, context.media.offsetLeft, context.media.offsetHeight, context.media.parentNode.offsetHeight );

    var updatePosition = function() {
      //var position = context.position();
      style.width = media.offsetWidth + "px";
      style.top = media.offsetTop + media.offsetHeight - ctxContainer.offsetHeight - 40 + "px";
      style.left = media.offsetLeft  + "px";

      setTimeout( updatePosition, 10 );
    };

    ctxContainer.id = containerID || "supertext-subtitles-" + Popcorn.guid();

    style.position = "absolute";
    updatePosition();

    context.media.parentNode.appendChild( ctxContainer );

    return ctxContainer; 
  };

  function hasClass(el, name) {
    return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
  }
  function addClass(el, name) {
    if (!hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
  }
  function removeClass(el, name) {
   if (hasClass(el, name)) {
      el.className=el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
   }
  }

})( Popcorn );
