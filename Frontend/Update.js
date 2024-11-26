
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#update-form');
    const nameInput = document.querySelector('#name');
    const ageInput = document.querySelector('#age');
    const partyInput = document.querySelector('#party');
    const voteCountInput = document.querySelector('#voteCount');

    const urlParams = new URLSearchParams(window.location.search);
    const candidateId = urlParams.get('id');

    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (!token) {
        alert('Authorization token not found. Please log in again.');
        return;
    }

    if (!candidateId) {
        alert('No candidate selected for update.');
        return;
    }

    // Fetch all candidate data and find the candidate matching the ID
    fetch(`http://192.168.1.28:3000/candidate/allCandidate`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch candidate data.');
            }
            return response.json();
        })
        .then(candidates => {
            console.log('Candidates data:', candidates);

            // Find the candidate by ID
            const candidate = candidates.find(c => c._id === candidateId);

            if (!candidate) {
                alert('Candidate not found.');
                return;
            }

            // Populate the form with the candidate's data
            nameInput.value = candidate.name;
            ageInput.value = candidate.age;
            partyInput.value = candidate.party;
            voteCountInput.value = candidate.voteCount;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load candidate data. Please try again later.');
        });

    // Update candidate data on form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page

        const updatedData = {
            name: nameInput.value,
            age: parseInt(ageInput.value, 10), // Ensure age is a number
            party: partyInput.value,
            voteCount: parseInt(voteCountInput.value, 10), // Ensure voteCount is a number
        };

        fetch(`http://192.168.1.28:3000/candidate/${candidateId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update candidate.');
                }
                // alert('Candidate updated successfully.');
                return Swal.fire({
                    title: 'Success!',
                    text: 'Candidate updated successfully!',
                    icon: 'success',
                    timer: 2000, // Display for 2 seconds
                    showConfirmButton: false, // Hide the confirmation button
                });
            })
            .then(() => {
                // Redirect to the candidate list page after the alert
                window.location.href = 'viewCandidate.html';
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error!', 'Failed to update candidate. Please try again.!', 'error');
                // alert('Failed to update candidate. Please try again.');
            });
    });
});
