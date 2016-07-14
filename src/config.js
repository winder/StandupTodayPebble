module.exports = [
  { 
    "type": "section",
    "items": [
      {
        "type":"heading",
        "defaultValue": "Standup Today Configuration" 
      },
      { 
        "type": "text", 
        "defaultValue": "Configure your API key, and when to insert standup events in your timeline." 
      }    
    ]
  }, 
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Settings"
      },
      {
        "type": "input",
        "messageKey": "standupTime",
        "label": "Standup Time",
        "attributes": {
          "placeholder": "10:00",
          "required": "required",
          "type": "time"
        }
      },
      {
        "type": "input",
        "messageKey": "apiKey",
        "label": "Standup Today API Key",
        "attributes": {
          "placeholder": "e.g. 2a5e9b237ce32",
          "required": "required",
          "type": "text"
        }
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save"
  }
];