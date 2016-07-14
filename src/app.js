var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Settings = require('settings');

var myAPIKey = '';

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
      console.log(data[i]);
      console.log(data[i].subteam);
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
  for (var i = 0; i < standupData.length; i++) {
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
    for (var i = 0; i < selectedStandup.participants.length; i++) {
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
}

// App Config Page
Settings.config(
  { url: 'http://pebble-config.herokuapp.com/config?title=Quick%20Config&fields=email_Username,password_Pass' },
  function(e) {
    console.log('opening configurable');
    console.log(JSON.stringify(e));
  },
  function(e) {
    console.log('closed configurable');
    console.log(JSON.stringify(e));
  }
);


/**
 * Main entry point!
 */
// Show splash screen while waiting for data
var splashWindow = new UI.Window();

// TODO: Make this a card, or an icon or something.
// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Connecting to stand-up today...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'white'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

// Make request to standup today.
ajax(
  {
    url:'http://dailyscrum-staging.herokuapp.com/api/standups?apiKey=' + myAPIKey,
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
