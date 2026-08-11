const themeBtn=document.getElementById("themeBtn");
const saved=localStorage.getItem("theme");
if(saved==="dark"){document.body.classList.add("dark");themeBtn.textContent="☀️"}else{themeBtn.textContent="🌙"}
themeBtn.addEventListener("click",()=>{document.body.classList.toggle("dark");const dark=document.body.classList.contains("dark");localStorage.setItem("theme",dark?"dark":"light");themeBtn.textContent=dark?"☀️":"🌙"});
const menu=document.querySelector(".menu-btn"),links=document.querySelector(".links");
menu.addEventListener("click",()=>links.classList.toggle("open"));
document.querySelectorAll(".links a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));
document.getElementById("year").textContent=new Date().getFullYear();
