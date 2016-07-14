var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Settings = require('settings');
var Clay = require('clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig, null, {autoHandleEvents: false});

/**
 * Settings handler.
 */
Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  //console.log("Configuration window returned: " + JSON.stringify(e));
  if (e && !e.response) {
    return;
  }
  var dict = clay.getSettings(e.response);

  // Save the Clay settings to the Settings module. 
  Settings.option(dict);
  
  // Kick off an ajax request with new API key.
  doAjaxRequest(dict.apiKey);
  
  // TODO: Timeline pins
});

var standupData;
var activeStandupsMenu;

var getTitleForStandup = function(standup) {
  if (standup.hasOwnProperty('subteam')) {
    return standup.subteam.name;
  } else {
    return standup.team.name;
  }
};

// Processes an array of standup objects.
var getActiveStandups = function(data) {
  var items = [];

  // If there is nothing active say so.
  // TODO: start standup option.
  if (data.length === 0) {
    items.push({
      title:"None!"
      });
  }
  // Otherwise display the active standups.
  else {
    for (var i = 0; i < data.length; i++) {
      items.push({
         title:getTitleForStandup(data[i])
         });
    }
  }

  // return the items.
  return items;
};

/**
 * Load a specific standup, set the list as the active menu. 
 */
var loadStandup = function(e) {
  console.log('loading standup');
  var selectedStandup;
  
  // Look for the standup
  var i;
  for (i = 0; i < standupData.length; i++) {
    if (getTitleForStandup(standupData[i]) === e.item.title) {
      console.log('Found: ' + e.item.title);
      selectedStandup = standupData[i];
    }
  }
  
  var numParticipants = selectedStandup.participants.length;
  var participants = [];
  console.log('Num participants: ' + numParticipants);

  // Insert the participants in order.
  while (participants.length < numParticipants) {
    for (i = 0; i < selectedStandup.participants.length; i++) {
      if (selectedStandup.participants[i].order === participants.length) {
        participants.push({
          title: selectedStandup.participants[i].user.name
        });
      }
    }
  }
 
  var standupMenuList = new UI.Menu({
    sections: [{
      title: 'Standup time(' + e.item.title + ')',
      },{
      title: 'Master(' + participants.shift().title + ')',
      items: participants
    }]
  });

  standupMenuList.show();
  activeStandupsMenu.hide();
};

var doAjaxRequest = function(apiKey) {
  // Make request to standup today.
  ajax(
    {
      url:'http://dailyscrum-staging.herokuapp.com/api/standups?apiKey=' + apiKey,
      type:'json'
    },
    function(data) {
      standupData = data;
      
      // Create an array of Menu items
      var activeStandups = getActiveStandups(data);
  
      // Construct Menu to show to user
      activeStandupsMenu = new UI.Menu({
        sections: [{
          title: 'Active Standups',
          items: activeStandups
        }]
      });
  
      // Callback when a standup is chosen.
      activeStandupsMenu.on('select', loadStandup);
   
      // Show the standup list, hide the splash
      activeStandupsMenu.show();
      splashWindow.hide();
    },
    function(error) {
      console.log('Download failed: ' + error);
    }
  );
};

/**
 * Main entry point!
 */

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

var options = Settings.option();
console.log(JSON.stringify(options));

var text = 'Connecting to stand-up today...';

if (!options.hasOwnProperty('apiKey')) {
  text = 'Please set your API Key in the app config page.';
}

// TODO: Make this a card, or an icon or something.
// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:text,
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'white'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

if (options.hasOwnProperty('apiKey')) {
  doAjaxRequest(options.apiKey);
}
