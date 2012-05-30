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
          top: {
            elem: "input",
            type: "number",
            label: "Top(px)"
          },
          left: {
            elem: "input",
            type: "number",
            label: "Left(px)"
          },
          containerID: {
            elem: "input",
            type: "text",
            label: "Container ID"
          },
          containerClasses: {
            elem: "input",
            type: "text",
            label: "Container Classes"
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
          innerClasses: {
            elem: "input",
            type: "text",
            label: "Inner Classes"
          },
          target: "video-overlay"
        }
      },
    _setup: function( options ) {

      var transition, 
          defaults,
          appendContainer = true, //false if it uses an existing div
          i;

      //Set the defaults;
      defaults = {
        text: "Robots rule",
        containerID: "title1",
        containerClasses: "titlecard",
        defaultTransition: 0.5,
        innerCSS: "font-family: 'Jolly Lodger', Georgia; font-size: 80px; text-transform: uppercase;",
        innerClasses: "rumble-light blur",
        baseClass: "supertext-container",
        inactiveClass: "supertext-off",
        activeClass: "supertext-on",
        target: "video-overlay"
      };

      if( !options.baseClass ) { options.baseClass = defaults.baseClass; }
      if( !options.inactiveClass ) { options.inactiveClass =  defaults.inactiveClass; }
      if( !options.activeClass ) { options.activeClass = defaults.activeClass; }
      if( !options.text) { options.text = defaults.text; }
      if( !options.innerCSS ) { options.innerCSS = defaults.innerCSS; }
      if( !options.innerClasses ) { options.innerClasses = defaults.innerClasses; }
      if( !options.containerClasses ) { options.containerClasses = defaults.containerClasses; }

      //Resetting stylesheet for a new default transition
      if( options.defaultTransition && styleSheet ) {
        styleSheet.parentNode.removeChild( styleSheet );
        styleSheet = undefined;
      }

      //Create the stylesheet if it is not set
      if(! styleSheet) {

        if( options.defaultTransition ) { transition = options.defaultTransition/1000 }
        else { transition = defaults.defaultTransition; }

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

        document.head.appendChild(styleSheet);
      }

      options._target = document.getElementById( options.target );

      //Check for the container div option, else create a new div
      if( options.containerID ){
        options._container = document.getElementById(options.containerID);
        appendContainer = false;
      } else {
        options._container = document.createElement("div");
      }

      options._container.className = options.baseClass + " " + options.inactiveClass;
      options._container.classList.add( options.baseClass );
      options._container.classList.add( options.inactiveClass );
      options.containerClasses && ( options._container.className += " " + options.containerClasses );

      //Stupid hack for f*d up fonts
      if( options.innerClasses &&  options.innerClasses.indexOf("padWithSpaces") !== -1 ) {
        options.text.indexOf("&nbsp;&nbsp;") === -1 && ( options.text = "&nbsp;&nbsp;" + options.text + "&nbsp;&nbsp;" );
      }

      options._innerDiv = document.createElement("div");
      options._innerDiv.setAttribute("role", "supertext");
      options.innerCSS && ( options._innerDiv.style.cssText = options.innerCSS );
      options.innerClasses &&  ( options._innerDiv.className = options.innerClasses );
      options._innerDiv.innerHTML  = options.text;

      options._container.appendChild( options._innerDiv );
      options._target && appendContainer && options._target.appendChild( options._container );
      
    },

    start: function( event, options ){  
      removeClass(options._container, options.inactiveClass);
      addClass(options._container, options.activeClass);
    },
   
    end: function( event, options ){
      removeClass(options._container, options.activeClass);
      addClass(options._container, options.inactiveClass);
    },
    _teardown: function( options ) {
      options._container.removeChild( options._innerDiv );
      options._target && appendContainer && options._target.removeChild( options._container );
    }
  });

  //Helpers
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
