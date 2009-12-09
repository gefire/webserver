/* CTK: Cherokee Toolkit
 *
 * Authors:
 *      Alvaro Lopez Ortega <alvaro@alobbs.com>
 *
 * Copyright (C) 2009 Alvaro Lopez Ortega
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of version 2 of the GNU General Public
 * License as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301, USA.
 */ 

function Submitter (id, url) {
    this.submitter_id  = id;
    this.url           = url;
    this.key_pressed   = false;
    this.check_changed = false;

    this.setup = function (self) {
	   /* When input looses focus */
	   $("#submitter" + this.submitter_id + " input[type='text']").bind ("blur", this, this.input_blur_cb);
	   $("#submitter" + this.submitter_id + " input[type='text']").bind ("keypress", this, this.input_keypress_cb);	   
	   $("#submitter" + this.submitter_id + " input[type='checkbox']").bind ("change", this, this.input_checkbox_cb);

	   /* Read the original values */
	   self.orig_values = {};
	   $("#submitter" + self.submitter_id).children("input:text").each(function(){
		  self.orig_values[this.id] = this.value;
	   });
    }

    this.restore_orig_values = function (self) {
        for (var key in self.orig_values) {
		  $("#submitter"+ self.submitter_id +" #"+key).attr (
			 'value', self.orig_values[key]
		  );
        }
    }

    this.is_fulfilled = function (self) {
	   var full = true;

	   console.log("#submitter"+ self.submitter_id +" .required[type=text]");
	   console.log($("#submitter"+ self.submitter_id +" .required[type=text]"));

	   $("#submitter"+ self.submitter_id +" .required[type=text]").each(function() {
		  if (! this.value) {
			 full = false;
		  }
	   });

	   return full;
    }

    this.submit_form = function (self) {
	   /* Block the fields */
	   $("#submitter"+self.submitter_id +" input").attr("disabled", true); 
	   $("#submitter"+self.submitter_id +" #notice").html("Submitting..");

	   /* Build the post */
	   info = {};
	   $("#submitter"+self.submitter_id).children("input:text").each(function(){
		  info[this.name] = this.value;
	   });

	   /* Async post */
	   console.log ("REQUEST " + self.url);
	   $.ajax ({
		  type:     'POST',
		  url:       self.url,
		  async:     true,
		  dataType: 'json',
		  data:      info,
		  success:   function (data) {
			 if (data['ret'] != "ok") {
				console.log ("ENTRA");
				/* Set the error messages */
				for (var key in data['errors']) {
				    filter = "#submitter"+ self.submitter_id + "  [key='"+ key +"']";
				    $(filter).html (data['errors'][key]);
				}
			 }
			 console.log ("SALE");
		  },
		  error: function (xhr, ajaxOptions, thrownError) {
			 this.restore_orig_values (self);
		  },
		  complete:  function (XMLHttpRequest, textStatus) {
			 /* Unlock fields */
			 $("#submitter"+ self.submitter_id +" #notice").html("");
			 $("#submitter"+ self.submitter_id +" input").removeAttr("disabled"); 
		  }
	   });
    }
    
    this.input_keypress_cb = function(event) {
	   var self = event.data;
	   self.key_pressed = true;
    }

    this.input_checkbox_cb = function (event) {
	   var self = event.data;
	   self.check_changed = true;

	   if (! self.is_fulfilled(self)) {
		  return;
	   }

	   self.submit_form(self);
    }

    this.input_blur_cb = function (event) {
	   var self = event.data;

	   console.log("blur: "+self.submitter_id);

	   /* Only proceed when something */
	   if (! self.key_pressed) {
		  return;
	   }

	   /* Procced on the last entry */
	   last_req_text_filter = "#submitter" + self.submitter_id + " .required[type=text]:last";

	   if ($(last_req_text_filter).attr('id') != event.currentTarget.id) {
		  return;
	   }

	   /* Check fields fulfillness */
	   if (! self.is_fulfilled(self)) {
		  return;
	   }

	   self.submit_form (self);
    }
}
