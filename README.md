Brackets-wsSanitizer
========

Bring sanity to your code by keeping white spaces and tabs consistent; white space sanitizer. This is accomplished by leveraging Brackets white spaces and tabs settings.

wsSanitizer goes really well with https://github.com/DennisKehrig/brackets-show-whitespace.

Features
=======
* Trims trailing whitespaces
* Ensures newline at file end
* Respects your spacing settings (tabs or spaces) including your units (2 spaces, 4 spaces, etc.)

Details
=======
Bring sanity to your code by keeping white spaces and tabs consistent; white space sanitizer. This is accomplished by leveraging Brackets white spaces and tabs settings.

For example, if Brackets is configured to use white spaces, wsSanitizer will convert all leading tabs to white spaces. wsSanitizer will also use Brackets white spaces settings so that if Brackets is configured to use 4 spaces, all leading tabs will be converted to 4 spaces.

Conversely, if you have Brackets configured to use tabs, then all leading white spaces will be converted to tabs. It will also take into account the amount of spaces in each tab . So that if Brackets is configured to have 4 spaces in a tab, then wsSanitizer will convert every 4 leading spaces to a single tab.

What else? It will remove every empty line, it will make sure that each file has a least one new line at the end, it will remove all traling spaces (white spaces and tabs) from the end of each line.

When does all this work happen? Upon saving file changes.

Credits
=======

Thanks to Dimitar Bonev for his work on https://github.com/dsbonev/whitespace-normalizer

