// Initialize the reel when the page loads
document.addEventListener('DOMContentLoaded', updateReel);
document.querySelector('.randomBtn').addEventListener('click', getRandomImage);
document.querySelector('.toggle-explanation').addEventListener('click', toggleExplanation);
document.querySelector('.download-btn').addEventListener('click', downloadImage);

function toggleExplanation() {
    const container = document.querySelector('.explanation-container');
    const button = document.querySelector('.toggle-explanation');
    const isExpanded = container.classList.toggle('expanded');
    
    // Update ARIA states
    button.setAttribute('aria-expanded', isExpanded);
    
    // Announce state change to screen readers
    const announcement = isExpanded ? 'Explanation expanded' : 'Explanation collapsed';
    announceToScreenReader(announcement);
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove the announcement after it's been read
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
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
            reelItem.tabIndex = 0;
            reelItem.setAttribute('role', 'listitem');
            reelItem.setAttribute('aria-label', `APOD from ${image.date}`);
            
            // Create descriptive alt text
            const altText = `NASA Astronomy Picture of the Day from ${image.date}. ${image.copyright ? `Credit: ${image.copyright}.` : ''} ${image.explanation ? image.explanation.substring(0, 150) + '...' : ''}`;
            
            reelItem.innerHTML = `
                <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" 
                    data-src="${image.hdurl}" 
                    alt="${altText}"
                    loading="lazy"
                >
                <div class="date">${image.date}</div>
                <button class="remove-btn" aria-label="Remove image from recently viewed">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            `;
            
            const img = reelItem.querySelector('img');
            
            // Add load event listener
            img.addEventListener('load', () => {
                img.classList.add('loaded');
                announceToScreenReader(`Image from ${image.date} loaded`);
            });
            
            // Add error event listener
            img.addEventListener('error', () => {
                img.classList.add('error');
                console.error(`Failed to load image: ${image.hdurl}`);
                announceToScreenReader(`Failed to load image from ${image.date}`);
            });
            
            // Add click event to load the image
            const loadImage = () => {
                document.querySelector('.background-image').style.backgroundImage = `url('${image.hdurl}')`;
                document.querySelector('.background-image').setAttribute('aria-label', altText);
                document.querySelector('.copyright').innerText = image.copyright;
                document.querySelector('.date').innerText = image.date;
                document.querySelector('.explanation').innerText = image.explanation;
                document.querySelector('.explanation-container').classList.remove('hidden');
                document.querySelector('.explanation-container').classList.remove('expanded');
                document.querySelector('.toggle-explanation').setAttribute('aria-expanded', 'false');
                
                // Announce to screen readers
                announceToScreenReader(`Loaded image from ${image.date}`);
            };

            // Add click and keyboard event listeners
            reelItem.addEventListener('click', loadImage);
            reelItem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadImage();
                }
            });

            // Add click event to remove the image
            reelItem.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                removeImage(index);
                announceToScreenReader(`Removed image from ${image.date} from recently viewed`);
            });
            
            reel.appendChild(reelItem);

            // Load the actual image
            img.src = img.dataset.src;
        }
    });

    // Add keyboard navigation for the reel
    reel.addEventListener('keydown', (e) => {
        const items = Array.from(reel.querySelectorAll('.reel-item'));
        const currentIndex = items.findIndex(item => item === document.activeElement);
        
        if (currentIndex === -1) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex - 1].focus();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentIndex < items.length - 1) {
                    items[currentIndex + 1].focus();
                }
                break;
            case 'Home':
                e.preventDefault();
                items[0].focus();
                break;
            case 'End':
                e.preventDefault();
                items[items.length - 1].focus();
                break;
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
    
    // Announce error to screen readers
    announceToScreenReader(`Error: ${message}`);
    
    // Hide error after 1.5 seconds
    setTimeout(() => {
        errorElement.classList.remove('visible');
    }, 1500);
}

function showLoading() {
    const loadingElement = document.querySelector('.loading');
    loadingElement.classList.add('visible');
    announceToScreenReader('Loading new image');
}

function hideLoading() {
    const loadingElement = document.querySelector('.loading');
    loadingElement.classList.remove('visible');
}

function downloadImage() {
    const backgroundImage = document.querySelector('.background-image').style.backgroundImage;
    if (!backgroundImage) return;

    // Extract the URL from the background-image style
    const imageUrl = backgroundImage.slice(4, -1).replace(/["']/g, "");
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = imageUrl;
    
    // Get the date from the explanation container
    const date = document.querySelector('.date').innerText;
    link.download = `nasa-apod-${date}.jpg`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Announce download to screen readers
    announceToScreenReader(`Downloading image from ${date}`);
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

        const downloadBtn = document.querySelector('.download-btn');
        
        if (data.media_type === 'image') {  
            // Create descriptive alt text
            const altText = `NASA Astronomy Picture of the Day from ${data.date}. ${data.copyright ? `Credit: ${data.copyright}.` : ''} ${data.explanation ? data.explanation.substring(0, 150) + '...' : ''}`;
            
            document.querySelector('iframe').classList.add('hidden');
            document.querySelector('.explanation-container').classList.remove('hidden');
            document.querySelector('.background-image').style.backgroundImage = `url('${data.hdurl}')`;
            document.querySelector('.background-image').setAttribute('aria-label', altText);
            document.querySelector('.copyright').innerText = data.copyright || 'NASA';
            document.querySelector('.date').innerText = data.date;
            document.querySelector('.explanation').innerText = data.explanation;
            document.querySelector('.explanation-container').classList.remove('expanded');
            downloadBtn.classList.remove('hidden');
            saveToLocalStorage(data);
        } else if (data.media_type === 'video') {
            document.querySelector('iframe').classList.add('hidden');
            document.querySelector('.explanation-container').classList.remove('hidden');
            document.querySelector('iframe').src = data.url;
            document.querySelector('iframe').setAttribute('title', `NASA video from ${data.date}`);
            document.querySelector('.background').style.backgroundImage = `url('')`;
            document.querySelector('.copyright').innerText = data.copyright || 'NASA';
            document.querySelector('.date').innerText = data.date;
            document.querySelector('.explanation').innerText = data.explanation;
            document.querySelector('.explanation-container').classList.remove('expanded');
            downloadBtn.classList.add('hidden');
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
