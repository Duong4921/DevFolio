document.addEventListener('DOMContentLoaded', () => {
    // --- Dark / Light Mode Toggle Logic ---
    try {
        const toggleThemeBtn = document.getElementById('theme-toggle');
        const body = document.body;

        if (toggleThemeBtn) {
            const currentTheme = localStorage.getItem('theme');
            if (currentTheme === 'light') {
                body.classList.add('light-mode');
                toggleThemeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                toggleThemeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }

            toggleThemeBtn.addEventListener('click', () => {
                body.classList.toggle('light-mode');
                let theme = 'dark';
                if (body.classList.contains('light-mode')) {
                    theme = 'light';
                    toggleThemeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
                } else {
                    toggleThemeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                }
                localStorage.setItem('theme', theme);
            });
        }
    } catch (e) {
        console.error("Theme toggle error: ", e);
    }

    // --- Steam Carousel Logic (Lazy Load) ---
    try {
        const carousels = document.querySelectorAll('.steam-carousel');
        console.log("Found carousels: ", carousels.length);
        
        carousels.forEach((carousel, index) => {
            const mainImg = carousel.querySelector('.main-image');
            const mainVid = carousel.querySelector('.main-video');
            const thumbnails = carousel.querySelectorAll('.thumbnail-item');
            
            console.log(`Carousel ${index}: found ${thumbnails.length} thumbnails`);

            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', (e) => {
                    console.log("Thumbnail clicked: ", thumb.getAttribute('data-src'));
                    
                    // Bỏ class active ở tất cả thumbnail
                    thumbnails.forEach(t => t.classList.remove('active'));
                    // Thêm class active cho thumbnail vừa click
                    thumb.classList.add('active');

                    const type = thumb.getAttribute('data-type');
                    const src = thumb.getAttribute('data-src');

                    if (type === 'image') {
                        // Dừng video nếu đang chạy
                        try {
                            if (!mainVid.paused) {
                                mainVid.pause();
                            }
                            mainVid.removeAttribute('src'); 
                            mainVid.load();
                        } catch (err) {
                            console.warn("Video pause error: ", err);
                        }
                        
                        mainVid.classList.remove('active');
                        
                        // Hiển thị ảnh
                        mainImg.src = src;
                        mainImg.classList.add('active');
                        
                    } else if (type === 'video') {
                        // Ẩn ảnh
                        mainImg.classList.remove('active');
                        
                        // Gán source và phát video
                        mainVid.src = src;
                        mainVid.classList.add('active');
                        mainVid.play().catch(err => {
                            console.log("Autoplay prevented or video load error: ", err);
                        });
                    }
                });
            });
        });
    } catch (e) {
        console.error("Carousel logic error: ", e);
    }
});
