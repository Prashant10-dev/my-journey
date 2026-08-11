const theme=document.getElementById("theme");
theme.addEventListener("click",()=>{document.body.classList.toggle("light");theme.textContent=document.body.classList.contains("light")?"☀":"☾";});
