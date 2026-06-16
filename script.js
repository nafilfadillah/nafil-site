AOS.init({
    duration: 1000,
    once: true
});

document.querySelectorAll('.skill-card, .project-card').forEach(card => {

    card.addEventListener('mousemove', e => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform =
            `perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale(1.05)`;

    });

    card.addEventListener('mouseleave', () => {

        card.style.transform =
            'perspective(1000px) rotateX(0) rotateY(0) scale(1)';

    });

});

window.addEventListener("load", () => {

    setTimeout(() => {

        const loader = document.getElementById("loader");

        if(loader){
            loader.style.opacity = "0";

            setTimeout(() => {
                loader.style.display = "none";
            }, 1000);
        }

    }, 2000);

});

const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');

if(dot && outline){

    document.addEventListener('mousemove', e => {

        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';

        outline.animate({
            left: e.clientX + 'px',
            top: e.clientY + 'px'
        },{
            duration: 300,
            fill: 'forwards'
        });

    });

    document.querySelectorAll(
        '.skill-card,.project-card,.btn,.contact-card,.nav-links a'
    ).forEach(el => {

        el.addEventListener('mouseenter', () => {

            outline.style.width = '70px';
            outline.style.height = '70px';
            outline.style.borderColor = '#818cf8';

        });

        el.addEventListener('mouseleave', () => {

            outline.style.width = '40px';
            outline.style.height = '40px';
            outline.style.borderColor = '#38bdf8';

        });

    });

}
