export const authenticate = async () => {
  const res = await fetch(window.API + "authenticate");
  const data = await res.json();
  return data;
};

export const toDataURL = (url) => {
    if (localStorage.getItem(url)) return (localStorage.getItem(url));
    else {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          localStorage.setItem(url, reader.result);
          return (reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    } 
}

