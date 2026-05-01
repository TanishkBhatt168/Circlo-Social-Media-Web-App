const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        // 1. Create a dummy image file
        const dummyImagePath = path.join(__dirname, 'dummy.png');
        fs.writeFileSync(dummyImagePath, 'dummy content');

        // 2. Register user
        const username = 'testuser_' + Date.now();
        console.log('Registering', username);
        const regRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email: username + '@test.com',
                password: 'password123'
            })
        });
        const regData = await regRes.json();
        const token = regData.token;
        const userId = regData.id;
        console.log('Registered, ID:', userId);

        // 3. Upload image
        const fileData = fs.readFileSync(dummyImagePath);
        const fileBlob = new Blob([fileData], { type: 'image/png' });

        const formData = new FormData();
        formData.append('avatar', fileBlob, 'dummy.png');

        console.log('Uploading image...');
        const uploadRes = await fetch(`http://localhost:5000/api/users/${userId}/avatar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!uploadRes.ok) {
            console.error('Upload failed with status:', uploadRes.status);
            const errText = await uploadRes.text();
            console.error('Error details:', errText);
            return;
        }

        const uploadData = await uploadRes.json();
        console.log('Upload success:', uploadData);
    } catch (e) {
        console.error('Error:', e);
    }
}

testUpload();
