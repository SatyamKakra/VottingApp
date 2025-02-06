async function submitVote() {
    const candidates = document.getElementsByName('vote');
    let selectedCandidateId = null;

    console.log("candidates", candidates);

    // Find the selected candidate
    for (const candidate of candidates) {
        if (candidate.checked) {
            selectedCandidateId = candidate.id; // Get the ID of the selected candidate
            console.log('Selected Candidate ID:', selectedCandidateId);
            break;
        }
    }

    const confirmationElement = document.getElementById('confirmation');
    const token = localStorage.getItem('token');
    console.log(token);

    if (selectedCandidateId) {
        try {
            const response = await fetch(`http://192.168.1.28:3000/candidate/vote/${selectedCandidateId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ candidateId: selectedCandidateId })
            });

            const result = await response.json();

            if (!response.ok) {
                // Display the error message from the API
                console.error('Error submitting vote:', result.message || 'Unknown error');
                confirmationElement.innerText = `Error: ${result.message || 'An error occurred while submitting your vote.'}`;
                return;
            }

            console.log('Vote submitted successfully:', result);
            confirmationElement.innerText = `Vote submitted successfully!`;
        } catch (error) {
            console.error('Error submitting vote:', error);
            confirmationElement.innerText = `Error submitting vote: ${error.message || 'An unexpected error occurred.'}`;
        }
    } else {
        confirmationElement.innerText = 'Please select a candidate to vote.';
    }
}




document.addEventListener('DOMContentLoaded', (event) => {
    fetchCandidates();
});

const token = localStorage.getItem('token');; // Replace with your actual token

document.addEventListener('DOMContentLoaded', (event) => {
    fetchCandidates();
});

// const token = 'YOUR_TOKEN_HERE'; // Replace with your actual token

function fetchCandidates() {
    fetch('http://192.168.1.28:3000/candidate/allCandidate', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('API Response:', data); // Debugging log
        displayCandidates(data || []); // Use data.candidates if the API nests candidates
    })
    .catch(error => {
        console.error('Error fetching candidates:', error);
    });
}


function displayCandidates(candidates) {
    if (!Array.isArray(candidates)) {
        console.error('Expected an array but received:', candidates);
        return;
    }

    const container = document.getElementById('candidatesContainer');
    console.log('candidates', candidates);
    container.innerHTML = ''; // Clear existing content

    const partyImages = {
        BJP: './images/BJP.jpg',
        INC: './images/Congress.svg',
        AAP: './images/aap.jpg',
        SP: './images/Sp.png',
    };

    candidates.forEach(candidate => {
        const candidateDiv = document.createElement('div');
        candidateDiv.classList.add('candidate');

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = candidate._id;
        input.name = 'vote';
        input.value = candidate.name;

        const img = document.createElement('img');
        img.src = partyImages[candidate.party] || './images/default.jpg';
        img.alt = `Party Logo ${candidate.party}`;
        img.classList.add('party-logo');

        const label = document.createElement('label');
        label.htmlFor = candidate._id;
        label.textContent = candidate.name;

        candidateDiv.appendChild(input);
        candidateDiv.appendChild(img);
        candidateDiv.appendChild(label);
        container.appendChild(candidateDiv);
    });
}

