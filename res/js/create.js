

function createPoll() {
  var title = document.getElementById("title").value.trim();
  var description = document.getElementById("description").value.trim();

  if (title.length !== 0) {

    const http = new XMLHttpRequest();
    const url = 'http://localhost:8000/poll';
    const content = {
      title: title,
      desc: description,
    };
    http.open("POST", url);
    http.send(JSON.stringify(content));
    
    console.log("Creating poll.. "+JSON.stringify(content)+"");

    http.onreadystatechange = function () {
      if (this.readyState == 4) {
        
        if (this.status == 200) {
          console.log(this.responseText);
        } else {
          console.log("Something went wrong ("+this.status+ ") "+this.responseText);
        }

      }
    }

  }
}