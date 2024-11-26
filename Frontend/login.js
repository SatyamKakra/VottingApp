
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// signUpButton.addEventListener('click', () => {
// 	container.classList.add("right-panel-active");
// });

// signInButton.addEventListener('click', () => {
// 	container.classList.remove("right-panel-active");
// });


// login api start
document.getElementById('loginForm').addEventListener('submit', async function (event) {
	event.preventDefault(); // Prevent default form submission
  
	// Collect form data
	const aadharCardNumber = document.getElementById('aadharCardNumber').value;
	const password = document.getElementById('password').value;
  
	try {
	  // Send POST request to login API
	  const response = await fetch('http://192.168.1.28:3000/user/login', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ aadharCardNumber, password }),
	  });
  
	  const data = await response.json();
  
	  if (response.ok) {
		// Handle successful response (e.g., store the token, redirect)
		const token = data.token;
		const role = data.data.role; // Assuming the API returns the user's role
		localStorage.setItem('token', token); // Store token in local storage
		localStorage.setItem('role', role); // Store role in local storage
		console.log("role",role)
		console.log("token",token)

		if (role === 'admin') {
		  window.location.href = 'http://127.0.0.1:5500/Frontend/admin.html';
		} else {
		  window.location.href = 'http://127.0.0.1:5500/Frontend/voting.html';
		}
		Swal.fire('Success!', 'Login successful!', 'success');
		// alert('Login successful!');
	  } else {
		// Handle errors (e.g., display error message)
		alert(data.error || 'Login failed!');
	  }
	} catch (error) {
	  // Handle network errors or unexpected issues
	  Swal.fire('Error!', 'An error occurred. Please try again later.!', 'error');
	  console.error('Error:', error);
	//   alert('An error occurred. Please try again later.');
	}
  });

  // login api end