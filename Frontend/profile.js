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

document.addEventListener('DOMContentLoaded', fetchUserProfile);

function fetchUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('error-message').textContent = 'Token not found. Please log in again.';
        document.getElementById('error-message').style.display = 'block';
        return;
    }

    fetch('http://192.168.1.28:3000/user/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }
        return response.json();
    })
    .then(userProfile => {
        console.log('User Profile:', userProfile);

        // Update the UI with the user profile
        document.getElementById('name').textContent = userProfile.user.name || 'N/A';
        document.getElementById('age').textContent = userProfile.user.age || 'N/A';
        document.getElementById('email').textContent = userProfile.user.email || 'N/A';
        document.getElementById('mobile').textContent = userProfile.user.mobile || 'N/A';
        document.getElementById('address').textContent = userProfile.user.address || 'N/A';
        document.getElementById('aadharCardNumber').textContent = userProfile.user.aadharCardNumber || 'N/A';
        document.getElementById('isVoted').textContent = userProfile.user.isVoted ? 'Yes' : 'No';
    })
    .catch(error => {
        console.error('Error fetching user profile:', error);
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent = 'Error fetching user profile. Please try again later.';
    });
}


// change pasword api start
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
        body: JSON.stringify({ currentPassword, newPassword }),
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Success message
        localStorage.clear();
        window.location.href = 'http://127.0.0.1:5500/Frontend/login.html';
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`); // Display error message from server
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An unexpected error occurred.');
    }
  });
  