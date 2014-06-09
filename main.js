/**
 * White Space Sanitizer Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Based on https://github.com/dsbonev/whitespace-normalizer
 */



define(function (/* require, exports, module */) {
    'use strict';

    var CommandManager   = brackets.getModule('command/CommandManager'),
        Commands           = brackets.getModule('command/Commands'),
        DocumentManager    = brackets.getModule('document/DocumentManager'),
        Editor             = brackets.getModule('editor/Editor').Editor,
        Menus              = brackets.getModule('command/Menus'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        PREFERENCES_KEY    = 'brackets-wsSanitize',
        prefs              = PreferencesManager.getExtensionPrefs(PREFERENCES_KEY);

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
                wsPattern = getWhiteSpaceReplacePattern(Editor);

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

                match = wsPattern.normalize(line);
                if ( match.replace ) {
                    doc.replaceRange(
                        match.replace,
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


    function getWhiteSpaceReplacePattern(editor) {
        return editor.getUseTabChar() ? {
            units: editor.getTabSize(),
            normalize: function(line) {
                var regMatch = /^[ ]+/g.exec(line);
                var matches  = (regMatch || [''])[0];
                var indent   = Math.round(matches.length / this.units);
                var replace  = new Array(indent + 1).join('\t');

                return {
                    replace: replace,
                    start: 0,
                    end: matches.length
                };
            }
        }: {
            units: editor.getSpaceUnits(),
            normalize: function(line) {
                var regMatch = /^[\t]+/g.exec(line);
                var matches  = (regMatch || [''])[0];
                var indent   = matches.length * this.units;
                var replace  = new Array(indent + 1).join(' ');

                return {
                    replace: replace,
                    start: 0,
                    end: matches.length
                };
            }
        };
    }

});
