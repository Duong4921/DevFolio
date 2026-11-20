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
            const mainIframe = carousel.querySelector('.main-iframe');
            const spinner = carousel.querySelector('.loading-spinner');
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
                    
                    // Hiện spinner khi bắt đầu tải
                    if (spinner) spinner.classList.add('active');

                    // Dừng video thường nếu đang chạy
                    try {
                        if (mainVid && !mainVid.paused) {
                            mainVid.pause();
                        }
                        if (mainVid) {
                            mainVid.removeAttribute('src'); 
                            mainVid.load();
                            mainVid.classList.remove('active');
                        }
                    } catch (err) {
                        console.warn("Video pause error: ", err);
                    }

                    // Dừng iframe youtube nếu đang chạy
                    if (mainIframe) {
                        mainIframe.removeAttribute('src');
                        mainIframe.classList.remove('active');
                    }

                    if (type === 'image') {
                        if (mainVid) mainVid.classList.remove('active');
                        if (mainIframe) mainIframe.classList.remove('active');
                        
                        // Hiển thị ảnh
                        if (mainImg) {
                            mainImg.src = src;
                            mainImg.classList.add('active');
                            
                            if (mainImg.complete) {
                                if (spinner) spinner.classList.remove('active');
                            } else {
                                mainImg.onload = () => {
                                    if (spinner) spinner.classList.remove('active');
                                };
                            }
                        }
                        
                    } else if (type === 'video') {
                        if (mainImg) mainImg.classList.remove('active');
                        if (mainIframe) mainIframe.classList.remove('active');
                        
                        if (mainVid) {
                            mainVid.src = src;
                            mainVid.classList.add('active');
                            
                            if (mainVid.readyState >= 3) {
                                if (spinner) spinner.classList.remove('active');
                            } else {
                                mainVid.oncanplay = () => {
                                    if (spinner) spinner.classList.remove('active');
                                };
                            }
                            
                            mainVid.play().catch(err => {
                                console.log("Autoplay prevented or video load error: ", err);
                            });
                        }
                    } else if (type === 'youtube') {
                        if (mainImg) mainImg.classList.remove('active');
                        if (mainVid) mainVid.classList.remove('active');
                        
                        if (mainIframe) {
                            const ytUrl = src.includes('?') ? (src + '&autoplay=1') : (src + '?autoplay=1');
                            mainIframe.src = ytUrl;
                            mainIframe.classList.add('active');
                            mainIframe.onload = () => {
                                if (spinner) spinner.classList.remove('active');
                            };
                        }
                        if (spinner) spinner.classList.remove('active');
                    }

                    // Tự động cuộn thumbnail được chọn vào giữa tầm nhìn
                    try {
                        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } catch (err) {}
                });
            });

            // --- Horizontal Navigation & Controls for Thumbnails ---
            const thumbnailsContainer = carousel.querySelector('.carousel-thumbnails');
            if (thumbnailsContainer) {
                // Đóng gói vào wrapper để định vị các nút mũi tên
                let wrapper = thumbnailsContainer.parentElement;
                if (!wrapper.classList.contains('carousel-thumbnails-wrapper')) {
                    wrapper = document.createElement('div');
                    wrapper.className = 'carousel-thumbnails-wrapper';
                    thumbnailsContainer.parentNode.insertBefore(wrapper, thumbnailsContainer);
                    wrapper.appendChild(thumbnailsContainer);
                }

                // Tạo nút mũi tên chuyển ảnh Trái / Phải
                const prevBtn = document.createElement('button');
                prevBtn.type = 'button';
                prevBtn.className = 'carousel-nav-btn prev';
                prevBtn.setAttribute('aria-label', 'Previous thumbnails');
                prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';

                const nextBtn = document.createElement('button');
                nextBtn.type = 'button';
                nextBtn.className = 'carousel-nav-btn next';
                nextBtn.setAttribute('aria-label', 'Next thumbnails');
                nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

                wrapper.appendChild(prevBtn);
                wrapper.appendChild(nextBtn);

                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    thumbnailsContainer.scrollBy({ left: -260, behavior: 'smooth' });
                });

                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    thumbnailsContainer.scrollBy({ left: 260, behavior: 'smooth' });
                });

                const updateNavVisibility = () => {
                    const maxScroll = thumbnailsContainer.scrollWidth - thumbnailsContainer.clientWidth;
                    if (maxScroll <= 8) {
                        prevBtn.style.display = 'none';
                        nextBtn.style.display = 'none';
                    } else {
                        prevBtn.style.display = thumbnailsContainer.scrollLeft > 10 ? 'flex' : 'none';
                        nextBtn.style.display = thumbnailsContainer.scrollLeft < maxScroll - 10 ? 'flex' : 'none';
                    }
                };

                thumbnailsContainer.addEventListener('scroll', updateNavVisibility, { passive: true });
                window.addEventListener('resize', updateNavVisibility, { passive: true });
                setTimeout(updateNavVisibility, 300);

                // Con lăn chuột (Mouse Wheel): Lăn chuột dọc -> Cuộn ngang danh sách
                thumbnailsContainer.addEventListener('wheel', (e) => {
                    if (e.deltaY !== 0) {
                        e.preventDefault();
                        thumbnailsContainer.scrollLeft += e.deltaY * 1.3;
                    }
                }, { passive: false });

                // Kéo rê chuột (Click & Drag to Scroll)
                let isDown = false;
                let startX = 0;
                let scrollLeftVal = 0;
                let dragged = false;

                thumbnailsContainer.addEventListener('mousedown', (e) => {
                    isDown = true;
                    dragged = false;
                    startX = e.pageX - thumbnailsContainer.offsetLeft;
                    scrollLeftVal = thumbnailsContainer.scrollLeft;
                    thumbnailsContainer.classList.add('is-dragging');
                });

                window.addEventListener('mouseup', () => {
                    if (isDown) {
                        isDown = false;
                        thumbnailsContainer.classList.remove('is-dragging');
                    }
                });

                thumbnailsContainer.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    const x = e.pageX - thumbnailsContainer.offsetLeft;
                    const walk = (x - startX) * 1.4;
                    if (Math.abs(walk) > 4) {
                        dragged = true;
                        e.preventDefault();
                        thumbnailsContainer.scrollLeft = scrollLeftVal - walk;
                    }
                });

                // Chặn click nhầm thumbnail khi đang kéo rê chuột
                thumbnails.forEach(t => {
                    t.addEventListener('click', (e) => {
                        if (dragged) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                        }
                    }, true);
                });
            }
        });
    } catch (e) {
        console.error("Carousel logic error: ", e);

    }



    // --- Interactive Playable Ads Modal Logic ---

    try {

        const modal = document.getElementById('playable-modal');

        if (modal) {

            const iframe = document.getElementById('playable-game-iframe');

            const loader = document.getElementById('game-iframe-loader');

            const closeBtn = document.getElementById('modal-close-btn');

            const viewportToggleBtn = document.getElementById('modal-toggle-viewport');

            const frameWrapper = document.getElementById('game-frame-wrapper');

            const newTabLink = document.getElementById('modal-newtab-link');

            const gameTitleElem = document.getElementById('modal-game-title');

            const variantTabs = document.querySelectorAll('.variant-tab-btn');

            const openButtons = document.querySelectorAll('.open-playable-modal');



            const variants = {

                survival: {

                    src: './assets/playable-ads/adhd_survival_warrior.html',

                    title: 'ADHD SQUAD: Survival Mode (Warrior)'

                },

                defend: {

                    src: './assets/playable-ads/adhd_defend_treasure.html',

                    title: 'ADHD SQUAD: Defend the Treasure'

                },

                spider: {

                    src: './assets/playable-ads/adhd_ranger_spider.html',

                    title: 'ADHD SQUAD: Ranger vs Spider Boss'

                },

                lich: {

                    src: './assets/playable-ads/adhd_ranger_lich.html',

                    title: 'ADHD SQUAD: Ranger vs Lich Boss'

                }

            };



            function loadVariant(key) {

                const varData = variants[key] || variants['survival'];

                

                variantTabs.forEach(t => {

                    if (t.getAttribute('data-variant') === key) {

                        t.classList.add('active');

                    } else {

                        t.classList.remove('active');

                    }

                });



                if (gameTitleElem) gameTitleElem.textContent = varData.title;

                if (newTabLink) newTabLink.href = varData.src;



                if (loader) loader.classList.remove('hidden');

                if (iframe) {

                    iframe.onload = () => {

                        if (loader) loader.classList.add('hidden');

                    };

                    iframe.src = varData.src;

                }

            }



            function openModal(initialVariant = 'survival') {

                modal.classList.add('active');

                modal.setAttribute('aria-hidden', 'false');

                document.body.style.overflow = 'hidden';

                loadVariant(initialVariant);

            }



            function closeModal() {

                modal.classList.remove('active');

                modal.setAttribute('aria-hidden', 'true');

                document.body.style.overflow = '';

                if (iframe) iframe.src = '';

                if (loader) loader.classList.remove('hidden');

            }



            openButtons.forEach(btn => {

                btn.addEventListener('click', (e) => {

                    e.preventDefault();

                    const variantKey = btn.getAttribute('data-variant') || 'survival';

                    openModal(variantKey);

                });

            });



            variantTabs.forEach(tab => {

                tab.addEventListener('click', () => {

                    const variantKey = tab.getAttribute('data-variant');

                    loadVariant(variantKey);

                });

            });



            if (closeBtn) closeBtn.addEventListener('click', closeModal);

            modal.addEventListener('click', (e) => {

                if (e.target === modal) closeModal();

            });

            document.addEventListener('keydown', (e) => {

                if (e.key === 'Escape' && modal.classList.contains('active')) {

                    closeModal();

                }

            });



            if (viewportToggleBtn && frameWrapper) {

                viewportToggleBtn.addEventListener('click', () => {

                    if (frameWrapper.classList.contains('viewport-mobile')) {

                        frameWrapper.classList.remove('viewport-mobile');

                        frameWrapper.classList.add('viewport-landscape');

                        viewportToggleBtn.innerHTML = '<i class="fa-solid fa-desktop"></i> <span class="btn-text">Desktop View</span>';

                    } else {

                        frameWrapper.classList.remove('viewport-landscape');

                        frameWrapper.classList.add('viewport-mobile');

                        viewportToggleBtn.innerHTML = '<i class="fa-solid fa-mobile-screen"></i> <span class="btn-text">Mobile View</span>';

                    }

                });

            }

        }

    } catch (e) {

        console.error('Playable Ads modal error: ', e);

    }

    /* ==========================================================================
       Portfolio Main Showcase Tab Switcher (Game Dev vs QA & Playtest)
       ========================================================================== */
    const portfolioTabBtns = document.querySelectorAll('.portfolio-tab-btn');
    const portfolioTabContents = document.querySelectorAll('.portfolio-tab-content');

    function switchPortfolioTab(targetId) {
        portfolioTabBtns.forEach(b => {
            const isTarget = b.getAttribute('data-target') === targetId;
            b.classList.toggle('active', isTarget);
            b.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        portfolioTabContents.forEach(pane => {
            const isTarget = pane.id === targetId;
            pane.classList.toggle('active', isTarget);
        });
    }

    portfolioTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            switchPortfolioTab(targetId);
        });
    });

    // Hero CTA: di qua he thong slide (motion.js) de ha canh dung slide; fallback la cuon thang
    function goToProjects() {
        setTimeout(() => {
            if (window.SlideNav && window.SlideNav.goToProjects()) return;
            const targetEl = document.getElementById('projects');
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 150);
    }

    // Support Hero buttons & hash navigation
    document.querySelectorAll('a[href="#playtest"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPortfolioTab('qa-playtest-tab');
            goToProjects();
        });
    });

    document.querySelectorAll('a[href="#projects"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPortfolioTab('dev-projects-tab');
            goToProjects();
        });
    });

    if (window.location.hash === '#playtest') {
        switchPortfolioTab('qa-playtest-tab');
    }

    /* ==========================================================================
       Project Details Expandable Toggle (Xem thêm / Rút gọn)
       - Ngăn chặn hoàn toàn việc giật/chớp trang (reload effect)
       - Sử dụng CSS max-height transition mượt mà
       ========================================================================== */
    const expandBtns = document.querySelectorAll('.project-expand-btn');

    expandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const targetId = btn.getAttribute('data-target');
            const targetDrawer = document.getElementById(targetId);
            const labelEl = btn.querySelector('.btn-label');
            const moreText = btn.getAttribute('data-more-text') || 'Xem thêm chi tiết';
            const lessText = btn.getAttribute('data-less-text') || 'Rút gọn';

            if (!targetDrawer) return;

            const isExpanded = targetDrawer.classList.toggle('is-expanded');
            btn.classList.toggle('is-active', isExpanded);

            if (labelEl) {
                labelEl.textContent = isExpanded ? lessText : moreText;
            }
        });
    });

});
