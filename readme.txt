=== Eliteprospects Link Generator ===
Contributors: carlgrundberg
Donate link:
Tags: eliteprospects, hockey, sports, player, profile
Requires at least: 3.9
Tested up to: 3.9.1
Stable tag: 0.6.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Adds buttons to the TinyMCE editor in WordPress to create links to profile pages on Eliteprospects.com.

== Description ==

This plugin will add a button to the TinyMCE editor in Wordpress.

When you select a name and click one of the buttons, a search will be made to find a player or staff with that name.

If no name is selected the content is searched for names. Please note that this is an experimental feature and not all names will be found. 
Please report names that's not found as an issue here: https://github.com/menmo/eliteprospects-link-generator/issues

To show tooltips for your links you can use this plugin:
https://wordpress.org/plugins/eliteprospects-tooltips/

This plugin uses an Ajax call to http://api.eliteprospects.com to search for players and staff.

== Installation ==

1. Upload plugin to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Select a player name when editing a post in the visual editor and press the 'EP' button.

== Changelog ==

= 0.6.1 = 
* Bugfix for skip button
= 0.6 = 
* Clicking the button when no name is selected searches the whole content for names
* Pagination for results
= 0.5.1 =
* Automatically create link if only one match
* Bugfix for missing country
* Increased limit to 25 results
= 0.5 =
* Added staff links
* Using new api from Eliteprospects.com
* Renamed plugin since we now include more than players
= 0.4 =
* Updated to work with TinyMCE 4
= 0.3 =
* Added Elitefootball button.
= 0.2 =
* Refactored js and better looking popup
= 0.1 =
* Created the plugin




