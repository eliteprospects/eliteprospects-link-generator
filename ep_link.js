/**
 * User: Calle
 * Date: 2013-01-24
 * Time: 10:45
 */


var epLinkPopup;
var disabled = false;
var running = false;
var sources = {
    eliteprospects : {
        types: [{
            name: 'players',
            link: 'http://www.eliteprospects.com/player.php?player=[id]'
        }, {
            name: 'staffs',
            link: 'http://www.eliteprospects.com/staff.php?staff=[id]'
        }],
        search : 'http://api.eliteprospects.com/beta/autosuggest?type=player%2Cstaff&limit=10&fields=id%2CfirstName%2ClastName%2CyearOfBirth%2CdateOfBirth%2CplayerPosition%2Ccountry.iso3166_3%2ClatestPlayerStats.team.name%2ClatestPlayerStats.season.startYear%2ClatestPlayerStats.season.endYear%2Cname%2CfullName%2C+latestStaffStats.team.name%2C+latestStaffStats.season.startYear%2ClatestStaffStats.season.endYear'
    }
};

(function($){
    tinymce.create('tinymce.plugins.EPLink', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init : function(ed, url) {
            ed.addCommand('mceEPLink', function() {
                handleCommand(ed, url, sources.eliteprospects);
            });

            // ed.addCommand('mceEFPlayerLink', function() {
            //     handleCommand(ed, url, sources.elitefootball);
            // });

            ed.addButton('ep_link', {
                title : 'Link to Eliteprospects profile pages for players and staff',
                cmd : 'mceEPLink',
                image : url + '/icon.png'
            });

            // ed.addButton('ef_player_link', {
            //     title : 'Link to Elitefootball player profile',
            //     cmd : 'mceEFPlayerLink',
            //     image : url + '/iconf.png'
            // });

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
                longname : 'Eliteprospects Link',
                author : 'Carl Grundberg, Menmo',
                authorurl : 'http://www.menmo.se',
                version : 0.5
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ep_link', tinymce.plugins.EPLink);

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
                var count = 0;
                var html = '';
                for(var i = 0; i < source.types.length; i++) {
                    var type = source.types[i].name; 
                    if(data[type] && data[type].metadata.count > 0) {
                        count += data[type].metadata.count;
                        html += '<h2 class="ep-header">' + type + ' (' + data[type].metadata.count + ')</h2>';
                        html += resultList(data[type].data, type);
                    }
                }
                
                if(count == 0) {
                    ed.windowManager.alert('No results for "' + selection + '".');
                } else {
                    ed.windowManager.open({
                        title: 'Eliteprospects search results (max 10)',
                        body: [{
                            type: 'container',
                            html: html
                        }]
                    });
                    $('.ep-header:first').closest('.mce-panel').find('.mce-foot').hide();
                    for(var i = 0; i < source.types.length; i++) {
                        attachClickEvent(source.types[i], ed);
                    }
                }
            }).error(function(jqXHR, textStatus, errorThrown) {
                    ed.windowManager.alert('Error searching for players: ' + textStatus);
                }).complete(function() { running = false; });
        } else {
            ed.windowManager.alert('Please select a name first.');
        }
    };

    var resultList = function(items, type) {
        var list = '<ul class="ep-list ep-' + type + '-list">';
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            list += '<li><a href="#" rel="' + item.id +'"><img src="http://beta.eliteprospects.com/images/flags/32/' + item.country.iso3166_3 + '.png"/> ' + item.firstName + ' ' + item.lastName + playerPosition(item.playerPosition) +latestTeam(item.latestPlayerStats || item.latestStaffStats) + '</a></li>';
        }
        list += '<li></li></ul>';
        return list;
    };
    
    var playerPosition = function(positionName) {
        var s = ' ';
        if(positionName) {
            s += '(';
            switch(positionName) {
                case 'LEFT_WING': 
                    s += 'LW';
                    break;
                case 'RIGHT_WING': 
                    s += 'RW';
                    break;
                default: 
                    s += positionName[0];
            }
            s += ')';
        }
        return s;
    }
    
    var latestTeam = function(latestStats) {
        if(latestStats) {
            return ', ' + latestStats.team.name;
        }
    }
    
    var attachClickEvent = function(type, ed) {
        $('.ep-'+type.name+'-list a').click(function(e) {
            clickHandler(e, ed, type.link.replace('[id]', this.rel));
        });
    }
    
    var clickHandler = function(e, ed, link) {
        e.preventDefault();
        ed.execCommand("mceBeginUndoLevel");
        ed.execCommand("mceInsertLink", true, {href: link, target: '_blank'}, {skip_undo : 1});
        ed.selection.collapse(0);
        ed.execCommand("mceEndUndoLevel");
        ed.windowManager.close();
    }
})(jQuery);