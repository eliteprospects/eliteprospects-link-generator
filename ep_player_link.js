/**
 * User: Calle
 * Date: 2013-01-24
 * Time: 10:45
 */

(function() {
    tinymce.create('tinymce.plugins.EPPlayerLink', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init : function(ed, url) {
            var disabled = true;
            var running = false;

            // Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceEPPlayerLink');
            ed.addCommand('mceEPPlayerLink', function() {
                if ( disabled || running )
                    return;

                var selection = tinymce.trim(ed.selection.getContent({format : 'text'}));
                if(selection.length > 0) {
                    running = true;
                    jQuery('#content_ep_player_link').addClass('spinner');
                    jQuery.getJSON('http://www.eliteprospects.com/m/players_json.php?callback=?', { q: selection }, function(data) {
                        jQuery('#content_ep_player_link').removeClass('spinner');
                        if(data.count == 0) {
                            ed.windowManager.alert('No players found for: ' + selection);
                        } else if(data.count == 1) {
                            ed.execCommand("mceBeginUndoLevel");
                            ed.execCommand("mceInsertLink", true, {href:'http://www.eliteprospects.com/player.php?id=' + data.players[0].id, target: '_blank'}, {skip_undo : 1});
                            ed.selection.collapse(0);
                            ed.execCommand("mceEndUndoLevel");
                        } else {
                            ed.windowManager.open({
                                id : 'ep-player-dialog',
                                width : 480,
                                height : "auto",
                                wpDialog : true,
                                title : 'Eliteprospects Player Profile'
                            }, {
                                plugin_url : url,
                                data: data
                            });
                        }
                        running = false;
                    });
                } else {
                    ed.windowManager.alert('Please select a player name.');
                }
            });

            // Register button
            ed.addButton('ep_player_link', {
                title : 'Link to Eliteprospects player profile',
                cmd : 'mceEPPlayerLink',
                image : url + '/icon.png'
            });

            // Add a node change handler, selects the button in the UI when a text is selected
            ed.onNodeChange.add(function(ed, cm, n, co) {
                disabled = co && n.nodeName != 'A';
            });
        },

        /**
         * Creates control instances based in the incomming name. This method is normally not
         * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
         * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
         * method can be used to create those.
         *
         * @param {String} n Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
         * @return {tinymce.ui.Control} New control instance or null if no control was created.
         */
        createControl : function(n, cm) {
            return null;
        },

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo : function() {
            return {
                longname : 'Eliteprospects Player Link',
                author : 'Menmo',
                authorurl : 'http://www.menmo.se',
                version : 0.1
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ep_player_link', tinymce.plugins.EPPlayerLink);
})();