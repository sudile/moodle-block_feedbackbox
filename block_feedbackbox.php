<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.
use mod_feedbackbox\feedbackbox;

/**
 * Feedback Box
 *
 * @version    1.0.0
 * @package    block_feedbackbox
 * @author     Vincent Schneider <vincent.schneider@sudile.com> 2020
 * @copyright  2020 Sudile GbR (http://www.sudile.com)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_feedbackbox extends block_base {

    function init() {
        $this->title = get_string('pluginname', 'block_feedbackbox');
    }

    function applicable_formats() {
        return ['all' => true];
    }

    function instance_allow_multiple() {
        return false;
    }

    private function find_feedbackbox() {
        global $CFG, $DB, $COURSE; // Required by include once.
        $feedbackboxs = array_reverse($DB->get_records('feedbackbox', ['course' => $COURSE->id], 'id DESC'));
        foreach ($feedbackboxs as $feedbackbox) {
            $cm = get_coursemodule_from_instance("feedbackbox", $feedbackbox->id, $feedbackbox->course);
            if ($cm->deletioninprogress != 0) {
                continue;
            }
            return new feedbackbox(0, $feedbackbox, $COURSE, $cm);
        }
        return false;
    }

    function get_content() {
        $feedbackbox = $this->find_feedbackbox();
        $renderer = $this->page->get_renderer('block_feedbackbox');
        $this->page->requires->css('/blocks/feedbackbox/style/chart.css');
        if ($feedbackbox !== false) {
            $obj = $feedbackbox->get_last_turnus();
            if ($obj !== false) {
                $data = $feedbackbox->get_feedback_responses_block($obj);
                if ($data->participants >= 3) {
                    $data->zone = $obj;
                    $this->page->requires->js_call_amd('block_feedbackbox/blockchart',
                        'init',
                        [(object) ['label' => $data->ratinglabel, 'data' => $data->rating], 'single']);
                    $this->content = new stdClass();
                    $this->content->footer = '';
                    $this->content->text = $renderer->render_from_template('block_feedbackbox/chartdata', $data);
                    return $this->content;
                }
            }
        }
        $this->content = new stdClass();
        $this->content->footer = '';
        $pix = $renderer->pix_icon('b/icon', 'Icon', 'mod_feedbackbox');
        $this->content->text = html_writer::div($pix) . get_string('nofeedbackboxfound', 'block_feedbackbox');
        return $this->content;
    }
}
