// Initialize the reel when the page loads
document.addEventListener('DOMContentLoaded', updateReel);
document.querySelector('.randomBtn').addEventListener('click', getRandomImage);
document.querySelector('.toggle-explanation').addEventListener('click', toggleExplanation);

function toggleExplanation() {
    const container = document.querySelector('.explanation-container');
    container.classList.toggle('expanded');
}

function updateReel() {
    const reel = document.querySelector('.reel');
    const savedImages = JSON.parse(localStorage.getItem('apodImages')) || [];
    
    // Clear existing reel items
    reel.innerHTML = '';
    
    // Add each saved image to the reel
    savedImages.forEach((image, index) => {
        if (image.media_type === 'image') {
            const reelItem = document.createElement('div');
            reelItem.className = 'reel-item';
            reelItem.innerHTML = `
                <img src="${image.hdurl}" alt="APOD from ${image.date}">
                <div class="date">${image.date}</div>
                <button class="remove-btn" aria-label="Remove image">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add click event to load the image
            reelItem.querySelector('img').addEventListener('click', () => {
                document.querySelector('.background-image').style.backgroundImage = `url('${image.hdurl}')`;
                document.querySelector('.copyright').innerText = image.copyright;
                document.querySelector('.date').innerText = image.date;
                document.querySelector('.explanation').innerText = image.explanation;
                document.querySelector('.explanation-container').classList.remove('hidden');
                document.querySelector('.explanation-container').classList.remove('expanded');
            });

            // Add click event to remove the image
            reelItem.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the image click event
                removeImage(index);
            });
            
            reel.appendChild(reelItem);
        }
    });
}

function removeImage(index) {
    // Get current saved images
    let savedImages = JSON.parse(localStorage.getItem('apodImages')) || [];
    
    // Remove the image at the specified index
    savedImages.splice(index, 1);
    
    // Save the updated array back to localStorage
    localStorage.setItem('apodImages', JSON.stringify(savedImages));
    
    // Update the reel display
    updateReel();
}

function saveToLocalStorage(data) {
    // Create an object with the data we want to save
    const apodData = {
        hdurl: data.hdurl,
        copyright: data.copyright,
        date: data.date,
        explanation: data.explanation,
        media_type: data.media_type,
        url: data.url
    };

    // Get existing data from localStorage or initialize empty array
    let savedImages = JSON.parse(localStorage.getItem('apodImages')) || [];
    
    // Add new data to the array
    savedImages.push(apodData);
    
    // Save back to localStorage
    localStorage.setItem('apodImages', JSON.stringify(savedImages));
    
    // Update the reel with the new image
    updateReel();
}

function showError(message) {
    const errorElement = document.querySelector('.error-message');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
    
    // Hide error after 1.5 seconds
    setTimeout(() => {
        errorElement.classList.remove('visible');
    }, 1500);
}

function showLoading() {
    document.querySelector('.loading').classList.add('visible');
}

function hideLoading() {
    document.querySelector('.loading').classList.remove('visible');
}

async function getRandomImage() {
    showLoading();
    try {
        const date = formatDate(randomDate());
        const url = `https://api.nasa.gov/planetary/apod?api_key=TcR73ID38bVL1gJeI15IP33d9Pe6Y1NoIGBl0lEe&date=${date}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || 'Failed to fetch image');
        }

        if (data.media_type === 'image') {  
            document.querySelector('iframe').classList.add('hidden');
            document.querySelector('.explanation-container').classList.remove('hidden');
            document.querySelector('.background-image').style.backgroundImage = `url('${data.hdurl}')`;
            document.querySelector('.copyright').innerText = data.copyright || 'NASA';
            document.querySelector('.date').innerText = data.date;
            document.querySelector('.explanation').innerText = data.explanation;
            document.querySelector('.explanation-container').classList.remove('expanded');
            saveToLocalStorage(data);
        } else if (data.media_type === 'video') {
            document.querySelector('iframe').classList.add('hidden');
            document.querySelector('.explanation-container').classList.remove('hidden');
            document.querySelector('iframe').src = data.url;
            document.querySelector('.background').style.backgroundImage = `url('')`;
            document.querySelector('.copyright').innerText = data.copyright || 'NASA';
            document.querySelector('.date').innerText = data.date;
            document.querySelector('.explanation').innerText = data.explanation;
            document.querySelector('.explanation-container').classList.remove('expanded');
            saveToLocalStorage(data);
        }
    } catch (error) {
        console.error('Error fetching image:', error);
        showError(`Failed to load image: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function randomDate(){
    var startDate = new Date(1994,0,1).getTime();
    var endDate =  new Date().getTime();
    var spaces = (endDate - startDate);
    var timestamp = Math.round(Math.random() * spaces);
    timestamp += startDate;
    return new Date(timestamp);
 }
 function formatDate(date){
     var month = randomDate().getMonth();
     var day = randomDate().getDate();
 
     month = month < 10 ? '0' + month : month;
     day = day < 10 ? '0' + day : day;
 
     return String(`${date.getFullYear()}-${month}-${day}`);
 }
