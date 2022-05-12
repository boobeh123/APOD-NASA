document.querySelector('button').addEventListener('click', getFetch)

function getFetch(){
  const date = document.querySelector('input').value;
  const url = 'https://api.nasa.gov/planetary/apod?api_key=TcR73ID38bVL1gJeI15IP33d9Pe6Y1NoIGBl0lEe&date='+date;

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        if (data.media_type == "video") {
            // Displays video if available
            document.querySelector('iframe').src = data.url;
        } else {
            // Displays image by default
            document.querySelector('img').src = data.hdurl;
        }
        // Displays name by default
        document.querySelector('h2').innerText = data.title;
        // Displays description by default
        document.querySelector('h3').innerText = data.explanation;
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}