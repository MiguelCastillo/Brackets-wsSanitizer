## Brackets-wsSanitizer

> Bring sanity to your code by keeping your indentation (spaces and tabs) consistent; the white space sanitizer.

wsSanitizer goes really well with https://github.com/DennisKehrig/brackets-show-whitespace.

## Features
* Trims trailing white spaces
* Ensures newline at the end of the file
* Uses Brackets preferences for tabs and spaces, including configured units (2 spaces, 4 spaces, etc.)
* Gracefully handles mixed tabs and spaces
* Sanitize on file save

## Brackets Preferences

wsSanitizer leverages Brackets preferences, which means that you can specify per project settings by defining a `.brackets.json` in the root directory of your project. With Brackets preferences you can even define per file settings, which is really handy when dealing with third party libraries that may have different white space requirements than the rest of your project.

The sample `.brackets.json` below enables wsSanitizer for every file, with indentation of 2 white spaces. The configuration file also defines a `path` that disables wsSanitizer for `sanitize.js`, uses tabs, and each tab is 4 spaces.

```
{
    "spaceUnits": 2,
    "useTabChar": false,
    "brackets-wsSanitizer.enabled": true,
    "path": {
        "Brackets-wsSanitizer/src/sanitize.js": {
            "useTabChar": true,
            "tabSize": 4,
            "brackets-wsSanitizer.enabled": false
        }
    }
}
```

For more information on Brackets preferences, please checkout
[this example](https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#example-preferences-json-file).

## How to...

Enable/Disable:
![enable/disable ss](https://raw.githubusercontent.com/MiguelCastillo/Brackets-wsSanitizer/master/screenshot.png)

## Credits

Thanks to Dimitar Bonev for his work on https://github.com/dsbonev/whitespace-normalizer
