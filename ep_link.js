var running = false;
var limit = 25;
//var playerNameRegex = /([A-Z][^\s,.]+\s+)+[A-Z][^\s,.]+/g;
//var playerNameRegex =/[A-Z][^\s,.]+(?:\s+[A-Z][^\s,.]+)*(?:\s+[a-z][a-z\-]+){0,2}\s+[A-Z]([^\s,.]+)/g;
var playerNameRegex =/[A-Z][^\s,.]+(?:\s+[A-Z][^\s,.]+)*\s+[A-Z]([^\s,.]+)/g;
var types = [{
    name: 'players',
    link: 'http://www.eliteprospects.com/player.php?player=[id]'
}, {
    name: 'staffs',
    link: 'http://www.eliteprospects.com/staff.php?staff=[id]'
}];
var search = 'http://api.eliteprospects.com/beta/autosuggest?type=player%2Cstaff&limit='+limit+'&fields=id%2CfirstName%2ClastName%2CyearOfBirth%2CdateOfBirth%2CplayerPosition%2Ccountry.iso3166_3%2ClatestPlayerStats.team.name%2ClatestPlayerStats.season.startYear%2ClatestPlayerStats.season.endYear%2Cname%2CfullName%2C+latestStaffStats.team.name%2C+latestStaffStats.season.startYear%2ClatestStaffStats.season.endYear';
    
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
                var selection = tinymce.trim(ed.selection.getContent({format : 'text'}));
                if(selection.length > 0) {
                    searchName(ed, selection);   
                } else {
                    searchNodes(ed);
                }
            });

            ed.addButton('ep_link', {
                title : 'Generate links to Eliteprospects profile pages',
                cmd : 'mceEPLink',
                image : url + '/icon.png'
            });
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
                author : 'Carl Grundberg',
                authorurl : 'https://github.com/carlgrundberg',
                version : 0.6
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ep_link', tinymce.plugins.EPLink);

    var searchNodes = function(ed, nodes) {
        if(!nodes) {
            nodes = ed.getBody().childNodes;
        }
        for(var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if(node.nodeName == 'A') {
                return;
            }
            
            if(node.nodeType == 3) {
                return searchTextNode(ed, node);    
            }  else {
                if(searchNodes(ed, node.childNodes)) {
                    return true;
                };
            }        
        }
        return false;
    }
    
    var searchTextNode = function(ed, textNode) {
        var text = textNode.nodeValue.
            replace(/[åäáà]/g, 'a').
            replace(/[öóò]/g, 'o').
            replace(/[éè]/g, 'e').
            replace(/[č]/g, 'c').
            replace(/[üúù]/g, 'u').
            replace(/[íì]/g, 'i').
            replace(/[ý]/g, 'y');
            
        var match;
        while(match = playerNameRegex.exec(text)) {
            var name = match[0].trim();
            var range = ed.selection.getRng();
            range.setStart(textNode, match.index);
            range.setEnd(textNode, match.index + name.length);
            ed.selection.setRng(range); 
            searchName(ed, name, function(link) {
                searchNodes(ed);
            });
            return true;
        }
        return false;
    }

    var searchName = function(ed, name, done) {
        if ( running )
            return;

        running = true;
        $.getJSON(search, { q: name }, function(data) {
            var count = 0;
            var html = '<p>Searching for "' + name + '".';
            var singleResult = null;
            for(var i = 0; i < types.length; i++) {
                var type = types[i].name; 
                if(data[type] && data[type].metadata.count > 0) {
                    count += data[type].metadata.count;
                    if(count == 1) {
                        singleResult = types[i].link.replace('[id]', data[type].data[0].id);
                    }
                    html += '<h2 class="ep-header">' + type + ' (' + data[type].metadata.count + ')</h2>';
                    html += resultList(data[type].data, type);
                }
            }
            
            if(count == 0) {
                if(done) {
                    done();    
                } else {
                    ed.windowManager.alert('No results for "' + name + '".');    
                }
            } else if(count == 1 && singleResult) {
                createLink(ed, singleResult);            
                done && done(singleResult);
            } else {
                ed.windowManager.open({
                    title: 'Eliteprospects search results (max '+limit+')',
                    body: [{
                        type: 'container',
                        html: html
                    }]
                });
                $('.ep-header:first').closest('.mce-panel').find('.mce-foot').hide();
                for(var i = 0; i < types.length; i++) {
                    attachClickEvent(types[i], ed, done);
                }
            }
        }).error(function(jqXHR, textStatus, errorThrown) {
            ed.windowManager.alert('Error searching for players: ' + textStatus);
        }).complete(function() { 
            running = false; 
        });
    };

    var resultList = function(items, type) {
        var list = '<ul class="ep-list ep-' + type + '-list">';
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            list += '<li><a href="#" rel="' + item.id +'">' + (item.country? '<img src="http://beta.eliteprospects.com/images/flags/32/' + item.country.iso3166_3 + '.png"/> ' : '') + item.firstName + ' ' + item.lastName + playerPosition(item.playerPosition) +latestTeam(item.latestPlayerStats || item.latestStaffStats) + '</a></li>';
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
    };
    
    var latestTeam = function(latestStats) {
        if(latestStats) {
            return ', ' + latestStats.team.name;
        }
    };
    
    var attachClickEvent = function(type, ed, done) {
        $('.ep-'+type.name+'-list a').click(function(e) {
            clickHandler(e, ed, type.link.replace('[id]', this.rel), done);
        });
    };
    
    var clickHandler = function(e, ed, link, done) {
        e.preventDefault();
        createLink(ed, link);
        ed.windowManager.close();
        done && done(link);
    };
    
    var createLink = function(ed, link) {
        ed.execCommand("mceBeginUndoLevel");
        ed.execCommand("mceInsertLink", true, {href: link, target: '_blank'}, {skip_undo : 1});
        ed.selection.collapse(0);
        ed.execCommand("mceEndUndoLevel");
    };
})(jQuery);