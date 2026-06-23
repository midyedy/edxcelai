const faders = document.querySelectorAll('.fade-in');

const appearOnScroll = new IntersectionObserver(function(entries){
    entries.forEach(entry => {
        if(!entry.isIntersecting){
            return;
        } else {
            entry.target.classList.add('show');
            appearOnScroll.unobserve(entry.target);
        }
    });
});

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

const revealElements = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
    const triggerBottom = window.innerHeight * 0.85;

    revealElements.forEach(section => {
        const boxTop = section.getBoundingClientRect().top;

        if (boxTop < triggerBottom) {
            section.classList.add("show");
        }
    });
});


// Smooth page load
window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.remove("fade-out");
});

// Active menu highlight
const links = document.querySelectorAll(".nav-links a");

links.forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add("active");
    }
});
