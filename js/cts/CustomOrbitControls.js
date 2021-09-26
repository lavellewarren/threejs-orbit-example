/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();


//focusrotation HERE IS THE FOCUS OF ROTATION SET !!!!
	this.target.set(500,160,-500);


	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = 2000;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;
    //this.minZoom = 5;
	//this.maxZoom = 10;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	//this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
	// CUSTOM sets the same controls for orbit and pan
	//this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };
    // CUSTOM orbit set to right mouse and only used inside pan function
    this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;
	
	//CUSTOM attributes begin
	this.dynamicPanningHeight =false;
	//this.dynamicPanningHeight = false;
	// Interval of Y camera position values within pan is used (if dynamicPanningHeight = false)
	//this.maxPanningHeight = 70;
	//this.minPanningHeight = -70;
	//this.maxPanningHeight = 90;
	//this.minPanningHeight = -80;

// panning height limits!!!
	this.maxPanningHeight = 0;
	this.minPanningHeight = 0;
    
    this.lastFactor = 1;
    this.panSpeed = 2.5;
	var dist = 0;
	var currentdist = dist;
	var maxp = this.maxPanningHeight;
	var minp = this.minPanningHeight;
	//CUSTOM attributes end

	//
	// public methods
	//
	
	// CUSTOM: returns the current distance to target
	this.getDistance = function () {

		return dist;

	};
	//***********************************************
	
	this.getPolarAngle = function () {

		return phi;

	};

	this.getAzimuthalAngle = function () {

		return theta;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function() {
		
		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function () {

			var position = scope.object.position;
            /*
            if (position.y < scope.maxPanningHeight && position.y < scope.minPanningHeight){	
				scope.enableRotate = false;
                scope.enablePan = true;
            }
            else{
                scope.enablePan = false;
                scope.enableRotate = true;
            }*/
            /*
            if (position.y > scope.maxPanningHeight || position.y < scope.minPanningHeight){	
				//scope.enableRotate = false;
                scope.enablePan = false;
            }
            else{
                scope.enablePan = true;
                //scope.enableRotate = true;*/

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis

			theta = Math.atan2( offset.x, offset.z );

			// angle from y-axis

			phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}
            else{//CUSTOM
                //handleMouseMoveRotate( event );
                //scope.dispatchEvent( startEvent );
                //rotateLeft( getAutoRotationAngle() );
            }

			theta += thetaDelta;
			phi += phiDelta;

			// restrict theta to be between desired limits
			theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, theta ) );

			// restrict phi to be between desired limits
			phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, phi ) );

			// restrict phi to be betwee EPS and PI-EPS
			phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

			var radius = offset.length() * scale ;

			// restrict radius to be between desired limits
			radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, radius ) );

// move target to panned location
            //CUSTOM limit pan
            //var newX = this.target.x + pan.x;
            var newY = this.target.y + panOffset.y;
			if (!this.dynamicPanningHeight){
				if (newY <= this.maxPanningHeight && newY >= this.minPanningHeight) {
					 scope.target.add( panOffset );
				}
			}
			else{
				var targetIgnoringY = new THREE.Vector3();
				//targetIgnoringY.y = scope.object.position.y;
				targetIgnoringY.copy(scope.target);
				targetIgnoringY.y = 0;
				var objectIgnoringY = new THREE.Vector3();
				//objectIgnoringY.copy(scope.object.position);
				//objectIgnoringY.y = 1;
				objectIgnoringY.x = scope.object.position.x;
				objectIgnoringY.y = 0;
				objectIgnoringY.z = scope.object.position.z;

				//var maxPH = (this.maxPanningHeight/250) * (scope.object.position.distanceTo(targetIgnoringY));
				//var minPH = (this.minPanningHeight/250) * (scope.object.position.distanceTo(targetIgnoringY));
				
				//var maxPH = (this.maxPanningHeight*250) / (scope.object.position.distanceTo(targetIgnoringY));
				//var minPH = (this.minPanningHeight*250) / (scope.object.position.distanceTo(targetIgnoringY));
				
				//var maxPH = (1/0.28) * (scope.object.position.distanceTo(targetIgnoringY));
				//var minPH = (1/0.28) * (scope.object.position.distanceTo(targetIgnoringY));
				
				//CUSTOM proporcionalidad inversa
				//var maxPH = (this.maxPanningHeight/250) * (offset.distanceTo(targetIgnoringY));
				//var minPH = (this.minPanningHeight/250) * (offset.distanceTo(targetIgnoringY));
				
				//CUSTOM proporcionalidad directa
				//var maxPH = (this.maxPanningHeight*250) / (offset.distanceTo(targetIgnoringY));
				//var minPH = (this.minPanningHeight*250) / (offset.distanceTo(targetIgnoringY));
				
				//CUSTOM proporcionalidad inversa
				//var maxPH = (this.maxPanningHeight*this.minDistance) / (offset.distanceTo(targetIgnoringY));
				//var minPH = (this.minPanningHeight*this.minDistance) / (offset.distanceTo(targetIgnoringY));
				//var dist = scope.object.position.distanceTo(targetIgnoringY);
				
				//var vecDistance = new THREE.Vector3();
				//vecDistance.copy( scope.object.position ).sub( scope.target );
				
				dist = objectIgnoringY.distanceTo(targetIgnoringY);
				//var dist = vecDistance.z;
				//console.log("distance "+dist);
				//var maxPH = (this.maxPanningHeight*this.minDistance) / (scope.object.position.distanceTo(targetIgnoringY));
				//var minPH = (this.minPanningHeight*this.minDistance) / (scope.object.position.distanceTo(targetIgnoringY));

				this.maxPanningHeight = maxp;
				this.minPanningHeight = minp;
				//------------
				//var maxPH = (this.maxPanningHeight*this.minDistance) / (dist);
				//var minPH = (this.minPanningHeight*this.minDistance) / (dist);
				//console.log("(1+((this.maxDistance-this.minDistance)/2 -dist)/50): "+(1+((this.maxDistance-this.minDistance)/2 -dist)/50));
				/*if(dist > 35 && dist < 50){ ------------------------------------------------------------------------------------------------------------------------Metodo estatico limites camara
					this.maxPanningHeight = 30;
					this.minPanningHeight = -60;
					//console.log("distance 1 "+dist);
				}
				else if(dist > 50 && dist < 65){ 
					this.maxPanningHeight = 25;
					this.minPanningHeight = -50;
					//console.log("distance 2 "+dist);
				}
				else if(dist > 65 && dist < 80){ 
					this.maxPanningHeight = 20;
					this.minPanningHeight = -40;
					//console.log("distance 3 "+dist);
				}
				else if(dist > 80 && dist < 95){
					this.maxPanningHeight = 15;
					this.minPanningHeight = -30;
					//console.log("distance 4 "+dist);
				}
				else if(dist > 95 && dist < 110){
					this.maxPanningHeight = 10;
					this.minPanningHeight = -20;
					//Console.log("distance 5 "+dist);
				}
				else if(dist > 110 && dist < 125){
					this.maxPanningHeight = 5;
					this.minPanningHeight = -10;
					//console.log("distance 6 "+dist);
				}
				else if(dist > 125 && dist < 140){
					this.maxPanningHeight = 0;
					this.minPanningHeight = 0;
					//console.log("distance 7 "+dist);
				}*/
				var maxPH = (1+(dist-this.minDistance)/180)*(this.maxPanningHeight*this.minDistance) / (dist);
				var minPH = (1+(dist-this.minDistance)/180)*(this.minPanningHeight*this.minDistance) / (dist);
				/*
				if (dist < (this.maxDistance-this.minDistance)/2){
					var maxPH = (1+(dist-this.minDistance)/50)*(this.maxPanningHeight*this.minDistance) / (dist);
				    var minPH = (1+(dist-this.minDistance)/50)*(this.minPanningHeight*this.minDistance) / (dist);
				}
				else{
					var maxPH = ((dist-this.minDistance)/50)*(this.maxPanningHeight*this.minDistance) / (dist);
				    var minPH = ((dist-this.minDistance)/50)*(this.minPanningHeight*this.minDistance) / (dist);
				}
				
                if (dist < 90){
                    this.lastFactor = (1+(dist-this.minDistance)/50);
					var maxPH = this.lastFactor*(this.maxPanningHeight*this.minDistance) / (dist);
				    var minPH = this.lastFactor*(this.minPanningHeight*this.minDistance) / (dist);
				}
				else{
					var maxPH = (this.lastFactor)*(this.maxPanningHeight*this.minDistance) / (dist);
				    var minPH = (this.lastFactor)*(this.minPanningHeight*this.minDistance) / (dist);
				}*/
				
				//------------
				
				//var maxPH = (this.maxPanningHeight*this.minDistance) / (panOffset.z);
				//var minPH = (this.minPanningHeight*this.minDistance) / (panOffset.z);
				//console.log("maxPanningH: "+this.maxPanninHeight+" minPanningH: "+this.minPanningHeight);
				//console.log("maxPH: "+maxPH+" minPH: "+minPH);
				//CUSTOM ensures the camera position is inside the margins when changing pan limits
				if (newY > maxPH){this.target.y = maxPH;}
				if (newY < minPH){this.target.y = minPH;}
				if (newY <= maxPH && newY >= minPH) {
					 scope.target.add( panOffset );
				}
			}
			offset.x = radius * Math.sin( phi ) * Math.sin( theta );//-------------------------------------------------------------------------Not prob xD
			offset.y = radius * Math.cos( phi );
			offset.z = radius * Math.sin( phi ) * Math.cos( theta );//----------------------------------------------------------------------------------maybe

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );
			
			position.copy( scope.target ).add( offset );
			
			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				thetaDelta *= ( 1 - scope.dampingFactor );
				phiDelta *= ( 1 - scope.dampingFactor );

			} else {

				thetaDelta = 0;
				phiDelta = 0;

			}

			scale = 1;
			panOffset.set( 0, 0, 0 );

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function() {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
		scope.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mouseout', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var theta;
	var phi;

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;
	
	var onMotion = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();
	
	

	function getAutoRotationAngle() {

		return -2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		thetaDelta -= angle;

	}

	function rotateUp( angle ) {

		phiDelta -= angle;

	}

	var panLeft = function() {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			var te = objectMatrix.elements;

			// get X column of objectMatrix
			v.set( te[ 0 ], te[ 1 ], te[ 2 ] );

			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function() {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			var te = objectMatrix.elements;

			// get Y column of objectMatrix
			v.set( te[ 4 ], te[ 5 ], te[ 6 ] );

			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function() {

		var offset = new THREE.Vector3();

		return function( deltaX, deltaY ) {
            
            //CUSTOM use pan speed
            deltaY = scope.panSpeed * deltaY;

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object instanceof THREE.PerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				//CUSTOM Pan only in Y axis
				
                panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );
                //panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
                //CUSTOM rotate Y begin
                //rotateEnd.set( position.x, position.y );
                //rotateEnd.set( offset.x,offset.y );
                //rotateDelta.subVectors( rotateEnd, rotateStart );
                rotateDelta = new THREE.Vector3();
                //rotateDelta.x= 1;
                //Use panEnd and start positions
                rotateDelta.subVectors( panEnd, panStart );

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
				/*//------------------------------------------------------------------------------------------------------------------------------------------------------"Camara Elíptica"
				if(scope.object.position.x > -15 && scope.object.position.x < 15){
					panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
					onMotion = false
					//console.log("En giro "+onMotion);
					//console.log("distancia "+dist+" Current Distancia "+currentdist);
				}else if(scope.object.position.x < -15 || scope.object.position.x > 15 ){
					rotateLeft( 3 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
					onMotion = true;
					//console.log("rot pos x  "+scope.object.position.x);
					//console.log("En giro "+onMotion);
				}*/
					
				
                // rotating across whole screen goes 360 degrees around
                rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
				//console.log("pos  "+scope.object.position.x);
                rotateStart.copy( rotateEnd );

                scope.update();
                //CUSTOM rotate y end
                

			} else if ( scope.object instanceof THREE.OrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera) {
			if( dist > currentdist && dist < 350 ){//-------------------------------------------------------------------------------------------------------"Limites camara dinamico"
				
				if(maxp > 0){
					scale /= dollyScale;
					maxp -= 0.4;
					//minp += 1;
					currentdist = Math.floor(dist)-30;
					
				}else {
					currentdist = Math.floor(dist)-30;
				}
				
				console.log("dist in "+dist+" Current Dist in "+currentdist);
				console.log("MaxPan "+maxp+" MinPan "+minp);
			}else if(currentdist == 318){
				maxp = 0
			}

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {
			if( dist > currentdist){
				if(maxp < 40 ){
					scale *= dollyScale;
					maxp += 0.5;
					//minp -= 1;
					currentdist = Math.ceil(dist)-40;
					
				}else {
					currentdist = Math.ceil(dist)-40;
				}
				
				console.log("dist out "+dist+" Current Dist out "+currentdist);
				console.log("MaxPan "+maxp+" MinPan "+minp);
			}
		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

        // CUSTOM Rotate only around Y axis
		// rotating up and down along whole screen attempts to go 360, but limited to 180
		//rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}


	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );
		//console.log("dist  "+dist);

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x , panDelta.y);

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		//console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		//console.log( 'handleMouseWheel' );

		var delta = 0;

		if ( event.wheelDelta !== undefined ) {

			// WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) {

			// Firefox

			delta = - event.detail;

		}

		if ( delta > 0  ) {
		
			dollyOut( getZoomScale() );

		} else if ( delta < 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

	}

	function handleTouchStartPan( event ) {

		//console.log( 'handleTouchStartPan' );

		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
        
        // CUSTOM Rotate only around Y axis
		// rotating up and down along whole screen attempts to go 360, but limited to 180
		//rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDolly( event ) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleTouchMovePan( event ) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		
		var pan = true;

		if ( event.button === scope.mouseButtons.ORBIT ) {
            /*
			if ( scope.enableRotate === false ) return;
                handleMouseDownRotate( event );

				state = STATE.ROTATE;
            */
			/*
			//CUSTOM If Y is not inside the pan limits the camera is rotated...
			if ((object.position.y < maxPanningHeight) && (object.position.y > minPanningHeight)){
				handleMouseDownRotate( event );

				state = STATE.ROTATE;
			}
			else{//CUSTOM In other case the camera pans
				//handleMouseDownPan( event );

				//state = STATE.PAN;
				pan = true;
			}*/

		} else if ( event.button === scope.mouseButtons.ZOOM ) {

			if ( scope.enableZoom === false ) return;

			handleMouseDownDolly( event );

			state = STATE.DOLLY;

		}//CUSTOM Disable normal pan control 
		//else if ( event.button === scope.mouseButtons.PAN ) {
		if ( event.button === scope.mouseButtons.PAN ) {

			if ( scope.enablePan === false ) return;

			handleMouseDownPan( event );

			state = STATE.PAN;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			document.addEventListener( 'mouseout', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		
		var pan = true;

		if ( state === STATE.ROTATE ) {
            /*
			if ( scope.enableRotate === false ) return;
            handleMouseMoveRotate( event );*/
			/*
			//CUSTOM If Y is not inside the pan limits the camera is rotated...
			if ((object.position.y < maxPanningHeight) && (object.position.y > minPanningHeight)){
				handleMouseMoveRotate( event );
			}
			else{//CUSTOM In other case the camera pans
				//handleMouseMovePan( event );
				pan = true;
			}*/


		} else if ( state === STATE.DOLLY ) {

			if ( scope.enableZoom === false ) return;

			handleMouseMoveDolly( event );

		} //CUSTOM Disable normal pan control 
		//else if ( state === STATE.PAN ) {
		if (state === STATE.PAN) {

			if ( scope.enablePan === false ) return;

			handleMouseMovePan( event );

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mouseout', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

		scope.dispatchEvent( startEvent ); // not sure why these are here...
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {
            /*
			case 1:	// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				
				//CUSTOM If Y is not inside the pan limits the camera is rotated...
				if ((object.position.y < maxPanningHeight) && (object.position.y > minPanningHeight)){
					handleTouchStartRotate( event );

					state = STATE.TOUCH_ROTATE;
				}
				else{//CUSTOM In other case the camera pans
					handleTouchStartPan( event );

					state = STATE.TOUCH_PAN;
				}
				break;
            */
            //CUSTOM pan as 1
            case 1: // one-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;
                
			case 2:	// two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;

				handleTouchStartDolly( event );

				state = STATE.TOUCH_DOLLY;

				break;

			//CUSTOM Disable normal pan control 
			/*case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;*/

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {
            /*
			case 1: // one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...
				
				//CUSTOM If Y is not inside the pan limits the camera is rotated...
				if ((object.position.y < maxPanningHeight) && (object.position.y > minPanningHeight)){
					handleTouchMoveRotate( event );
				}
				else{//CUSTOM In other case the camera pans
					handleTouchMovePan( event );
				}
				break;

				break;
            */
            //CUSTOM pan as 1
            case 1: // one-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );

				break;
			case 2: // two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

				handleTouchMoveDolly( event );

				break;
			//CUSTOM Disable normal pan control 
			/*case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );

				break;*/

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	scope.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving : {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.constraint.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.constraint.enableDamping = ! value;

		}

	},

	dynamicDampingFactor : {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.constraint.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.constraint.dampingFactor = value;

		}

	}

} );
