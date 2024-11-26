async function submitVote() {
    const candidates = document.getElementsByName('vote');
    let selectedCandidateId = null;

    for (const candidate of candidates) {
        if (candidate.checked) {
            selectedCandidateId = candidate.id; // Get the ID of the selected candidate
            console.log('Selected Candidate ID:', selectedCandidateId);
            break;
        }
    }

    const confirmationElement = document.getElementById('confirmation');

    if (selectedCandidateId) {
        try {
            const response = await fetch(`http://192.168.1.28:3000/candidate/vote/${selectedCandidateId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjI1MmFmMmU5YTQwNzNhNzA1Y2Q1OSIsImlhdCI6MTcyMzAzNzQ1MywiZXhwIjoxNzIzMDY3NDUzfQ.waXQRNOL-04mLuabZXGBXE7kqL9EPKjfpfJf9x8X5Ws'}`,
                },
                body: JSON.stringify({ candidateId: selectedCandidateId })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            confirmationElement.innerText = `Vote submitted successfully!`;
        } catch (error) {
            confirmationElement.innerText = `Error submitting vote: ${error.message}`;
        }
    } else {
        confirmationElement.innerText = 'Please select a candidate to vote.';
    }
}



document.addEventListener('DOMContentLoaded', (event) => {
    fetchCandidates();
});

const token = 'YOUR_TOKEN_HERE'; // Replace with your actual token

document.addEventListener('DOMContentLoaded', (event) => {
    fetchCandidates();
});

// const token = 'YOUR_TOKEN_HERE'; // Replace with your actual token

function fetchCandidates() {
    fetch('http://192.168.1.28:3000/candidate/allCandidate', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YWY3ODJlODVmMjdmYjZhNzI0NDBjZiIsImlhdCI6MTcyMzAyMTI0NywiZXhwIjoxNzIzMDUxMjQ3fQ.T1Qz32KqO1ZKwp2F83hDXO_DpaDPRh1Ck8xCo-T6Wno'}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayCandidates(data);
    })
    .catch(error => {
        console.error('Error fetching candidates:', error);
    });
}

function displayCandidates(candidates) {
    const container = document.getElementById('candidatesContainer');
    container.innerHTML = ''; // Clear existing content

    // Map of party IDs to image URLs
    const partyImages = {
        BJP: './images/BJP.jpg',
        INC: './images/Congress.svg',
        AAP: './images/aap.jpg',
        SP: './images/Sp.png',
        // Add more parties and their logos here
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
        // Use the party ID to get the appropriate image URL
        img.src = partyImages[candidate.party] || './images/BJP.jpg';
        img.alt = `Party Logo ${candidate.id}`;
        img.classList.add('party-logo');

        const label = document.createElement('label');
        label.htmlFor = `candidate${candidate.id}`;
        label.textContent = candidate.name;

        candidateDiv.appendChild(input);
        candidateDiv.appendChild(img);
        candidateDiv.appendChild(label);
        container.appendChild(candidateDiv);
    });
}
