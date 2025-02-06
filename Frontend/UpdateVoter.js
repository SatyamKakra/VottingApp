
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#updateVoter-form');
    const nameInput = document.querySelector('#name');
    const ageInput = document.querySelector('#age');
    const emailInput = document.querySelector('#email');
    const mobileInput = document.querySelector('#mobile');
    const addressInput = document.querySelector('#address');
    const aadharCardNumberInput = document.querySelector('#aadharCardNumber');
    // const isVotedInput = document.querySelector('#isVoted');

    const urlParams = new URLSearchParams(window.location.search);
    const voterId = urlParams.get('id');

    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (!token) {
        alert('Authorization token not found. Please log in again.');
        return;
    }

    if (!voterId) {
        alert('No voter selected for update.');
        return;
    }

    // Fetch all voter data and find the voter matching the ID
    fetch(`http://192.168.1.28:3000/user/allVoter`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch voter data.');
            }
            return response.json();
        })
        .then(voters => {
            console.log('Voters data:', voters);

            // Find the voter by ID
            const voter = voters.user.find(c => c._id === voterId);

            if (!voter) {
                alert('Voter not found.');
                return;
            }
            let mobileNumber = voter.mobile.startsWith('+') ? voter.mobile.substring(1) : voter.mobile;
            // Populate the form with the voter's data
            nameInput.value = voter.name;
            ageInput.value = voter.age;
            emailInput.value = voter.email;
            mobileInput.value = mobileNumber;
            addressInput.value = voter.address;
            aadharCardNumberInput.value = voter.aadharCardNumber;
            // isVotedInput.value = voter.isVoted;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load voter data. Please try again later.');
        });

    // Update voter data on form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page

        const updatedData = {
            name: nameInput.value,
            age: parseInt(ageInput.value, 10), // Ensure age is a number
            email: emailInput.value,
            mobile: mobileInput.value,
            address: addressInput.value, 
            aadharCardNumber: aadharCardNumberInput.value, 
            // isVoted: isVotedInput.value, 
        };

        fetch(`http://192.168.1.28:3000/user/${voterId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update voter.');
                }
                // alert('Candidate updated successfully.');
                return Swal.fire({
                    title: 'Success!',
                    text: 'Voter updated successfully!',
                    icon: 'success',
                    timer: 2000, // Display for 2 seconds
                    showConfirmButton: false, // Hide the confirmation button
                });
            })
            .then(() => {
                // Redirect to the voter list page after the alert
                window.location.href = 'viewVoter.html';
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error!', 'Failed to update voter. Please try again.!', 'error');
                // alert('Failed to update voter. Please try again.');
            });
    });
});
