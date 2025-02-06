
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

		Swal.fire('Success!', 'Login successful!', 'success' ).then(() => {
		if (role === 'admin') {
		  window.location.href = 'http://127.0.0.1:5500/Frontend/admin.html';
		} else {
		  window.location.href = 'http://127.0.0.1:5500/Frontend/profile.html';
		}
			// Redirect to login page

		});
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

//   forgot password api start 
document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior

    // Prompt the user to enter their email
    const email = prompt('Please enter your email address to reset your password:');
    
    if (email) {
        // Call the Forgot Password API
        forgotPassword(email);
    } else {
        alert('Email is required to reset your password.');
    }
});

async function forgotPassword(email) {
    try {
        const response = await fetch('http://127.0.0.1:3000/user/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }), // Send the email in the request body
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message || 'Password reset email sent successfully.');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to send password reset email.');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred. Please try again later.');
    }
}

