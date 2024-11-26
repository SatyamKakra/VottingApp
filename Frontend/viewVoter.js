document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('#voter-table');
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    if (!token) {
        alert('Authorization token not found. Please log in again.');
        return;
    }

    fetch('http://192.168.1.28:3000/user/allVoter', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => {
            console.log("response", response);
            if (!response.ok) {
                throw new Error('Failed to fetch voter.');
            }
            return response.json();
        })
        .then(data => {
            console.log("data", data);
            if (data.user.length === 0) {
                const emptyRow = table.insertRow();
                const cell = emptyRow.insertCell();
                cell.colSpan = 9;
                cell.textContent = 'No voters available.';
                cell.style.textAlign = 'center';
            } else {
                data.user.forEach((voter, index) => {
                    const row = table.insertRow();
                    const serialCell = row.insertCell(0);
                    serialCell.textContent = index + 1; // Serial number starts from 1

                    // row.insertCell(1).textContent = voter._id;
                    row.insertCell(1).textContent = voter.name;
                    row.insertCell(2).textContent = voter.age;
                    row.insertCell(3).textContent = voter.email;
                    row.insertCell(4).textContent = voter.mobile;
                    row.insertCell(5).textContent = voter.address;
                    row.insertCell(6).textContent = voter.aadharCardNumber;
                    row.insertCell(7).textContent = voter.isVoted;

                    // Update Button
                    const updateCell = row.insertCell(8);
                    const updateButton = document.createElement('button');
                    updateButton.textContent = 'Update';
                    updateButton.addEventListener('click', () => {
                        window.location.href = `UpdateVoter.html?id=${voter._id}`;
                    });
                    updateCell.appendChild(updateButton);

                    // Delete Button
                    const deleteCell = row.insertCell(9);
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', () => {
                        Swal.fire({
                            title: 'Are you sure?',
                            text: `Do you really want to delete ${voter.name}?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, delete it!',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                fetch(`http://192.168.1.28:3000/user/${voter._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`,
                                    },
                                })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error('Failed to delete voter.');
                                        }
                                        Swal.fire(
                                            'Deleted!',
                                            `${voter.name} has been deleted.`,
                                            'success'
                                        ).then(() => {
                                            // Reload table after deletion
                                            location.reload();
                                        });
                                    })
                                    .catch(error => {
                                        console.error('Error:', error);
                                        Swal.fire(
                                            'Error!',
                                            'Failed to delete the voter. Please try again.',
                                            'error'
                                        );
                                    });
                            }
                        });
                    });
                    deleteCell.appendChild(deleteButton);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load voters. Please try again later.');
        });
});

