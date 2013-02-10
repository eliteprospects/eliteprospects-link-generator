<?php

/**************************************************************************

Plugin Name:  Eliteprospects
Plugin URI:   http://eliteprospects.com
Description:  Link to player profiles on Eliteprospects.com
Version:      0.3
Author:       Carl Grundberg, Menmo
Author URI:   http://www.menmo.se

**************************************************************************

*/

function ep_addbuttons() {
    if ( ! current_user_can('edit_posts') && ! current_user_can('edit_pages') )
        return;

    // Add only in Rich Editor mode
    if ( get_user_option('rich_editing') == 'true') {
        add_filter("mce_external_plugins", "add_ep_tinymce_plugin");
        add_filter('mce_buttons', 'register_ep_button');
    }

    add_action('after_wp_tiny_mce', 'ep_player_dialog');
    wp_enqueue_script('jquery');
    wp_enqueue_style('ep_player_dialog', plugins_url( 'ep_player_dialog.css' , __FILE__ ));
}

include 'ep_player_dialog.php';

function register_ep_button($buttons) {
    array_push($buttons, "ep_player_link");
    array_push($buttons, "ef_player_link");
    return $buttons;
}

function add_ep_tinymce_plugin($plugin_array) {
    $plugin_array['ep_player_link'] = plugins_url( 'ep_player_link.js' , __FILE__ );
    return $plugin_array;
}

add_action('admin_init', 'ep_addbuttons');
