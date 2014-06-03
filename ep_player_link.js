/**
 * User: Calle
 * Date: 2013-01-24
 * Time: 10:45
 */


var epPlayerLinkPopup;
var disabled = false;
var running = false;
var sources = {
    'eliteprospects' : {
        'link' :  'http://www.eliteprospects.com/player.php?player=',
        'search' : 'http://www.eliteprospects.com/m/players_json.php?callback=?'
    },
    'elitefootball' : {
        'link' :  'http://www.eliteprospects.com/football/player.php?player=',
        'search' : 'http://www.eliteprospects.com/football/m/players_json.php?callback=?'
    }
};

(function($){
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
            ed.addCommand('mceEPPlayerLink', function() {
                handleCommand(ed, url, sources.eliteprospects);
            });

            ed.addCommand('mceEFPlayerLink', function() {
                handleCommand(ed, url, sources.elitefootball);
            });

            ed.addButton('ep_player_link', {
                title : 'Link to Eliteprospects player profile',
                cmd : 'mceEPPlayerLink',
                image : url + '/icon.png'
            });

            ed.addButton('ef_player_link', {
                title : 'Link to Elitefootball player profile',
                cmd : 'mceEFPlayerLink',
                image : url + '/iconf.png'
            });

            // Add a node change handler, selects the button in the UI when a text is selected
            /*ed.on('NodeChange', function(e) {
                disabled = e.element.nodeName != 'A';
            });*/
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
                author : 'Carl Grundberg, Menmo',
                authorurl : 'http://www.menmo.se',
                version : 0.4
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ep_player_link', tinymce.plugins.EPPlayerLink);

    var inputs = {};

    var handleCommand = function(ed, url, source) {
        if ( disabled || running )
            return;

        var selection = tinymce.trim(ed.selection.getContent({format : 'text'}));
        if(selection.length > 0) {
            running = true;
//            $('#content_ep_player_link').addClass('spinner');
            $.getJSON(source.search, { q: selection }, function(data) {
//                $('#content_ep_player_link').removeClass('spinner');
                if(data.count == 0) {
                    ed.windowManager.alert('No players found for: ' + selection);
                } else if(data.count == 1) {
                    insertLink(ed, source, data.players[0].id);
                } else {
                    ed.windowManager.open({
                        title : 'Eliteprospects Player Profile',
                        body: [{
                            type: 'label',
                            label: 'Multiple players found. Please select one.'
                        }, {
                            type: 'container',
                            html: playerList(data.players)
                        }]
                    });
                    $('#ep-player-dialog-list a').click(function(e) {
                        e.preventDefault();
                        insertLink(ed, source, this.rel);
                        ed.windowManager.close();
                    });
                }
            }).error(function(jqXHR, textStatus, errorThrown) {
                    ed.windowManager.alert('Error searching for players: ' + textStatus);
                }).complete(function() { running = false; });
        } else {
            ed.windowManager.alert('Please select a player name.');
        }
    } ;

    var insertLink  = function(ed, source, id) {
        ed.execCommand("mceBeginUndoLevel");
        ed.execCommand("mceInsertLink", true, {href: source.link + id, target: '_blank'}, {skip_undo : 1});
        ed.selection.collapse(0);
        ed.execCommand("mceEndUndoLevel");
    };

    var playerList = function(players) {
        var list = $('<ul>', { id: 'ep-player-dialog-list'});
        for(i in players) {
            list.append($('<li><a href="#" rel="' + players[i].id +'"><img src="http://www.eliteprospects.com/layout/flags/' + players[i].nationId + '.gif"/> ' + players[i].firstname + ' ' + players[i].lastname + ' (' + players[i].pos + ') ' + players[i].team.name + '</a></li>'));
        }
        return $('<div>').append(list).html();
    };
})(jQuery);