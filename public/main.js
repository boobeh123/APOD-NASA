document.querySelector('.submitBtn').addEventListener('click', getDatedImage);
document.querySelector('.randomBtn').addEventListener('click', getRandomImage);

async function getDatedImage() {
    const date = document.querySelector('.dateInput').value;
    const url = `https://api.nasa.gov/planetary/apod?api_key=TcR73ID38bVL1gJeI15IP33d9Pe6Y1NoIGBl0lEe&date=${date}`;
    let response = await fetch(url);
    let data = await response.json();

    if (data.media_type === 'image') {  
        // document.querySelector('.background-image').style.backgroundImage = `url('${data.url}')`;
        document.querySelector('.background-image').style.backgroundImage = `url('${data.hdurl}')`;
        document.querySelector('iframe').classList.add('hidden')
        document.querySelector('.copyright').innerText = data.copyright;
        document.querySelector('.date').innerText = data.date;
    } else if (data.media_type === 'video') {
        document.querySelector('iframe').classList.remove('hidden')
        document.querySelector('iframe').src = data.url
        document.querySelector('.background').style.backgroundImage = `url('')`;
        document.querySelector('.copyright').innerText = data.copyright;
        document.querySelector('.date').innerText = data.date;
    }

}

async function getRandomImage() {
    const date = formatDate(randomDate());
    const url = `https://api.nasa.gov/planetary/apod?api_key=TcR73ID38bVL1gJeI15IP33d9Pe6Y1NoIGBl0lEe&date=${date}`;
    let response = await fetch(url);
    let data = await response.json();

    if (data.media_type === 'image') {  
        // document.querySelector('.background-image').style.backgroundImage = `url('${data.url}')`;
        document.querySelector('.background-image').style.backgroundImage = `url('${data.hdurl}')`;
        document.querySelector('iframe').classList.add('hidden')
        document.querySelector('.copyright').innerText = data.copyright;
        document.querySelector('.date').innerText = data.date;
    } else if (data.media_type === 'video') {
        document.querySelector('iframe').classList.remove('hidden')
        document.querySelector('iframe').src = data.url
        document.querySelector('.background').style.backgroundImage = `url('')`;
        document.querySelector('.copyright').innerText = data.copyright;
        document.querySelector('.date').innerText = data.date;
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
