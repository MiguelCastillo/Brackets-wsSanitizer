## Brackets-wsSanitizer

> Bring sanity to your code by keeping your indentation (spaces and tabs) consistent; the white space sanitizer.

wsSanitizer goes really well with https://github.com/DennisKehrig/brackets-show-whitespace.

## Features
* Trims trailing white spaces
* Ensures newline at the end of the file
* Uses Brackets preferences for tabs and spaces, including configured units (2 spaces, 4 spaces, etc.)
* Gracefully handles mixed tabs and spaces
* Sanitize on file save
* Sanitize on file open


## Options

* `brackets-wsSanitizer.enabled` [true] - Setting to enable/disable sanitizing documents on save.
* `brackets-wsSanitizer.newline` [true] - Setting to enable/disable adding a new line at the end of the file.
* `brackets-wsSanitizer.notification` [true] - Setting to enable/disable notifications when the current document has inconsistent tabs, spaces, or no new line at the end of the file.


## Brackets Preferences

wsSanitizer leverages Brackets preferences, which means that you can specify per project settings by defining a `.brackets.json` in the root directory of your project. With Brackets preferences you can even define per file settings, which is really handy when dealing with third party libraries that may have different white space requirements than the rest of your project.

wsSanitizer also support per language settings, which enables you to enable/disabled sanitizing your documents using the Brackets language layer. For more information on the preferences system, you can read up on [this link](https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#preferences).

The sample `.brackets.json` below enables wsSanitizer for every file, with indentation of 2 white spaces. The configuration file also defines a `path` that disables wsSanitizer for `sanitize.js`, uses tabs, and each tab is 4 spaces.  Furthermore, you will be asked if you want to sanitize your documents when you open them.

> Brackets `per file settings` cannot be configured at globally as a user preference; they can only be configured at a project level as a project preference. Please read [this issue](https://github.com/MiguelCastillo/Brackets-wsSanitizer/issues/10) for details.


#### `.brackets.json` with path settings
```
{
    "spaceUnits": 2,
    "useTabChar": false,
    "brackets-wsSanitizer.enabled": true,
    "brackets-wsSanitizer.newline": true,
    "brackets-wsSanitizer.notification": true,
    "path": {
        "Brackets-wsSanitizer/src/sanitize.js": {
            "useTabChar": true,
            "tabSize": 4,
            "brackets-wsSanitizer.enabled": false
        }
    }
}
```

#### `.brackets.json` with language settings
```
{
    "language": {
        "javascript": {
            "useTabChar": false,
            "tabSize": 4,
            "spaceUnits": 4,
            "brackets-wsSanitizer.enabled": true,
            "brackets-wsSanitizer.notification": true
        },
        "json": {
            "useTabChar": false,
            "tabSize": 4,
            "spaceUnits": 4,
            "brackets-wsSanitizer.enabled": false,
            "brackets-wsSanitizer.newline": false,
            "brackets-wsSanitizer.notification": true
        }
    }
}
```

For more information on Brackets preferences, please checkout
[this example](https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#example-preferences-json-file).

## How to...

Enable/Disable:
![enable/disable ss](https://raw.githubusercontent.com/MiguelCastillo/Brackets-wsSanitizer/master/img/screenshot.png)

Notification:
![enable/disable ss](https://raw.githubusercontent.com/MiguelCastillo/Brackets-wsSanitizer/master/img/notification.png)


## Credits

Thanks to Dimitar Bonev for his work on https://github.com/dsbonev/whitespace-normalizer
