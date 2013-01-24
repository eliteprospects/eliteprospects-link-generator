/**
 * User: Calle
 * Date: 2013-01-24
 * Time: 11:39
 */

var epPlayerLink;

(function($){
    var inputs = {};

    epPlayerLink = {

        init : function() {
            inputs.dialog = $('#ep-player-dialog');
            inputs.list = $('#ep-player-dialog-list');

            inputs.dialog.bind('wpdialogbeforeopen', epPlayerLink.beforeOpen);
        },

        beforeOpen : function() {
            var data = tinyMCEPopup.getWindowArg('data');
            inputs.list.empty();
            for(i in data.players) {
                inputs.list.append(jQuery('<li><a href="http://www.eliteprospects.com/player.php?id=' + data.players[i].id +'"><img src="http://www.eliteprospects.com/layout/flags/' + data.players[i].nationId + '.gif"/> ' + data.players[i].firstname + ' ' + data.players[i].lastname + '(' + data.players[i].pos + ')<br/>' + data.players[i].team.name + '</a></li>'));
            }
            jQuery('a', inputs.list).click(function(e) {
                e.preventDefault();
                var ed = tinyMCEPopup.editor;
                ed.execCommand("mceBeginUndoLevel");
                ed.execCommand("mceInsertLink", true, {href:this.href, target: '_blank'}, {skip_undo : 1});
                ed.selection.collapse(0);
                ed.execCommand("mceEndUndoLevel");
                tinyMCEPopup.close();
            })
        }
    };

    $(document).ready( epPlayerLink.init );
})(jQuery);
