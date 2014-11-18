Brackets-wsSanitizer
========
Bring sanity to your code by keeping your indentation (spaces and tabs) consistent; it's a white space sanitizer. This is accomplished by following the Brackets whitespace settings.

wsSanitizer goes really well with https://github.com/DennisKehrig/brackets-show-whitespace.

Features
=======
* Trims trailing whitespaces
* Ensures newline at the end of the file
* Respects your spacing settings (tabs or spaces) including your units (2 spaces, 4 spaces, etc.), and does so per file

Details
=======
For example, if Brackets is configured to use spaces, then all leading tabs will be converted to the amount of spaces you configured. On the other hand, if Brackets is configured to use tabs, then leading spaces will be converted to tabs, according to the tab width you configured - that's how many spaces are considered equivalent to a single tab.

Per-file whitespace settings - those in the toolbar below the editor - are respected, so it won't mess up a project that uses different whitespace settings from what you normally use.

When does all this work happen? Upon saving the file.

How to...
=======

Enable/Disable:
![enable/disable ss](https://raw.githubusercontent.com/MiguelCastillo/Brackets-wsSanitizer/master/screenshot.png)

Credits
=======

Thanks to Dimitar Bonev for his work on https://github.com/dsbonev/whitespace-normalizer

