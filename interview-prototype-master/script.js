$(document).ready(function(){

// GLOBAL VARIABLES
var current_page = "home";
var pages = ["home", "portfolio", "practice","recordings", "story", "work"];
var page_stack = [];
var interview_questions = [
"What are your strengths?",
"What are your weaknesses?",
"Why should we hire you?",
"What is your greatest professional achievement?",
"Tell me about a challenge or conflict you've faced at work, and how you dealt with it.",
"What type of work environment do you prefer?"
];
var saved_recordings = ["Practice 1", "Practice 2"];
var recording_keys = {"Practice 1": "Practice_11-05-18-13:44:44", "Practice 2": "Practice_11-07-18-16:22:25" };
var rating_types = ["Eye Contact", "Speaking", "Answers", "Pacing", "Confidence"]
var friend_feedback = {
	"Robert": {"recording_name": "Practice 1", "stars": 2,
		"comments":["Talk more about your strengths.", "Try to maintain eye contact with the employer."], 
		"ratings": [1,2,3,2,2]},
	"John": {"recording_name": "Practice 1","stars": 3,
		"comments":["Nicely done!", "Keep your eyes up and speak clearly."],
		"ratings": [3,2,4,3,2]},
	"Bobby": {"recording_name": "Practice 2","stars": 4,
		"comments":["Try not to look down too much.", "Good job on talking about your weaknesses!"],
		"ratings": [3,3,4,5,5]},
	"Maximillian": {"recording_name": "Practice 2", "stars": 4,
		"comments":["Try to maintain eye contact with the employer.", "Great responses!"], 
		"ratings": [2,4,4,5,5]}
}
var system_feedback = {"Practice 2": [3,3,4,4,4], "Practice 1": [2,2,3,2,1]}

var timer;

// FUNCTIONS
function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

function viewRecording(id) {
	var rec_id = id.substring(id.indexOf("!") + 1);
	$("#view_dialog").empty();
	$("#view_dialog").append("<p>Playing recording: " + rec_id + "</p>")
	$("#view_dialog").dialog("open");

	$("#view_dialog").append("<div class='practice_video'>" + 
					"<button class='record'></button>" +
					"</div>");

	$("#view_dialog .record").click(function() {
		$("#view_dialog .record").toggleClass("play");
	});
}

function shareRecording() {
	$("#share_dialog").dialog("open");
}

function friendFeedback(id) {
	var feedback = friend_feedback[id];
	$("#friend_dialog").empty();
	$("#friend_dialog").dialog("open");
	$("#friend_dialog").append("<p>" +  feedback.recording_name + " - " + id + "</p>");
	var friend_ratings = feedback.ratings;
	for (i = 0; i < rating_types.length; i ++) {
		$("#friend_dialog").append(generateRating(rating_types[i], friend_ratings[i]));
	}
	$("#friend_dialog").append(generateComments(feedback.comments));
}

function generateRating(type, rating){
	return "<div class='rating-report'>" + type + " : <div class='ratings'>"+ 
						"<span class='fa fa-circle checked'></span>".repeat(rating) +
						"<span class='fa fa-circle'</span>".repeat(5 - rating) +
					"</div> </div>";

}

function generateComments(comments){
	var str = "</br><div> Comments: </div>";
	var acc = "";
	for (i in comments) {
		acc += "<li>" + comments[i] + "</li>";
	}
	return str + "<ol>" + acc + "</ol>";
}

	
function systemFeedback(id) {
	var rec_id = id.substring(id.indexOf("!") + 1);
	var feedback = system_feedback[rec_id];
	console.log(system_feedback);
	$("#system_dialog").empty();
	$("#system_dialog").dialog("open");
	$("#system_dialog").append("<p>" +  rec_id + "</p>");
	for (i = 0; i < feedback.length; i ++) {
		$("#system_dialog").append(generateRating(rating_types[i], feedback[i]));
	}
}

// HIDE ALL NONE HOME PAGE STUFF
$(".friend_feedback_page").hide();
$(".interview").hide();
$(".practice").hide();
$(".recordings").hide();
$(".story").hide();
$(".work").hide();
$("#back_btn").hide();
$("#save_question_btn").hide();
$("#confirm_delete_question_btn").hide();


// Back button with a page stack
$("#back_btn").click(function(){
	if (page_stack.length){
		$("." + current_page).hide();
		current_page = page_stack.pop();
		$("." + current_page).show();
		
		if (page_stack.length == 0){
			$("#back_btn").hide();
		}

		//clearTimeout(timer);
	}
});

function num_stars(n){
	return ("<span class='fa fa-star checked'></span>".repeat(n) +
		"<span class='fa fa-star'></span>".repeat(5 - n));
}
function feedback_page() {
	$("." + current_page).hide();
	page_stack.push(current_page);
	current_page = "friend_feedback_page";
	$("." + current_page).show();
	$("#feedback_list").empty();
	// Display these
	for (key in friend_feedback){
		var stars = friend_feedback[key].stars
		$("#feedback_list").append("<li class='feedback' id='" + key + "'>"  + friend_feedback[key].recording_name + " - " + key +  
			"<div class='stars'>" + num_stars(stars) + "</li>");
	}
	$("#back_btn").show();

	$('.feedback').click(function(){
		friendFeedback(this.id);
	});
}

// Go to portfolio page
$("#friend_feedback_btn").click(function(){
	feedback_page();
});

// Go to interview questions page
$("#interview_btn").click(function(){
	$("." + current_page).hide();
	page_stack.push(current_page);
	current_page = "interview";
	$("." + current_page).show();
	$("#interview_questions").empty();
	for (question in interview_questions){
		$("#interview_questions").append("<p id='question_" + question + "'>" + interview_questions[question] + "</p>");
	}
	$("#back_btn").show();
});

// Go to practice page
$("#practice_btn").click(function(){
	// A Stopwatch instance that displays its time nicely formatted.
	var stopwatch = new Stopwatch(function(runtime) {
		// format time as m:ss.d
		var minutes = Math.floor(runtime / 60000);
		var seconds = Math.floor(runtime % 60000 / 1000);
		var decimals = Math.floor(runtime % 1000 / 100);
		var displayText = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
				
		// writing output to screen
		$("#timer_label").html(displayText);
	});
	
	var num_question = prompt("Please enter the number of questions to be asked:");

	// Recording button reset.
	if($('#recButton').hasClass('Rec')){
		$('#recButton').removeClass("Rec");
		$('#recButton').addClass("notRec");
	}

	$("#recordBtn").show();
	$("#next").hide();
	
	var recording_btn = $(".record");
	$(".record").hide();
	recording_btn.click(function() {
		recording_btn.toggleClass("play");
		if($('#recButton').hasClass('notRec')){
			$('#recButton').removeClass("notRec");
			$('#recButton').addClass("Rec");
		}
		else{
			$('#recButton').removeClass("Rec");
			$('#recButton').addClass("notRec");
		}
	});

	if (!!num_question && num_question > 0 && interview_questions.length > 1) {
		$("." + current_page).hide();
		page_stack.push(current_page);
		current_page = "practice";
		$("." + current_page).show();
		$("#back_btn").show();

		if (num_question > interview_questions.length) {
			num_question = interview_questions.length;
		}

		// Prompt to start recording
		var start = $("#recordBtn");
		start.click(function() {
			start.hide();
			next.show();
			$(".record").show();
			$('#recButton').removeClass("notRec");
			$('#recButton').addClass("Rec");
		});

		// flip through the random questions
		var random_questions = getRandomSubarray(interview_questions, num_question);		
		$("#practice_question").empty();
		$('#practice_question').addClass("new_question");
		$("#practice_question").append("<p>" + random_questions.pop() + "</p>");
		var done = false;
		var next = $("#next");
		next.hide();
		next.click(function() {
			if (done) {
				return false;
			}
			var question = random_questions.pop()
			if (!!question) {
				$("#practice_question").empty();
				$('#practice_question').removeClass("new_question");
				$('#practice_question').addClass("new_question");
				$("#practice_question").append("<p>" + question + "</p>");
			} else {
				// end of questions
				$('#practice_question').removeClass("new_question");
				$("#practice_question").empty();
				next.hide();
				var recording_name = prompt("Please enter a name for this saved recording: ");
				$("#practice_question").append("<p>Your practice interview is now complete. Your recording has been saved.</p>");
				var date = new Date();
				var recording = "Practice_" + (date.getMonth() + 1) + "-" + date.getDate() + "-" + String(date.getYear()).substring(1,3) + "-" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
				
				saved_recordings.push(recording_name);
				recording_keys[recording_name] = recording;
				system_feedback[recording_name] = [3 + Math.floor((2) * Math.random()), 3, 3 + Math.floor((2) * Math.random()), 3, 3 + Math.floor((2) * Math.random())]
				done = true;
			}
		});
	} else {
		if (num_question) {
			if (num_question <= 0){
				alert("Please enter a valid number of questions.");
			} else if (interview_questions.length < 1) {
				alert("There are no interview questions to practice with.");
			}
		}
		
	}
});

// Go to recordings page
$("#recordings_btn").click(function(){
	$("." + current_page).hide();
	page_stack.push(current_page);
	current_page = "recordings";
	$("." + current_page).show();
	$("#back_btn").show();

	$("#recordings_list").empty();
	for (i = 0; i < saved_recordings.length; i ++) {
		$("#recordings_list").append("<li>"+ 
									"<input class='recording_input' id='check" + i + "'type='checkbox'/>" +
									"<label for='check" + i + "'>" + saved_recordings[i] + "</label>" +
									"<ul class='submenu'>" +
										"<li><a href='#' class = 'view' id='view!" + recording_keys[saved_recordings[i]] + "' " + ">View</a></li>" +
									    "<li><a href='#' class = 'share' id='share!" + recording_keys[saved_recordings[i]] +"' " + ">Share</a></li>" +
									    "<li><a href='#' class = 'friend_feedback'" + ">View Friend Feedback</a></li>" +
									    "<li><a href='#' class = 'system_feedback' id='system!" + saved_recordings[i] +"' " + ">View System Feedback</a></li>" +
									"</ul></li>");
	}

	$(".view").click(function(){
		viewRecording(this.id);
	});

	$(".share").click(function(){
		shareRecording();
	});

	$(".friend_feedback").click(function(){
		feedback_page();
	});

	$(".system_feedback").click(function(){
		systemFeedback(this.id);
	});

});

// Add question to list of practice questions
$("#add_question_btn").click(function(){
	var question = prompt("Please enter a question to be added:");
	if (!!question) {
		var pos = interview_questions.length;
		interview_questions.push(question);
		$("#interview_questions").append("<p id='question_" + pos + "'>" + question + "</p>");
	}
});

// Edits interview questions
$("#edit_question_btn").click(function(){
	$("#add_question_btn").hide();
	$("#import_question_btn").hide();
	$("#edit_question_btn").hide();
	$("#delete_question_btn").hide();
	$("#save_question_btn").show();

	$("#interview_questions").empty();
	for (question in interview_questions){
		$("#interview_questions").append("<textarea rows='2' cols ='50' id='question_" + question + "'>" + interview_questions[question] + "</textarea>");
	}
});

// Saves interview questions
$("#save_question_btn").click(function(){
	$("#add_question_btn").show();
	$("#import_question_btn").show();
	$("#edit_question_btn").show();
	$("#delete_question_btn").show();
	$("#save_question_btn").hide();

	var l = interview_questions.length;
	var i;

	interview_questions = [];
	for (i = 0; i < l; i ++) {
		var question = $('#question_' + i).val();
		interview_questions.push(question);
	}

	interview_questions = interview_questions.filter(function(x) {
		return x.trim() != "";
	});
	
	$("#interview_questions").empty();

	for (question in interview_questions){
		$("#interview_questions").append("<p id='question_" + question + "'>" + interview_questions[question] + "</p>");
	}

});

// Selects questions to delete
$("#delete_question_btn").click(function(){
	$("#add_question_btn").hide();
	$("#import_question_btn").hide();
	$("#edit_question_btn").hide();
	$("#delete_question_btn").hide();
	$("#confirm_delete_question_btn").show();

	$("#interview_questions").empty();

	for (question in interview_questions){
		$("#interview_questions").append("<input id='selected_" + question + "' type='checkbox' class='check'/> " + "<p id='question_" + question + "' class='checkquestion'>" + interview_questions[question] + "</p> <br>");
	}
});

// Deletes questions
$("#confirm_delete_question_btn").click(function(){
	$("#add_question_btn").show();
	$("#import_question_btn").show();
	$("#edit_question_btn").show();
	$("#delete_question_btn").show();
	$("#confirm_delete_question_btn").hide();

	var l = interview_questions.length;
	for (var i = 0; i < l; i ++) {
		if ($("#selected_" + i).prop("checked")) {
			interview_questions[i] = "";
		}
	}

	interview_questions = interview_questions.filter(function(x) {
		return x.trim() != "";
	});

	$("#interview_questions").empty();
	for (question in interview_questions){
		$("#interview_questions").append("<p id='question_" + question + "'>" + interview_questions[question] + "</p>");
	}

});

// Imports questions from a text file
$("#import_question_btn").click(function(){

	var pos = interview_questions.length;
	$("#import_dialog").dialog("open");

	$("#file_input").change(function(){
		var file = file_input.files[0];
		var fileType = /text.*/;

		if (file.type.match(fileType)) {
			var reader = new FileReader();

		  	reader.onload = function(e) {
		    	fileContent = reader.result;
		    	var lines = fileContent.split('\n');
		    	for (var line = 0; line < lines.length; line++) {
		    		pos = interview_questions.length;
		    		if (lines[line].trim().length) {
		    			interview_questions.push(lines[line]);
		    			$("#interview_questions").append("<p id='question_" + pos + "'>" + lines[line] + "</p>");
		    		}
		    	}
		    	$("#import_dialog").dialog("close");
		  	}

		  	reader.readAsText(file); 
		} else {
			alert("File not supported! Please select a text file.");
		}
	});
	
});

$(".share_btn").click(function(){
	alert("This recording has been shared to " + this.id);
});

$("#view_dialog").dialog({
	autoOpen: false,
	width: 700
});


$("#share_dialog").dialog({
	autoOpen: false
});

$("#friend_dialog").dialog({
	autoOpen: false
});

$("#system_dialog").dialog({
	autoOpen: false
});

$("#import_dialog").dialog({
	autoOpen: false
});

/**
 * This file defines the Stopwatch class.
 * Note that it knows nothing about instances and how those instances are used.
 */
var Stopwatch;
if (!Stopwatch) 
    Stopwatch = {};

/**
 * Constructs a new Stopwatch instance.
 * @param {Object} displayTime the strategy for displaying the time
 */
function Stopwatch(displayTime){
    this.runtime = 0; // milliseconds
    this.timer = null; // nonnull iff runnig
    this.displayTime = displayTime; // not showing runtime anywhere
}

/**
 * The increment in milliseconds.
 * (This is a class variable shared by all Stopwatch instances.)
 */
Stopwatch.INCREMENT = 200

/**
 * Displays the time using the appropriate display strategy.
 */
Stopwatch.prototype.doDisplay = function(){
    if (!this.laptime) 
        this.displayTime(this.runtime);
    else 
        this.displayTime(this.laptime);
}

/**
 * Handles an incoming start/stop event.
 */
Stopwatch.prototype.startStop = function(){
    if (!this.timer) {
        var instance = this;
        this.timer = window.setInterval(function(){
            instance.runtime += Stopwatch.INCREMENT;
            instance.doDisplay();
        }, Stopwatch.INCREMENT);
    }
    else {
        window.clearInterval(this.timer);
        this.timer = null;
        this.doDisplay();
    }
}

/**
 * Handles an incoming reset/lap event.
 */
Stopwatch.prototype.resetLap = function(){
    if (!this.laptime) {
        if (this.timer) {
            this.laptime = this.runtime;
        }
        else {
            this.runtime = 0;
        }
    }
    else {
        delete this.laptime;
    }
    this.doDisplay();
}


});

