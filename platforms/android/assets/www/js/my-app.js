// Code for platform detection
var isMaterial = Framework7.prototype.device.ios === false;
var isIos = Framework7.prototype.device.ios === true;

// Add the above as global variables for templates
Template7.global = {
  material: isMaterial,
  ios: isIos,
};

var mainView;

// A template helper to turn ms durations to mm:ss
// We need to be able to pad to 2 digits
function pad2(number) {
  if (number <= 99) { number = ('0' + number).slice(-2); }
  return number;
}

// Now the actual helper to turn ms to [hh:]mm:ss
function durationFromMsHelper(ms) {
  if (typeof ms != 'number') {
    return '';
  }
  var x = ms / 1000;
  var seconds = pad2(Math.floor(x % 60));
  x /= 60;
  var minutes = pad2(Math.floor(x % 60));
  x /= 60;
  var hours = Math.floor(x % 24);
  hours = hours ? pad2(hours) + ':' : '';
  return hours + minutes + ':' + seconds;
}

// A stringify helper
// Need to replace any double quotes in the data with the HTML char
//  as it is being placed in the HTML attribute data-context
function stringifyHelper(context) {
  var str = JSON.stringify(context);
  return str.replace(/"/g, '&quot;');
}

// Finally, register the helpers with Template7
Template7.registerHelper('durationFromMs', durationFromMsHelper);
Template7.registerHelper('stringify', stringifyHelper);

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

if (!isIos) {
  // Change class
  $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
  // And move Navbar into Page
  $$('.view .navbar').prependTo('.view .page');
}



// Initialize app
var myApp = new Framework7({
  material: isIos? false : true,
  template7Pages: true,
  precompileTemplates: true,
  swipePanel: 'left',
  swipePanelActiveArea: '30',
  swipeBackPage: true,
  animateNavBackIcon: true,
  pushState: !!Framework7.prototype.device.os,
});

function init() {
  // Add view
  mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    domCache: true,
  });

	

  // Handle Cordova Device Ready Event
  $$(document).on('deviceready', function deviceIsReady() {
    console.log('Device is ready!');
	
		
	is_auth_login();	
	
  });
  
 
 function is_auth_login(){
	 setTimeout(function(){
	   if(window.localStorage.getItem("USER_ID") != null){
			 
			 $$(".signin-link").hide();
			 $$(".signup-link").hide();
			 $$(".signout-link").show();
		 } else {
			 $$(".signin-link").show();
			 $$(".signup-link").show();
			 $$(".signout-link").hide();
			 
		 }
		},700);  
  }
  
  
  
  
  $$(document).on('click', '.panel .search-link', function searchLink() {
    // Only change route if not already on the index
    //  It would be nice to have a better way of knowing this...
    var indexPage = $$('.page[data-page=index]');
    if (indexPage.hasClass('cached')) {
      mainView.router.load({
        pageName: 'index',
        animatePages: false,
        reload: true,
      });
	  is_auth_login();
    }
  });
  
  
 


  $$(document).on('click', '.panel .favorites-link', function searchLink() {
    // @TODO fetch the favorites (if any) from localStorage
    var favorites = JSON.parse(localStorage.getItem('favorites'));
    mainView.router.load({
      template: myApp.templates.favorites,
      animatePages: false,
      context: {
        tracks: favorites,
      },
      reload: true,
    });
	is_auth_login();
  });
  
  
    $$(document).on('click', '.panel .signup-link', function searchLink() {
    // @TODO fetch the favorites (if any) from localStorage
    //var favorites = JSON.parse(localStorage.getItem('favorites'));
    mainView.router.load({
      template: myApp.templates.signup,
      animatePages: false,
      /*context: {
        tracks: favorites,
      },*/
      reload: true,
    });
	is_auth_login();
  });
  
   $$(document).on('click', '.panel .signin-link', function searchLink() {
    // @TODO fetch the favorites (if any) from localStorage
    //var favorites = JSON.parse(localStorage.getItem('favorites'));
	
    mainView.router.load({
      template: myApp.templates.signin,
      animatePages: false,
      /*context: {
        tracks: favorites,
      },*/
      reload: true,
    });
	is_auth_login();
	
  });
  
  $$(document).on('click', '.panel .signout-link', function signoutLink() {
		myApp.showPreloader();
	  setTimeout(function(){
		 window.localStorage.clear();
		 window.location.href = "index.html"; 
		 //$$('.signin-link').click();
		 myApp.hidePreloader();
	  },700);
  });
  
  
  
  
  $$(document).on('submit', '#search', searchSubmit);
  
  $$(document).on('submit', '#pg_signup', signupSubmit);
  
  $$(document).on('submit', '#pg_signin', signinSubmit);
  
}


/**
 * Search
 *  - functionality for the main search page
 */

function searchSubmit(e) {
  var formData = myApp.formToJSON('#search');
  e.preventDefault();
  if (!formData.term) {
    myApp.alert('Please enter a search term', 'Search Error');
    return;
  }
	//formData.entity = 'musicVideo';
  
  if (formData.filter === 'all') {
    formData.term = formData.term.trim();
  } else {
    formData.term =  formData.term.trim();
  }
//delete formData.filter;
//formData.media = 'entity';
//formData.entity = 'music';

  $$('input').blur();
  myApp.showPreloader('Searching');
  $$.ajax({
    dataType: 'json',
    data: formData,
    processData: true,
  //  url: 'https://itunes.apple.com/in/search?term=salman&limit=25',
    
	url: 'https://itunes.apple.com/in/search',
    
	success: function searchSuccess(resp) {
	
	/*if(resp.resultCount ==0) {
		
		myApp.alert('Something went wrong try again.', 'Search Error');
		return true;
	}*/
				
      var results = { count: 0 };
      results.count = resp.resultCount === 50 ? "50 (max)" : resp.resultCount;
      results.items = resp.results;
      myApp.hidePreloader();
      mainView.router.load({
        template: myApp.templates.results,
        context: {
          tracks: results,
        },
		
      });
    },
    error: function searchError(xhr, err) {
      myApp.hidePreloader();
      myApp.alert('An error has occurred', 'Search Error');
      console.error("Error on ajax call: " + err);
      console.log(JSON.stringify(xhr));
    }
  });
}

/**
 * SignIn
 *  - functionality for the main search page
 */

function pg_validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

function signinSubmit(e) {
  var formData = myApp.formToJSON('#pg_signin');
  e.preventDefault();
  if (!formData.pg_email) {
    myApp.alert('Please enter your e-mail', 'Sign In Error');
    return;
  }
  
   
  if(!pg_validateEmail(formData.pg_email)){
    myApp.alert('Please enter correct email address.', 'Sign In Error');
    return;
  }
  
  if (!formData.pg_password) {
    myApp.alert('Please enter your password', 'Sign In Error');
    return;
  }
  
  formData.pg_action = 'login';
  $$('input').blur();
  myApp.showPreloader();
  $$.ajax({
    dataType: 'json',
    data: formData,
    processData: true,
  	url: 'http://projectsapproval.com/phonegap_webservice/web-service.php',
    success: function signinSuccess(resp) {
		
		 myApp.hidePreloader();
		
		if(resp.pw_login){
			 //myApp.alert(resp.pw_msg, 'Sign In Success');
			 
			 //http://www.wideskills.com/phonegap/phonegap-data-storage-local-storage
			window.localStorage.clear();
			window.localStorage.setItem("USER_ID", resp.pw_user.ID);
			window.localStorage.setItem("USER_NAME", resp.pw_user.Name);
			window.localStorage.setItem("USER_Email", resp.pw_user.Email);
			 
			window.location.href = "dashboard.html"; 
			 
			 /*mainView.router.load({
				template: myApp.templates.myaccount,
				context: {
				  User: resp.pw_user,
				},
				  reload: true,
			  });
			  //is_auth_login();
			 var output = "Your user ID is " +
                              window.localStorage.getItem("USER_ID") +
                              " and your Name is " +
                              window.localStorage.getItem("USER_NAME");
                document.getElementById("result").innerHTML = output;*/
			  
			 
		} else {
			 myApp.alert(resp.pw_msg, 'Sign In Error');
		}
    },
    error: function signinError(xhr, err) {
      myApp.hidePreloader();
      myApp.alert('An error has occurred', 'Signin Error');
      console.error("Error on ajax call: " + err);
      console.log(JSON.stringify(xhr));
    }
  });
}


/**
 * Signup
 *  - functionality for the main search page
 */

function signupSubmit(e) {
  var formData = myApp.formToJSON('#pg_signup');
  e.preventDefault();
 
   if (!formData.pg_first_name) {
    myApp.alert('Please enter your first name', 'Sign Up Error');
    return;
  }
  
  if (!formData.pg_last_name) {
    myApp.alert('Please enter your last name', 'Sign Up Error');
    return;
  }
  
   if (!formData.pg_email) {
    myApp.alert('Please enter your e-mail', 'Sign Up Error');
    return;
  }
   
  if(!pg_validateEmail(formData.pg_email)){
    myApp.alert('Please enter correct email address.', 'Sign Up Error');
    return;
  }
  
  if (!formData.pg_password) {
    myApp.alert('Please enter your password', 'Sign Up Error');
    return;
  }

  formData.pg_action = 'register';
  $$('input').blur();
  myApp.showPreloader();
  $$.ajax({
    dataType: 'json',
    data: formData,
    processData: true,
  	url: 'http://projectsapproval.com/phonegap_webservice/web-service.php',
    success: function signinSuccess(resp) {
		
		 myApp.hidePreloader();
		
		if(resp.pw_register){
			
			myApp.alert(resp.pw_msg, 'Sign Up Success');
			
			/* mainView.router.load({
				template: myApp.templates.signin,
				/*context: {
				  User: resp.pw_user,
				},
			  });
			  is_auth_login();*/
			  
			   document.forms["pg_signup"].reset()
			 
		} else {
			 myApp.alert(resp.pw_msg, 'Sign Up Error');
		}
    },
    error: function signupError(xhr, err) {
      myApp.hidePreloader();
      myApp.alert('An error has occurred', 'Sign Up Error');
      console.error("Error on ajax call: " + err);
      console.log(JSON.stringify(xhr));
    }
  });
}



/**
 * Details page
 *  - controls the playback controls and preview media object
 */

var mediaPreview = null;
var mediaTimer = null;

function playbackControlsClickHandler(e) {
  var buttonTarget = $$(e.target);
  if (buttonTarget.hasClass('play')) {
    monitorMediaPreviewCurrentPosition(mediaPreview);
    mediaPreview.play();
    setPlaybackControlsStatus('pending');
    return;
  }
  monitorMediaPreviewCurrentPosition();
  mediaPreview.stop();
  setPlaybackControlsStatus('stopped');
  return;
};

function setPlaybackControlsStatus(status) {
  var allButtons = $$('.playback-controls a');
  var playButton = $$('.playback-controls .play-button');
  var pendingButton = $$('.playback-controls .pending-button');
  var stopButton = $$('.playback-controls .stop-button');
  switch (status) {
    case 'stopped':
      allButtons.removeClass('displayed');
      playButton.addClass('displayed');
      break;
    case 'pending':
      allButtons.removeClass('displayed');
      pendingButton.addClass('displayed');
      break;
    case 'playing':
      allButtons.removeClass('displayed');
      stopButton.addClass('displayed');
      break;
    default:
      allButtons.removeClass('displayed');
      playButton.addClass('displayed');
  }
}

function monitorMediaPreviewCurrentPosition(media) {
  var percent = 0;
  var progressbar = $$('.playback-controls .duration .progressbar');
  // If no media object is provided, stop monitoring
  if (!media) {
    clearInterval(mediaTimer);
    return;
  }
  mediaTimer = setInterval(function () {
    media.getCurrentPosition(
      function (position) {
        if (position > -1) {
          percent = (position / media.getDuration()) * 100;
          myApp.setProgressbar(progressbar, percent);
        }
      },
      function (e) {
        console.error("Error getting position", e);
      });
  }, 100);
}

function mediaPreviewSuccessCallback() {
  var progressbar = $$('.playback-controls .duration .progressbar');
  setPlaybackControlsStatus('stopped');
  myApp.setProgressbar(progressbar, 0, 100);
}

function mediaPreviewErrorCallback(error) {
  setPlaybackControlsStatus('stopped');
  console.error(error);
}

function mediaPreviewStatusCallback(status) {
  var progressbar = $$('.playback-controls .duration .progressbar');
  switch (status) {
    case 2: // playing
      setPlaybackControlsStatus('playing');
      myApp.setProgressbar(progressbar, 0, 0);
      break;
    case 4: // stopped
      setPlaybackControlsStatus('stopped');
      break;
    default:
      // Default fall back not needed
  }
}

function addOrRemoveFavorite(e) {
  if (this.isFavorite) {
    // remove the favorite from the arrays
    this.favoriteIds.splice(this.favoriteIds.indexOf(this.id), 1);
    var favorites = this.favorites.filter(function(fave) {
      return fave.id !== this.id;
    }, this);
    this.favorites = favorites;
    this.isFavorite = false;
    // update the UI
    $$('.link.star').html('<i class="fa fa-star-o"></i>');
  } else {
    // add the favorite to the arrays
    if (this.favorites === null) this.favorites = [];
    this.favorites.push(this.track);
    this.favoriteIds.push(this.id);
    this.isFavorite = true;
    // update the UI
    $$('.link.star').html('<i class="fa fa-star"></i>');
  }
  if (this.favorites.length === 0) {
    // clear it out so the template knows it's empty when it returns
    //  as {{#if favorites}} sees an empty array as truthy
    this.favorites = null;
  }
  // save it back to localStorage
  localStorage.setItem('favorites', JSON.stringify(this.favorites));
  localStorage.setItem('favoriteIds', JSON.stringify(this.favoriteIds));
  // if we got here from the favorites page, we need to reload its context
  //  so it will update as soon as we go "back"
  if (this.fromPage === 'favorites') {
    // Reload the previous page
    mainView.router.load({
      template: myApp.templates.favorites,
      context: {
        tracks: this.favorites,
      },
      reload: true,
      reloadPrevious: true,
    });
  }
}

myApp.onPageInit('details', function(page) {
  var previewUrl = page.context.previewUrl;
  if (typeof Media !== 'undefined') {
    // Create media object on page load so as to let it start buffering right
    //  away...
    mediaPreview = new Media(previewUrl, mediaPreviewSuccessCallback,
      mediaPreviewErrorCallback, mediaPreviewStatusCallback);
  } else {
    // Create a dummy media object for when viewing in a browser, etc
    //  this really is optional, using `phonegap serve` polyfills the
    //  Media plugin
    function noMedia() {
      myApp.alert('Media playback not supported', 'Media Error');
      setTimeout(function() {
        setPlaybackControlsStatus('stopped');
        mediaPreviewStatusCallback(4); // stopped
        console.error('No media plugin available');
      }, 0);
    }
    mediaPreview = {
      play: noMedia,
      stop: function() {},
      release: function() {},
      getCurrentPosition: function() {},
    };
  }

  // fetch the favorites
  var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  var favoriteIds = JSON.parse(localStorage.getItem('favoriteIds')) || [];
  var isFavorite = false;
  if (favoriteIds.indexOf(page.context.id) !== -1) {
    $$('.link.star').html('<i class="fa fa-star"></i>');
    isFavorite = true;
  }
  // set up a context object to pass to the handler
  var pageContext = {
    track: page.context,
    id: page.context.id,
    isFavorite: isFavorite,
    favorites: favorites,
    favoriteIds: favoriteIds,
    fromPage: page.fromPage.name,
  };

  // bind the playback and favorite controls
  $$('.playback-controls a').on('click', playbackControlsClickHandler);
  $$('.link.star').on('click', addOrRemoveFavorite.bind(pageContext));
});

myApp.onPageBeforeRemove('details', function(page) {
  // stop playing before leaving the page
  monitorMediaPreviewCurrentPosition();
  mediaPreview.stop();
  mediaPreview.release();
  // keep from leaking memory by removing the listeners we don't need
  $$('.playback-controls a').off('click', playbackControlsClickHandler);
  $$('.link.star').off('click', addOrRemoveFavorite);
});
