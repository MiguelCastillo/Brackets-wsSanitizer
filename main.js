/**
 * White Space Sanitizer Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Based on https://github.com/dsbonev/whitespace-normalizer
 */


define(function (/* require, exports, module */) {
    'use strict';

    var CommandManager     = brackets.getModule('command/CommandManager'),
        Commands           = brackets.getModule('command/Commands'),
        DocumentManager    = brackets.getModule('document/DocumentManager'),
        Menus              = brackets.getModule('command/Menus'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        PREFERENCES_KEY    = 'brackets-wsSanitizer',
        prefs              = PreferencesManager.getExtensionPrefs(PREFERENCES_KEY);

    var SPACE_UNITS  = "spaceUnits",
        TAB_SIZE     = "tabSize",
        USE_TAB_CHAR = "useTabChar";


    // Set default value
    prefs.definePreference("enabled", "boolean", "true");

    // Set up the menu and callback for it
    (function() {
        var COMMAND_ID = PREFERENCES_KEY,
            menu       = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU),
            command    = CommandManager.register('Whitespace Sanitizer', COMMAND_ID, setEnabled);

        menu.addMenuDivider();
        menu.addMenuItem(COMMAND_ID);

        function setEnabled() {
            var enabled = !command.getChecked();
            command.setChecked(enabled);
            prefs.set('enabled', enabled);
            $(DocumentManager)[enabled ? 'on' : 'off']('documentSaved', sanitize);
        }

        command.setChecked(!prefs.get('enabled'));
        setEnabled();
    })();


    function sanitize(event, doc) {
        doc.batchOperation(function () {
            var line, pattern, match;
            var lineIndex = 0,
                wsPattern = getReplacePattern(doc);

            while ((line = doc.getLine(lineIndex)) !== undefined) {
                //trim trailing whitespaces
                pattern = /[ \t]+$/g;
                match = pattern.exec(line);
                if (match) {
                    doc.replaceRange(
                        '',
                        {line: lineIndex, ch: match.index},
                        {line: lineIndex, ch: pattern.lastIndex}
                    );
                }

                match = wsPattern.sanitizeLine(line);
                if ( match.replaceWith ) {
                    doc.replaceRange(
                        match.replaceWith,
                        {line: lineIndex, ch: match.start},
                        {line: lineIndex, ch: match.end}
                    );
                }

                lineIndex += 1;
            }

            //ensure newline at the end of file
            line = doc.getLine(lineIndex - 1);
            if (line !== undefined && line.length > 0 && line.slice(-1) !== '\n') {
                doc.replaceRange(
                    '\n',
                    {line: lineIndex, ch: line.slice(-1)}
                );
            }
        });

        CommandManager.execute(Commands.FILE_SAVE, {doc: doc});
    }


    function getReplacePattern(doc) {
        var preferencesContext = doc.file.fullPath;
        var useTabChar = PreferencesManager.get(USE_TAB_CHAR, preferencesContext);
        var tabSize    = PreferencesManager.get(TAB_SIZE,     preferencesContext);
        var spaceUnit  = PreferencesManager.get(SPACE_UNITS,  preferencesContext);

        var pattern = useTabChar ? {
            units: tabSize,
            matchPattern: /^[ ]+/g,
            replaceWith: '\t',
            getIndent: function(length) {
                return Math.round(length / pattern.units);
            }
        }: {
            units: spaceUnit,
            matchPattern: /^[\t]+/g,
            replaceWith: ' ',
            getIndent: function(length) {
                return length * pattern.units;
            }
        };


        function sanitizeLine(line) {
            var regMatch = line.match(pattern.matchPattern);
            var matches  = (regMatch || [''])[0];
            var indent   = pattern.getIndent(matches.length);

            return {
                replaceWith: new Array(indent + 1).join(pattern.replaceWith),
                start: 0,
                end: matches.length
            };
        }

        return {
            sanitizeLine: sanitizeLine
        };
    }

});
