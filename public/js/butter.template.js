Butter.Template = function() {
  var t = {};

  t.showTray = function( show ){
    t.debug && console.log ( "template.showTray", show );
    t.butter && show === true && ( t.butter.ui.visible = true );
    t.butter && show === false && ( t.butter.ui.visible = false );
  }

  t.getTrackEvents = function( query ) {
    t.debug && console.log ( "getTrackEvents", query );
    var obj = {},
        i,
        currentTime,
        allTracks,
        result;

    t.butter && ( allTracks = t.butter.orderedTrackEvents );
    //Parse the query....
    if( query === "all" ) {
      result = allTracks.filter(function(tr) {
        return( t.popcornOptions !== undefined );
      });
    }
    //Currently running track events
    else if( query === "active") {
      currentTime = t.butter.currentTime;
      result = allTracks.filter( function( el, index ) {
        //if current time >= el.popcornOptions.start && 
        return( currentTime >= el.popcornOptions.start && currentTime <= el.popcornOptions.end );
      });
    }
    //getTrackEvents( 1 );
    else if( typeof query === "number" ) {
      result = allTracks[ query ];
    }
     //getTrackEvents( "text" );
    else if( typeof query === "string" ) {
      result = allTracks.filter( function( el, index ) {
        return( el.type && el.type === query );
      });
    }
     //getTrackEvents( myEvent );
    else if ( typeof query === "object" && query.popcornOptions ) {
      result = query;
    }
    else if ( typeof query === "object" ) {
      result = allTracks.filter( function( el, index ) {

        // getTrackEvents({ before: ... });
        if( query.before && el.popcornOptions.start > query.before ) { return false; }

        // getTrackEvents({ after: ... });
        if( query.after && el.popcornOptions.start < query.after ) { return false; }

        // getTrackEvents({ target: Area1 });
        if( query.target && el.popcornOptions.target !== query.target ) { return false; }

        // getTrackEvents({ isActive: true });
        if( query.isActive ) { 
          currentTime = t.butter.currentTime;
          if( !( currentTime >= el.popcornOptions.start && currentTime <= el.popcornOptions.end ) ){ return false; }
        }

        // getTrackEvents({ type: "text" });
        if( query.type && typeof query.type === "string" ) {
          if( el.type !== query.type ) { return false; }
        //getTrackEvents({ type: ["text","footnote"] });
        } else if ( query.type && typeof query.type === "object") {
           if( query.type.indexOf( el.type ) < 0 ) { return false; }
        }

        //getTrackEvents({ index: 1 });
        if( query.index && typeof query.index === "number" ) {
          if( query.index !== index ) { return false; }
        //getTrackEvents({ index: [1, 2] });
        } else if ( query.index && typeof query.index === "object" ) {
          if( query.index.indexOf( index ) < 0 ) { return false; }
        }

        return true;

      });
    }

    //Return the track event if there was only one, and an array if more than one were found.
    if( !result || result.length === 0 ) { return obj.data = false; }
    else if( result. length === 1 ) { obj.data = result[0] }
    else ( obj.data = result );

    t.debug && console.log( "getTrackEvents", query, obj.data );

    obj.foo = function() {
      return "bar";
    }

    obj.update = function( data ) { 
      t.debug && console.log( "update", this, data );
      if( !data ){ return; }

      function _update( trackEvent ) {
        var oldOptions = trackEvent.popcornOptions, option;

        for (var option in oldOptions ) {
          data.option || ( data.option = oldOptions[ option ] );
        }

        trackEvent.update( data );
      }

      if( this.data instanceof Array ) { t.each( this.data, _update ); }
      else { _update( this.data ); }
    }

    obj.remove = function() {
      t.debug && console.log( "remove", this );
      if( !this.data ){ return; }
      function _remove( trackEvent ) {
        trackEvent.track.removeTrackEvent( trackEvent );
      }
      if( this.data instanceof Array ) { t.each( this.data, _remove ); }
      else { _remove( this.data ); }
    }

    return obj;
  }

  t.editor = function() {
    //if( args === undefined ) { return; }

    var editor = {};
    /*
        _id = args.id || plugin + "-editor",
        _onTrackEventUpdate = args.onTrackEventChange,
        _onTrayElementClick = args.onTrayElementClick,
        _onTargetClick = args.onTargetClick,
        _onShowPanel = args.onShowPanel;
    */
    editor.modal = function() {

    }

    editor.imageDropper = function() {

    }

    editor.tabs = function() { 

    }

    editor.openTrayEditor = function( trackEvent ){
       //Not working t.butter.dispatch( "trackeventdoubleclicked", { originalEvent: null, trackEvent: trackEvent } );
    };

    editor.makeContentEditable = function(element) {

      if(element instanceof NodeList || element instanceof Array ) {
        t.each(element, function(el){
          _makeContentEditable(el);
        });
      } else {
        _makeContentEditable(element);
      }

      function _makeContentEditable(element) { 
        var data = {},
            currentTime = t.butter.currentTime;

          window.addEventListener("keydown", preventSpacebarPlay, false);
          
          function preventSpacebarPlay(e) {
            if( e.keyCode === 32 ){
              t.butter.media[0].pause();
              t.butter.currentTime = currentTime;
            } 
            else if (e.keyCode === 13) {
              if( e.shiftKey ) { return true; } 
              e.preventDefault();
              window.removeEventListener("keydown", preventSpacebarPlay );
              data["text"] = htmlfy( element.innerHTML );
              element.innerHTML = data["text"];
              element.setAttribute("contenteditable", false);
              if( t._editing ) {
                t._editing.update( data );
                t.debug && console.log( t.name + ": Changed " + JSON.stringify(data).replace(/\</g, "&lt;").replace(/\>/g, "&gt;") );
              }
            }
            else if (e.keyCode === 8) {
              return false; //Prevent accidentally deleting track events
            }
          }

          element.setAttribute("contenteditable", true);
         
        }
      }

    function htmlfy( str ) {
        return str.replace(/&lt;i&gt;/g, "<i>")
                  .replace(/&lt;\/i&gt;/g, "</i>")
                  .replace(/&lt;em&gt;/g, "<em>")
                  .replace(/&lt;\/em&gt;/g, "</em>")
                  .replace(/&lt;b&gt;/g, "<b>")
                  .replace(/&lt;\/b&gt;/g, "</b>")
                  .replace(/&lt;strong&gt;/g, "<strong>")
                  .replace(/&lt;\/strong&gt;/g, "</strong>");
      }    

    return editor;
  }

  t.reset = function() {
    var allTracks = t.getTrackEvents("all");
    console.log("all", allTracks);
    //there seems to be a problem with this getting all the popcorn instances
    allTracks.remove();
  }

  if( window.Popcorn ) { t.each = Popcorn.forEach; }

  t.each = function( array, func ) {
    var i;
    for ( i = 0; i<array.length; i++ ) {
      (function( item ) {
        func( item );  
      }( array[i] ));
    }
  }
  

  t.children = function( elem, fn ) {
    var children = Array.prototype.slice.call( elem.children );
    var results = children.filter( fn );

    if (results.length === 0) { return false; }
    else if (results.length === 1) { return results[0]; }
    else { return results; }
  }

  t.tests = function() {
    //Test get track events
  }

  t.eventWrapper = function( media, event ) {
    //a work-around to wrap events in an event listener so they don't load before popcorn is ready.
    media.popcornScripts = {};
    media.popcornScripts.beforeEvents = 'popcorn.on( "' + event + '", popcornEvents );\nfunction popcornEvents() { ';
    media.popcornScripts.afterEvents = '\npopcorn.off( "' + event + '", popcornEvents );\n}'
  }

  return t;
}
