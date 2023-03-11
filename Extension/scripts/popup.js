// 'use strict';

// function MainModel() {
// 	chrome.storage.sync.set(
// 		{
// 			selectedModel: 'MainModel'
// 		},
// 		function() {
// 			document.getElementById('main').checked = true;
// 			document.getElementById('secondary').checked = false;
// 		}
// 	);
// }

// function SecondaryModel() {
// 	chrome.storage.sync.set(
// 		{
// 			selectedModel: 'SecondaryModel'
// 		},
// 		function() {
// 			document.getElementById('main').checked = false;
// 			document.getElementById('secondary').checked = true;
// 		}
// 	);
// }

// function restore() {
// 	chrome.storage.sync.get([ 'selectedModel' ], function(items) {
// 		if (items.selectedModel === 'MainModel') {
// 			document.getElementById('main').checked = true;
// 			document.getElementById('secondary').checked = false;
// 		} else if (items.selectedModel === 'SecondaryModel') {
// 			document.getElementById('secondary').checked = true;
// 			document.getElementById('main').checked = false;
// 		} else {
// 			chrome.storage.sync.set({
// 				selectedModel: 'MainModel'
// 			});
// 			document.getElementById('main').checked = true;
// 			document.getElementById('secondary').checked = false;
// 		}
// 	});
// }

// document.addEventListener('DOMContentLoaded', restore);
// document.getElementById('main').onclick = MainModel;
// document.getElementById('secondary').onclick = SecondaryModel;


let onEmailScreen = false;
// set the link to the model server for image prediction
let serverUrl = 'http://127.0.0.1:5000'
let modelUrl = serverUrl+'/predict'
let emailUrl = serverUrl+'/send-mail'

function toggle(checkbox){

	if(checkbox.checked==false){
	
		$('.modal.content-warnining').modal({show:  true});
		// chrome.storage.sync.set({
		// 	isExtensionOn: false
		// });
	}else{
		$('.modal.content-warnining').modal({show:  false});
		chrome.storage.sync.set({
			isExtensionOn: true
		});
	}
	// console.log('------>checkbox clicked '+checkbox.checked)
}
function showContent(){
	onEmailScreen = true;
	$('.modal.age-confirm').modal({show:  true});
}

function resetToggle(){
	$("#selector").prop( "checked", true );
}

$(".modal.content-warnining").on("hidden.bs.modal", function () {
	if(!onEmailScreen)
	$("#selector").prop( "checked", true );
});


function isValidEmail(email){
	
	var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;

	if(!pattern.test(email))
	{
	return false;
	}else{
	return true;    
	}
}

function verifyEmail(){
	var email = $('#email').val();
	if(isValidEmail(email)){
	
		$(".modal.age-confirm").modal('hide');

		chrome.storage.sync.set({
			isExtensionOn: false
		});

		sendEmail(email);
		alert("Code Has been sent. Check your email");
		prompt('Enter Code for verification: ')

	}else{
		alert('Please, enter a valid email');
	}
}

function sendEmail(email){
	code =  Math.floor((Math.random() * 9999) + 1000);

	fetch(`${emailUrl}`, {
		method: 'POST',
		// url: `${baseUrl}?lnk=${btoa(image)}`,
		body: new URLSearchParams(`email=${email}&code=${code}`),
		headers: {
			'Access-Control-Allow-Origin': '*',
			// 'Access-Control-Allow-Methods': 'GET'
			'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
			'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'

		}
	})
}

//function to check if password and email are the one user entered
function verifyPassword() {
	var password = $('#userPassword').val();
	var email = $('#userEmail').val();

	chrome.storage.sync.get(["password"], function(items){
		var dbPassword = items.password;

		chrome.storage.sync.get(["email"], function(items){
			var dbEmail = items.email;

			// console.log(items.password);

			if(password === ''){
				alert('Enter Your Password ')
			}else if(email !== dbEmail){
				alert('You entered a wrong email')
				$('#userEmail').val('')
			}else if(password.length < 8){
				alert('Password should be 8 characters or more')
				$('#userPassword').val('')
			}else if(password === dbPassword){
				$(".modal.age-confirm").modal('hide');

				chrome.storage.sync.set({
					isExtensionOn: false
				});
				alert('Extension turned off successfully')
				$('#userPassword').val('')
				$('#userEmail').val('')
			}else{
				alert('You entered wrong password')
				$('#userPassword').val('')
				
			}
			
		});
	});
}


function getPasswordStrength(password) {
	var strength = 0;
	var message = 'Your password should contain at least one of each letter: ';
	if (password.match(/[a-z]+/)) {
	  strength += 1;
	}else{
		message += '\nSmall letter (a, b, c)';
	}
	if (password.match(/[A-Z]+/)) {
	  strength += 1;
	}else{
		message += '\nCapital letter (X, Y, Z)';
	}
	if (password.match(/[0-9]+/)) {
	  strength += 1;
	}else{
		message += '\nNumber (1,2,3)';
		
	}
	if (password.match(/[$@#&!]+/)) {
	  strength += 1;
	}else{
		message += '\nSpecial Character (&, #, %)';
		
	}

	if(strength < 4){
		alert(message);
		return true;
	}else{
		return false;
	}
}

$('#selector').on('change', function() {toggle( this );});
$('#buttonContinue').on('click', showContent);
$('#buttonCancel').on('click', resetToggle);
$('#buttonVerifyEmail').on('click', verifyPassword);


chrome.storage.sync.get(["isExtensionOn"], function(items){
	if(items.isExtensionOn) resetToggle();
	// console.log('--->'+items.isExtensionOn);
});


chrome.storage.sync.get(["password"], function(items){
	if(!items.password) {
		$(".modal.enter-password").modal('show');

		$('#buttonSubmitPassword').on('click', function(){
			var password = $('#password').val();
			var email = $('#email').val();
			var passwordConfirm = $('#passwordConfirm').val();

			if(email === ''){
				alert('Enter Your Email first')
			}else if(!isValidEmail(email)){
				alert('Please, enter a valid email');
			}else if(password === ''){
				alert('Enter Password to be used')
			}else if(password.length < 8){
				alert('Password should be 8 characters or more')
			}else if(password !== passwordConfirm){
				alert('Paswwords don\'t match')
			}else if(getPasswordStrength(password)){
				return;
			}else{
				$(".modal.enter-password").modal('hide');
				alert('Password and email saved successfully');

				//save the password and email to chrome storage
				chrome.storage.sync.set({
					password: password,
					email: email
				});

				//turn on the extension
				chrome.storage.sync.set({
					isExtensionOn: true
				});

				resetToggle();
			}

		})
	}
});
