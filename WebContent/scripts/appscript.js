$(function(){
	
	/**
	 * @Author: Richa
	 * Function to restrict the user from entering the weird characters.
	 * Later we can generalize the regular expression for the characters we want to allow the
	 * user can type in.
	 * 
	 * */
	$('#chg-balloon-input').keyup(function()
	{
		var yourInput = $(this).val();
		re = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;
		var isSplChar = re.test(yourInput);
		if(isSplChar)
		{
			var no_spl_char = yourInput.replace(/[`~!@#$%^&*()_|+\-=?;:'".<>\{\}\[\]\\\/]/gi, '');
			$(this).val(no_spl_char);
		}
	});
 
});


// The User search API accepts a comma-separated list of usernames, and returns
// user data for any matching records

function checkUserAvailability(userName) {
	$.ajax("http://chegg-tutors.appspot.com/coding-challenge/api/user/?username="+userName).done(
			function(data) {
				// This logs user data, since the username is registered
				console.log(JSON.stringify(data));
				if(data.length>0) {
					//If we found user with the entered name, means the person is already registered. So that,
					// the same name will not be available.
					showUnavailableMessage(data[0].username);
				}
				else {
					showAvailableMessage(userName);
				}
			});
}

function multiUserCheckAvailability(userNameString) {
	$.ajax("http://chegg-tutors.appspot.com/coding-challenge/api/user/?username="+userNameString).done(
			function(data) {
				console.log(JSON.stringify(data));
				if(data.length>0) {
					showUnavailableMessage(data[0].username);
				}
				else {
					showAvailableMessage(userNameString);
				}
			});
}

/**
 * @Author: Richa
 * Method : showing Un-Available message with respect to the UserName entered.
 * And triggering a method to generate auto suggested names to register.
 * */
function showUnavailableMessage(userName) {
	$("#actionicon").html('<img id="theImg" src="./assets/images/alert.png" width="50" />');
	$("#actionMessage").html('<span id="validatedInputName">'+userName+'</span>'+" is not available. How about one of these.");
	$("#actionDiv").addClass('message');
	var suggestedNames = generateUserNameSuggestions(userName);
	checkSuggestionAvailability(suggestedNames,userName);
	
}

/**
 * @Author: Richa
 * Method : which shows the success message, 
 * that the username is available to move forward. And making the suggestion div 
 * to be empty due to previous searches.
 * */
function showAvailableMessage(userName) {
	$("#actionicon").html('<img id="theImg" src="./assets/images/success.png" width="30"/>');
	$("#actionMessage").html(" Congrats! "+'<span id="validatedInputName"> '+userName+' </span>'+" is available.");
	$("#actionDiv").addClass('message');
	$('#autoSuggestionDiv').empty();
}

/**
 * @Author: Richa
 * Method : The entry point of the aplication. which the user clicks on 
 * the Check Availability button to check whether the user can able 
 * to move forward with the entered username or not.
 * 
 * */
$("#chg-balloon-submit").click(function() {
	var userName = $('#chg-balloon-input').val();
	if(userName=='' || userName == undefined){
		$("#actionicon").html('<img id="theImg" src="./assets/images/alert.png" width="50" />');
		$("#actionMessage").html('<span style="color:red;"> Please enter Username. </span>');
		$('#autoSuggestionDiv').empty();
		return false;
	}
	if(userName.indexOf(',')>0) {
		userName = multiUserCheckAvailability(userName);
	}
	 else
		checkUserAvailability(userName);
});

/**
 * @Author: Richa
 * Method : Which is developed to generate the Auto Suggestive 
 * words to the user for Un-available user names.
 * 
 * */
function generateUserNameSuggestions(userName) {
	var suggestedUserNameString="";
	for(var i=0; i<2; i++) {
		
		/**Here in the below line, if want, we can call the makeUserName for random letters.
		 * Actually we have prepared the suggestive words before checking for availability, we used the
		 * static sample data as meaningful words to generate.
		 * */
		suggestedUserNameString = suggestedUserNameString + userName+words[Math.floor(Math.random() * words.length)]+",";
	}	
	var userNamewithNumber = userName + Math.floor(1000 + Math.random() * 9000);
	suggestedUserNameString = suggestedUserNameString + userNamewithNumber;
	return suggestedUserNameString;
}

/**
 * @Author: Richa
 * Method : Which is developed to check availability for the Auto-Suggestive 
 *          user names to enter into the application with a second chance.
 * 
 * */
function checkSuggestionAvailability (suggestedUserNameString, userName){
	var suggestedUserNamesArray = suggestedUserNameString.split(',');
	var bufferedUserArray = [];
    $.ajax("http://chegg-tutors.appspot.com/coding-challenge/api/user/?username="+suggestedUserNameString).done(
				function(data) {
					if(data.length>0 ) {
						$.each(data, function(index, item) {
							var index = suggestedUserNamesArray.indexOf(item.username);
							if(index != -1) {
								suggestedUserNamesArray.splice(index, 1);
							}
							
						});
						if(suggestedUserNamesArray.length>0) {
							$.merge(bufferedUserArray,suggestedUserNamesArray.slice(0));
						}
						/**
						 * IF the suggestive words are also not available, again we are invoking
						 * the same function with new suggestive words to check again the availability.
						 * until unless we got the three words, we are recursively calling this method.
						 * **/
						if(bufferedUserArray.length<3) {
							checkSuggestionAvailability (generateUserNameSuggestions(userName), userName);
							return false;
						}
						else
							suggestedUserNamesArray = bufferedUserArray.slice(0);
					} else {
						suggestedUserNamesArray.length = 3;
					}
					displayAutoSuggestedUserNames(suggestedUserNamesArray);
				});
}

/**
 * @Author: Richa
 * Method : Which is developed to prepare the Randomized words for User Names.
 * 
 * */
function makeUserName(userName) {
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
    	userName += possible.charAt(Math.floor(Math.random() * possible.length));
    return userName;
}

/**
 * @Author: Richa
 * Method : To display the Auto-Suggested words.
 * 
 * */
function displayAutoSuggestedUserNames(suggestedUserNamesArray) {
	var list = $('<ul/>');
	for (var i = 0; i < suggestedUserNamesArray.length; i++) {
	    list.append('<li class="suggestedName">'+suggestedUserNamesArray[i]+'</li>');
	}
	$('#autoSuggestionDiv').html(list);
}


/**
 * @Author: Richa
 * Sample Data : which is used to generate meaningful random words. 
 * For time being we have taken the static structured data. 
 * IF we want we can pull these from database and make these 
 * helpful to prepare some meaningful User Names..
 * 
 * */
var words = [ '', 'Special', 'Dynamic', 'Simple', 'Great', 'Better',
		'Stronger', 'Stylish', 'Flawless', 'Envied', 'Strong', 'Sucessful',
		'Grow', 'Innovate', 'Global', 'Knowledgable', 'Unique', 'Trusted', 'love',
		'Efficient', 'Reliable', 'Stable', 'Secure', 'Sofisticated', 'apple', 'lovely',
		'Evolving', 'Colorful', 'Admirable', 'awesome', 'Trending', 'Shine', 'honest',
		'Noted', 'Famous', 'Inspiring', 'Important', 'Bigger', 'Stylish', 'super',
		'Expand', 'Proud', 'Awesome', 'Solid', 'kills', 'grows', 'never' ];