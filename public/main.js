document.addEventListener( "DOMContentLoaded", function( e ){
  
  (function( Butter ) {
    var t = new Butter.Template();
    t.name = "Robots in evertown";
    t.config = "template.conf";
    t.debug = true, //Comment out for production
    editor = new t.editor();

    t.butterInit = function( butter, media, popcorn, callback ) {
    // This function runs only once, when butter initializes. 
    // You should create tracks & starting track events here.

      //Add tracks
       var track = media.addTrack( "Track1" );
        media.addTrack( "Track" + Math.random() );
        media.addTrack( "Track" + Math.random() );

        var event = track.addTrackEvent({
          type: "text",
          popcornOptions: {
            start: 0,
            end: 3,
            text: "test",
            target: "Area1"
          }
        });

        butter.tracks[ 2 ].addTrackEvent({ 
          type: "zoink",
          popcornOptions: {
            start: 1,
            end: 2,
            text: "hello world",
            target: "Area2"
          }
        });

        butter.tracks[ 2 ].addTrackEvent({ 
          type: "filmgrain",
          popcornOptions: {
            start: 0,
            end: 10,
            width: 700,
            height: 442,
            target: "video-overlay"
          }
        });

        butter.tracks[ 1 ].addTrackEvent({ 
          type: "supertext",
          popcornOptions: {
            start: 0,
            end: 10,
            text: "Robots in everytown",
            innerClasses: "rumble-light blur",
            innerCSS: "font-family: 'Jolly Lodger', Georgia; font-size: 80px; text-transform: uppercase;",
            target: "video-overlay-2"
          }
        });
        
        //Callback
        callback && callback();
    }

    t.initCallback = function(){
    // This function runs after butter first initializes.
      t.showTray( true );
    }

    t.butterMediaLoaded = function( butter, media, popcorn ) {
    // This function runs every time the media source changes, or a project is loaded.

    //Prevent duplication of event listeners
      butter.unlisten("trackeventadded", updateFunction);
      butter.unlisten("trackeventupdated", updateFunction);

    //Add listeners for future track events.
      butter.listen("trackeventadded", updateFunction);
      butter.listen("trackeventupdated", updateFunction);

    //Apply the editing functions to the existing track events 
      t.each(t.butter.orderedTrackEvents, function(trackEvent){
        var _popcornOptions = trackEvent.popcornOptions;
        trackEvent.update( _popcornOptions );
      });

      function updateFunction(e) {
        var trackEvent,
            _container = null,
            _textEls;

        if (e.type==="trackeventadded") { trackEvent = e.data; }
        else if (e.type==="trackeventupdated") { trackEvent = e.target; }
        else { trackEvent = e; }

        trackEvent.popcornTrackEvent = popcorn.getTrackEvent( popcorn.getLastTrackEventId() ); //Store a reference
        _container = trackEvent.popcornTrackEvent._container;
        if (!_container ) { return; }

      
        if( trackEvent.type === "supertext" || trackEvent.type === "text" ) {
          trackEvent.view.listen("trackeventdoubleclicked", function(){
            t._editing = trackEvent;
            editor.makeContentEditable( _container );
          });
          _container.addEventListener("dblclick", function(e){
            t._editing = trackEvent;
            editor.makeContentEditable( _container );
            t.debug && console.log( t.name + ": Editing t._editing = (" + t._editing.id + ")", t._editing );  
          });
        }

        else if( trackEvent.type === "zoink" ) {
          _container.addEventListener("dblclick", function(e){
            t._editing = trackEvent;

            textEls = _container.querySelectorAll(".text");
            editor.makeContentEditable( textEls );

            window.$ && $(_container).draggable("disable");
          });
          window.$ && $( _container ).draggable({
            stop: function(event, ui) {
                trackEvent.update({top: ui.position.top + "px", left: ui.position.left + "px" });
            }
          });
        }

        else if( trackEvent.type === "image" ) {
          trackEvent.popcornTrackEvent._image.addEventListener("mousedown", function(e){
            e.preventDefault();
          }, false);
          window.$ && $( _container ).resizable({
            start: function(event, ui) {
              _container.style.border = "2px dashed #CCC";
            },
            stop: function(event, ui) {
              _container.style.border = "";
              trackEvent.update({ height: ui.size.height + "px", width: ui.size.width + "px" })
            }
          }).draggable({
            stop: function(event, ui) {
                trackEvent.update({top: ui.position.top + "px", left: ui.position.left + "px" });
            }
          });

          /* Drag and drop DataURI */
          var canvas = document.createElement( "canvas" ),
              context,
              dropTarget,
              field;

          canvas.id = "grabimage";
          canvas.style.display = "none";

          dropTarget = _container;

          dropTarget.addEventListener( "dragover", function( event ) {
            event.preventDefault();
            dropTarget.className = "dragover";
          }, false);

          dropTarget.addEventListener( "dragleave", function( event ) {
            event.preventDefault();
            dropTarget.className = "";
          }, false);

          dropTarget.addEventListener( 'drop', function( event ) {
            dropTarget.className = "dropped";
            event.preventDefault();
            var file = event.dataTransfer.files[ 0 ],
                imgSrc,
                image,
                imgURI;

            if( !file ) { return; }

            if( window.URL ) { 
              imgSrc = window.URL.createObjectURL( file );
            } else if ( window.webkitURL ) {
              imgSrc = window.webkitURL.createObjectURL( file );
            }

            image = document.createElement( 'img' );
            image.onload = function () {
                canvas.width = this.width;
                canvas.height = this.height;
                context = canvas.getContext( '2d' );
                context.drawImage( this, 0, 0, this.width, this.height );
                imgURI = canvas.toDataURL();  
                trackEvent.update( {"src" : imgURI } );
            };
            image.src = imgSrc;
        
          }, false);

        }
      }
  
    }

    t.popcornReady = function( popcorn ) {
    //This function runs once in butter AND once in exported projects.
      
    }


    //RUN -------------------------------------

    if( Butter ) {

      Butter({
        config: t.config,
        ready: function( butter ){

          butter.media[ 0 ].onReady( function(){ console.log("foo") });

          function start() {
            t.butter = butter;

            t.butterMediaLoaded( butter, butter.media[ 0 ], butter.media[ 0 ].popcorn.popcorn );
            t.debug && console.log ( t.name + ": butterMediaLoaded" );

            t.popcornReady( butter.media[ 0 ].popcorn.popcorn );  
            t.eventWrapper( butter.media[ 0 ], "canplayall" ); //if canplay or canplayall is used, it must be removed.

            if( t.debug ) { t.tests(); } //tests for helpers
          }

          t.butterInit( butter, butter.media[ 0 ], butter.media[ 0 ].popcorn.popcorn, t.initCallback );
          t.debug && console.log( t.name + ": butterInit" );

          start();
          butter.listen( "mediaready", start );
          t.debug && ( window.t = t );
          window.butter = butter;
        }
      });
    } else {
      t.popcornReady( Popcorn.instances[ 0 ] );
      t.debug && console.log( t.name + ": popcornReady" );
    }

  }(window.Butter));
}, false );

