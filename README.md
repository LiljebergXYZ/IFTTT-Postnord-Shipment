# IFTTT Postnord Tracking

Instructions will be added later...

## Usage

1. Get your IFTTT Maker token from: [https://ifttt.com/services/maker/settings](https://ifttt.com/services/maker/settings)
2. Create an applet with the Maker service using the event "shipment_change"
3. Run

You can fill out the config.json
```
{
  "ifttt": "ThISIsaNEXAMplestrIng",
  "shipments": [ "UA12345678SE" ]
}
```

or launch it from the terminal

`node index.js ThISIsaNEXAMplestrIng UA12345678SE`

![Telegram integration](http://i.imgur.com/MOAH48c.png)
