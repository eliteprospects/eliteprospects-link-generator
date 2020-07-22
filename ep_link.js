var loading = false;
var limit = 10;
var offset = 0;
var playerNameRegex = /[A-Z][^\s,.&;]+\s+[A-Z][^\s,.&;]+/g;
//var playerNameRegex =/[A-Z][^\s,.]+(?:\s+[A-Z][^\s,.]+)*(?:\s+[a-z][a-z\-]+){0,2}\s+[A-Z]([^\s,.]+)/g;
//var playerNameRegex =/[A-Z][^A-Z\s,.](\s+[A-Z][^A-Z\s,.]+)*\s+[A-Z][^A-Z\s,.]/g;
var types = [{
    name: 'player',
}, {
    name: 'staff',
}];
var apiKey = 'c4c474ba7d1ba52f80369de49416041b';
var search = 'https://api.eliteprospects.com/v1/search?type=player,staff&fields=player.name,player.detailedPosition,player.links.eliteprospectsUrl,player.nationality.flagUrl.small,staff.name,staff.links.eliteprospectsUrl,staff.nationality.flagUrl.small&apiKey=' + apiKey;
var selection;
var matches;
var skip;

(function($) {

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
                if(loading) {
                    return;
                }
                
                var selectionContent = tinymce.trim(ed.selection.getContent({format : 'text'}));
                if(selectionContent.length > 0) {
                    selection = ed.selection;
                    if(selection.getSelectedBlocks().length == 1) {
                        offset = 0;
                        return searchName(ed, selectionContent);             
                    }  
                } else {
                    selection = false;
                }
                skip = {};
                startSearch(ed);
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
                longname : 'Eliteprospects Link Generator',
                author : 'Carl Grundberg',
                authorurl : 'https://github.com/carlgrundberg',
                version : 0.6
            };
        },
        
        next: function(e) {
            console.log(e);
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ep_link', tinymce.plugins.EPLink);
    
    var startSearch = function(ed) {
        matches = [];
        searchNodes(ed);
        searchMatches(ed);
    }

    var searchNodes = function(ed, nodes) {
        if(!nodes) {
            nodes = selection ? selection.getSelectedBlocks().childNodes : ed.getBody().childNodes;
        }
        for(var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if(node.nodeName != 'A') {
                if(node.nodeType == 3) {
                    searchTextNode(ed, node);
                }  else {
                    searchNodes(ed, node.childNodes);
                }        
            }
        }
        return false;
    }
    
    var searchTextNode = function(ed, textNode) {
        var text = textNode.nodeValue.
                   replace(/&nbsp;/g, ' ');
            
        var match;
        var regex = new RegExp(playerNameRegex);
        while(match = regex.exec(text)) {
            var name = match[0].trim();
            if(!skip[name]) {
                matches.push({name: name, index: match.index, node: textNode});
            }
            regex.lastIndex = match.index + 1;
        }
    }
    
    var searchMatches = function(ed) {
        var match = matches.shift();
        if(match) {
            var range = document.createRange();
            range.setStart(match.node, match.index);
            range.setEnd(match.node, match.index + match.name.length);
            ed.selection.setRng(range); 
            ed.selection.getNode().scrollIntoView()
            offset = 0;
            searchName(ed, match.name, function(link) {
                if(link) {
                    startSearch(ed);
                } else {
                    searchMatches(ed);
                }
            });
        }
    }

    var searchName = function(ed, name, done) {
        loading = true;
        $.getJSON(search.replace('[offset]', offset), { q: name }, function(response) {
            loading = false;
            var data = response.data;
            var count = 0;
            var html = '<p class="ep-p">Searching for <b>"' + name + '"</b>.';
            var singleResult = null;
            for(var i = 0; i < types.length; i++) {
                var type = types[i].name; 
                if(data[type] && data[type].length > 0) {
                    count += data[type].length;
                    if(count == 1) {
                        singleResult = data[type][0].links.eliteprospectsUrl;
                    }
                    html += '<h2 class="ep-header">' + type + '</h2>';
                    html += resultList(data[type], type);
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
                var windowOptions = {
                    title: 'Eliteprospects search results',
                    body: [{
                        type: 'container',
                        html: html
                    }],
                    buttons: [{
                        text: 'Skip', 
                        subtype: 'primary', 
                        onclick: function() {
                            ed.windowManager.close();
                            skip[name] = true;
                            done && done(false);
                        }
                    }]
                };               
                ed.windowManager.open(windowOptions);
                for(var i = 0; i < types.length; i++) {
                    attachClickEvent(types[i], ed, done);
                }
            }
        }).error(function(jqXHR, textStatus, errorThrown) {
            ed.windowManager.alert('Error searching for players: ' + textStatus);
        });
    };
    
    var restart = function(ed, name, done) {
        ed.windowManager.close();
        searchName(ed, name, done);
    };
    
    var resultList = function(items, type) {
        var list = '<ul class="ep-list ep-' + type + '-list">';
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            list += '<li><a href="' + item.links.eliteprospectsUrl +'">' + (item.nationality && item.nationality.flagUrl ? '<img src="' + item.nationality.flagUrl.small +'" />' : '') + item.name + playerPosition(item.detailedPosition) + '</a></li>';
        }
        list += '<li></li></ul>';
        return list;
    };
    
    var playerPosition = function(positionName) {
        var s = '';
        if(positionName) {
            s += ' (' + positionName + ')';
        }
        return s;
    };
    
    var placeOfBirth = function(place) {
        if(place) {
            return ', ' + place;
        }
        return '';
    };
    
    var attachClickEvent = function(type, ed, done) {
        $('.ep-'+type.name+'-list a').click(function(e) {
            e.preventDefault();
            clickHandler(ed, this.href, done);
        }).each(function(i, a) { 
          epTooltip(a); 
        });
    };
    
    var clickHandler = function(ed, link, done) {
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
