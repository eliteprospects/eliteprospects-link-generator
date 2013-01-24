<?php

/**************************************************************************

Plugin Name:  Eliteprospects
Plugin URI:   http://eliteprospects.com
Description:  Link to player profiles on Eliteprospects.com
Version:      0.0.1
Author:       Menmo
Author URI:   http://www.menmo.se

**************************************************************************

*/

function ep_addbuttons() {
    // Don't bother doing this stuff if the current user lacks permissions
    if ( ! current_user_can('edit_posts') && ! current_user_can('edit_pages') )
        return;

    // Add only in Rich Editor mode
    if ( get_user_option('rich_editing') == 'true') {
        add_filter("mce_external_plugins", "add_ep_tinymce_plugin");
        add_filter('mce_buttons', 'register_ep_button');
    }
}

function register_ep_button($buttons) {
    array_push($buttons, "ep_player_link");
    return $buttons;
}

// Load the TinyMCE plugin : editor_plugin.js (wp2.5)
function add_ep_tinymce_plugin($plugin_array) {
    $plugin_array['ep_player_link'] = plugins_url( 'ep_player_link.js' , __FILE__ );
    return $plugin_array;
}

// init process for button control
add_action('init', 'ep_addbuttons');

function ep_player_dialog() {
    include 'ep_player_dialog.php';
}

add_action('after_wp_tiny_mce', 'ep_player_dialog');

function ep_player_dialog_js($hook) {
    wp_enqueue_script( 'ep_player_dialog', plugins_url('ep_player_dialog.js', __FILE__), array( 'jquery', 'wpdialogs' ), false, 1 );
}
add_action( 'admin_enqueue_scripts', 'ep_player_dialog_js' );

