const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


document.getElementById("viewCandidate").addEventListener("click", function() {
    // Navigate to the desired page
    window.location.href = "viewCandidate.html";
  });

document.getElementById("viewVoter").addEventListener("click", function() {
    // Navigate to the desired page
    window.location.href = "viewVoter.html";
  });

// sign up api start
document.getElementById('signUpForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form values
    const mobile = document.getElementById('mobile').value.trim();
    const aadharCardNumber = document.getElementById('aadharCardNumber').value.trim();

    // Client-side validation
    if (mobile.length !== 10 || isNaN(mobile)) {
        Swal.fire('Error!', 'Mobile number must be exactly 10 digits and numeric.', 'error');
        return;
    }

    if (aadharCardNumber.length !== 12 || isNaN(aadharCardNumber)) {
        Swal.fire('Error!', 'Aadhaar number must be exactly 12 digits and numeric.', 'error');
        return;
    }

    // Gather form data
    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value.trim(); // Ensure trimming extra spaces
    });

    const token = localStorage.getItem('token');

    try {
        // Send a POST request to your signup API
        const response = await fetch('http://192.168.1.28:3000/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Signup successful:', result);
            Swal.fire('Success!', 'Signup successful!', 'success');
            // Redirect or reset the form
            document.getElementById('signUpForm').reset();
        } else {
            const error = await response.json();
            console.error('Signup failed:', error);
            Swal.fire('Error!', error.error || 'Signup failed! Please try again.', 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        Swal.fire('Error!', 'Network error occurred. Please try again later.', 'error');
    }
});


// sign up api end

// ctreate candidate start
document.getElementById('addCandidateForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    const token = localStorage.getItem('token');
    try {
        // Send a POST request to your signup API
        const response = await fetch('http://192.168.1.28:3000/candidate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        // Handle response
        if (response.ok) {
            const result = await response.json();
            console.log('Candidate Add successful:', result);
            // alert('Created successful!');
            Swal.fire('Success!', 'Candidate created successful!', 'success');
            // You can redirect the user or show a success message here
        } else {
            const error = await response.json();
            console.error('Add failed:', error);
            // alert(data.error || 'Creation failed!');
            Swal.fire('Error!', data.error || 'Creation failed!', 'error');
            // Handle errors here
        }
    } catch (error) {
        console.error('Network error:', error);
        // Handle network errors here
    }
});
// ctreate candidate end

// logout api start
document.getElementById('logout').addEventListener('click', async function(event) {
    event.preventDefault(); // Prevent the default form submission
    const token = localStorage.getItem('token');

    // Check if token exists
    if (!token) {
        Swal.fire('Error!', 'You are not logged in!', 'error');
        return; // Exit the function early
    }

    try {
        // Send a POST request to your logout API
        const response = await fetch('http://192.168.1.28:3000/user/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        // Handle response
        if (response.ok) {
            const result = await response.json();
            console.log('Logout successful:', result);
            
            // Clear the local storage
            localStorage.clear();
            
            // Show success message
            Swal.fire('Success!', 'Logout successful!', 'success' ).then(() => {
                // Redirect to login page
                window.location.href = 'http://127.0.0.1:5500/Frontend/login.html';
            });
       
        } else {
            const error = await response.json();
            console.error('Logout failed:', error);

            // Show error message
            Swal.fire('Error!', error.error || 'Logout failed!', 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        Swal.fire('Error!', 'Network error occurred!', 'error');
    }
});

// change password api strat
document.getElementById('changePassword').addEventListener('click', async () => {
    const currentPassword = prompt('Enter your current password:');
    const newPassword = prompt('Enter your new password:');

    if (!currentPassword || !newPassword) {
        alert('Both current password and new password are required.');
        return;
    }

    try {
        const response = await fetch('http://192.168.1.28:3000/user/profile/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Add your token here
            },
            body: JSON.stringify({ currentPassword, newPassword}),
        });
        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            localStorage.clear();
            window.location.href = 'http://127.0.0.1:5500/Frontend/login.html';
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});

// validation for mobile and aadhar
document.getElementById('mobile').addEventListener('blur', function () {
    this.value = this.value.replace(/[^0-9]/g, ''); // Allow only digits
    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10); // Enforce max length
    }
    if (this.value.length !== 10) {
        alert('Mobile number is invalid!');
    }
});

document.getElementById('aadharCardNumber').addEventListener('blur', function () {
    this.value = this.value.replace(/[^0-9]/g, ''); // Allow only digits
    if (this.value.length > 12) {
        this.value = this.value.slice(0, 12); // Enforce max length
    }
    if (this.value.length !== 12) {
        alert('Aadhaar number is invalid!');
    }
});

