function search() {
	const search_text = $("#ox_search").val().toLowerCase();
	const values = search_text.split(" ").filter((v) => v !== "");
	
	$("#ox_table li").each((idx, li) => {
		var li_text = li.innerText.toLowerCase();
		
		if ((values.some(w => w.length >= 3 && w !== "the" && w !== "and") ||
			 values.filter(w => containsNumber(w)).length >= 2) &&
			values.every((v) => ~li_text.indexOf(v))) {
			$(li).css("display", "");
		} else {
			$(li).css("display", "none");
		}
	});
}

function containsNumber(str) {
	return /\d/.test(str);
}

function handleSearchClick() {
	search();
	focusSearchBar();
}

function setEnabled(isEnabled) {
	var placeholderSearchText;
	if (isEnabled) {
		placeholderSearchText = "Type at least a word with at least 3 letters...";
	} else {
		placeholderSearchText = "Loading questions...";
	}
	
	$("#ox_search").attr("placeholder", placeholderSearchText);
	$("#ox_search").prop("disabled", !isEnabled);
	$("#ox_search_button").prop("disabled", !isEnabled);
	$("#ox_refresh_button").prop("disabled", !isEnabled);
}

function clearSearchBar() {
	$("#ox_search").val("");
}

function focusSearchBar() {
	$("#ox_search").focus();
}

var publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1b13hzm7voMdrloHWrHiVh8yMXebCS70OGcEg0fXkipI/pubhtml";
function init() {
    $("[data-toggle=\"tooltip\"]").tooltip().tooltip("hide"); 
	setEnabled(false);
	clearSearchBar();
	
	Tabletop.init({ key: publicSpreadsheetUrl,
					callback: showInfo,
					simpleSheet: true });
}

function reloadData() {
	setEnabled(false);
	
	$("#ox_table li").remove();
	init();
}

function addQuestion(question, result) {
	var ox_li;
	
	if (result) {
		ox_li = $("<li class=\"list-group-item list-group-item-success\" style=\"display: none;\">");
	} else {
		ox_li = $("<li class=\"list-group-item list-group-item-danger\" style=\"display: none;\">");
	}

	ox_li.append(question + "</div>");
	ox_li.appendTo("#ox_table");
}

var lastTimestamp;
function showInfo(data, tabletop) {
	var flags = {};

	const questions = tabletop.sheets("MapleOx").all()
		.reduce((a, ox) => a.concat({ Timestamp: ox.Timestamp, Question: ox.Question, Answer: ox.Answer }), [])
		.filter((e) => {
			if (flags[e.Question]) {
				return false;
			}
			
			flags[e.Question] = true;
			
			return true;
		})
		.sort(sort_by("Question", "Answer"));

	$.each(questions, function(i, ox) {
		addQuestion(ox.Question, ox.Answer === "TRUE");
		lastTimestamp = ox.Timestamp;
	});

	setRefreshButtonTooltip(questions);
	setEnabled(true);
	focusSearchBar();
}

var refreshButtonTooltipFormat;
function setRefreshButtonTooltip(questions) {
	const $refreshButton = $("#ox_search_button");
	if (refreshButtonTooltipFormat === undefined ||
		refreshButtonTooltipFormat === "") {
		refreshButtonTooltipFormat = $refreshButton.attr("data-original-title");
	}
	
	$refreshButton.attr("title", refreshButtonTooltipFormat.format(lastTimestamp, questions.length, questions.filter(q => q.Answer === "TRUE").length, questions.filter(q => q.Answer === "FALSE").length))
				  .tooltip("_fixTitle");
}

$(document).ready(init);
