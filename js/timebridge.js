$(document).ready(function() {
    // initialize elements
    $('.timeformat').selectize();
    $('.timezone').selectize({
	    plugins: ['remove_button'],
	});
    let timezone_str = localStorage.getItem('timezone');
	let timeformat = localStorage.getItem('timeformat');
	let timezone_elem = $('.featured-section').find('#timezone').selectize()[0].selectize;
	let timeformat_elem = $('.featured-section').find('#timeformat').selectize()[0].selectize;
	if(timezone_str){
		timezone = JSON.parse(timezone_str);
		timezone_elem.setValue(timezone);
	}
	if(timeformat){
		timeformat_elem.setValue(timeformat);
	}
	// call to fn to render converted date by timezone and date format
	render_date_content();
});	
// Show date convert content
$(document).off('click','.date_conv');
$(document).on('click','.date_conv',function(e){
	e.preventDefault();
	$('.date_conv_content').show();
	$('.date_diff_content').hide();
});
// Show date difference content
$(document).off('click','.date_diff');
$(document).on('click','.date_diff',function(e){
	e.preventDefault();
	$('.date_diff_content').show();
	$('.date_conv_content').hide();
});
// submit NLP time or timestamp
$(document).off('click','.submit_time');
$(document).on('click','.submit_time',function(e){
	e.preventDefault();
	render_date_content();
});
// Copy timestamp to clipboard
$(document).off('click','.copy_clipboard');
$(document).on('click','.copy_clipboard',function(e){
	e.preventDefault();
	let elem = $(this);
	var temp = $("<input>");
	$("body"). append(temp);
	temp.val($('.timestamp_data').text()). select();
	document.execCommand("copy");
	temp.remove();
	elem.attr('data-tooltip','Copied to clipboard');
	setTimeout(function() {
		elem.attr('data-tooltip','Copy to clipboard');
	}, 1000);
});
// function to render time convertion
function render_date_content(){

	let time_str = $('.hero-section').find('#keyword').val();
	let time_components = $('.featured-section');

	let timezone = time_components.find('#timezone').val();
	let timeformat = time_components.find('#timeformat').val();
	let timezone_str = JSON.stringify(timezone);
	localStorage.setItem('timezone', timezone_str);
	localStorage.setItem('timeformat', timeformat);

    let date = new Date();
    // console.log(date);
	let timestamp_from_str = date.getTime();
	timestamp_from_str = Math.floor(timestamp_from_str / 1000);		
	if(isUnixTimestamp(time_str)){
		let timestamp = parseInt(time_str, 10) * 1000;
		date = new Date(timestamp);
	}else if(time_str){
		let str_to_date = convert_chrono_time(time_str);
		date = (str_to_date.length > 0) ?  str_to_date[0].start.date() : '';
		let date_time = new Date(date);
		timestamp_from_str = date_time.getTime();
		timestamp_from_str = Math.floor(timestamp_from_str / 1000);
	}

	if(date){
		timezone = (timezone) ? timezone : ['Asia/Kolkata'];
		timeformat = (timeformat) ? timeformat : 'DD MMMM, YYYY h:mm A';
		$('.time_content').empty();
		$('.timestamp_data').remove();
		$('.time_content').before(`<div class="timestamp_content">Time stamp : <span class="timestamp_data">${timestamp_from_str}</span> <span class="copy_clipboard" data-tooltip-anchor="top" data-tooltip="Copy to clipboard"><i class="bi bi-clipboard"></i></span></div>`);
		timezone.forEach((timezone_elem,i) => {
			let formatted_date = moment.tz(date, timezone_elem).format(timeformat);
			let contont_cls = (i%2 == 0) ? 'formated_time_l' : 'formated_time_r';
			$('.time_content').append(`<span class="col-6 ${contont_cls}">
											<div>${timezone_elem}</div>
											<div>${formatted_date}</div>
										</span>`);
		});
		$('.time_instruction').hide();
		$('.time_content').css({'display':'flex'});
	}else{
		$('.timestamp_content').remove();
		$('.time_content').html(`<span class="no_data">Not a date format</span>`);
	}
	
}

// convert string to date using NLP
function convert_chrono_time(text){

    var referenceDate = new Date();
    var options = { forwardDate: true };
    var result_data = [];
    chrono.casual.parse(text, referenceDate, options).forEach((result) => {
        result_data.push(result);
    });

    return result_data;
}

// check if value is timestamp
function isUnixTimestamp(input) {
    if (/^\d+$/.test(input)) {
        let timestamp = parseInt(input);
        let currentTimestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
        let earliestTimestamp = 0; // Define your earliest acceptable Unix timestamp here

        return timestamp >= earliestTimestamp && timestamp <= currentTimestamp;
    }
    return false;
}

// Render date diffrence between two dates
$(document).off('click','.submit_diff_time');
$(document).on('click','.submit_diff_time', function(e){
	e.preventDefault();
	let elem = $(this);
	let date_1 = $('.date_diff_wrap').find('#date_1').val();
	let date_2 = $('.date_diff_wrap').find('#date_2').val();
	let diffDays = getDateDifference(date_1,date_2); //call fn to find difference between 2 dates
	$('.time_diff_text').html(`
								<p>There are <b>${diffDays.years} Years</b> between ${date_1} and ${date_2}</p>
								<p>There are <b>${diffDays.months} Months</b> between ${date_1} and ${date_2}</p>
								<p>There are <b>${diffDays.days} Days</b> between ${date_1} and ${date_2}</p>
								<p>There are <b>${diffDays.hours} Hours</b> between ${date_1} and ${date_2}</p>
						`);
});

// Render date difference between two dates using NLP on keyup
$(document).off('keyup','#diff_keyword');
$(document).on('keyup','#diff_keyword', function(e){
	e.preventDefault();
	let elem = $(this);
	let date_str = elem.val();
	let date_arr = convert_chrono_time(date_str);
	console.log(date_arr);
	if(date_arr.length > 1){
		let date_1 = date_arr[0].start.date();
		let date_2 = date_arr[1].start.date();

		let date1_text = formattedDate(date_1);
		let date2_text = formattedDate(date_2);
		let date_text = ` between ${date1_text} and ${date2_text}`;

		let diffDays = getDateDifference(date_1,date_2); 
		$('.time_diff_text').html(`
									<p>There are <b>${diffDays.years} Years</b>${date_text}</p>
									<p>There are <b>${diffDays.months} Months</b>${date_text}</p>
									<p>There are <b>${diffDays.days} Days</b>${date_text}</p>
									<p>There are <b>${diffDays.hours} Hours</b>${date_text}</p>
							`);
	}else{
		$('.time_diff_text').html(`<p>Not enough data</p>`);
	}
	
});

// date to DD/MM/YYYY format
function formattedDate(date_str) {
	
	let inputDate = new Date(date_str);

	let day = inputDate.getDate().toString().padStart(2, '0');
	let month = (inputDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
	let year = inputDate.getFullYear();

	let formattedDate = `${day}/${month}/${year}`;
	return formattedDate;
}

// function to find difference between 2 dates
function getDateDifference(date1, date2) {
  const start = new Date(date1);
  const end = new Date(date2);

  // Calculate the absolute time difference in milliseconds
  const timeDifference = Math.abs(end - start);

  // Calculate the difference in years, months, days, and hours
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  const millisecondsInMonth = millisecondsInDay * 30.44; // Average days in a month
  const millisecondsInYear = millisecondsInDay * 365.25; // Average days in a year

  const yearsDifference = Math.floor(timeDifference / millisecondsInYear);
  const monthsDifference = Math.floor(timeDifference / millisecondsInMonth);
  const daysDifference = Math.floor(timeDifference / millisecondsInDay);
  const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));

  return {
    years: yearsDifference,
    months: monthsDifference,
    days: daysDifference,
    hours: hoursDifference
  };
}
