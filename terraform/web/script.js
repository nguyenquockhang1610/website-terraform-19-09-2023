document.addEventListener('DOMContentLoaded', function () {
    // Các video và nguồn dữ liệu tương ứng
    const videos = [
        {
            name: "Đôi mình- Chuột",
            sources: {
                "360p": "/assets/438caf30-7ae0-429f-b5be-11a98e477f9c/HLS/doi-minh_360.m3u8",
                "540p": "/assets/438caf30-7ae0-429f-b5be-11a98e477f9c/HLS/doi-minh_540.m3u8",
                "720p": "/assets/438caf30-7ae0-429f-b5be-11a98e477f9c/HLS/doi-minh_720.m3u8"
            }
        },
        {
            name: "Đừng yêu người nổi tiếng",
            sources: {
                "360p": "/assets/cb05d7bc-22c3-4c3d-b839-325d4f3e8ddf/HLS/dung-yeu-nguoi-noi-tieng_360.m3u8",
                "540p": "/assets/cb05d7bc-22c3-4c3d-b839-325d4f3e8ddf/HLS/dung-yeu-nguoi-noi-tieng_540.m3u8",
                "720p": "/assets/cb05d7bc-22c3-4c3d-b839-325d4f3e8ddf/HLS/dung-yeu-nguoi-noi-tieng_720.m3u8"
            }
        },
        {
            name: "Em dạo này có- Ngọt",
            sources: {
                "360p": "/assets/b9a257e7-b95b-4d90-8cc8-a7d2272f5568/HLS/em-dao-nay-co-ngot_360.m3u8",
                "540p": "/assets/b9a257e7-b95b-4d90-8cc8-a7d2272f5568/HLS/em-dao-nay-co-ngot_540.m3u8",
                "720p": "/assets/b9a257e7-b95b-4d90-8cc8-a7d2272f5568/HLS/em-dao-nay-co-ngot_720.m3u8"
            }
        },
        {
            name: "Doremon",
            sources: {
                "360p": "/assets/0d659b1f-a0dd-4812-824e-51de07290265/HLS/doremon_360.m3u8",
                "540p": "/assets/0d659b1f-a0dd-4812-824e-51de07290265/HLS/doremon_540.m3u8",
                "720p": "/assets/0d659b1f-a0dd-4812-824e-51de07290265/HLS/doremon_720.m3u8"
            }
        }
    ];
    

        // Địa chỉ CloudFront của bạn
        const cloudfrontUrl = "https://d1495vskcu582k.cloudfront.net";
        
        let videoPlayer = document.getElementById("videoPlayer");
        let currentVideo = null;
        let hls = null;
        let currentIndex = 0;
    
        const playPauseButton = document.getElementById("playPauseButton");
        const previousButton = document.getElementById("previousButton");
        const nextButton = document.getElementById("nextButton");
        const qualitySelector = document.getElementById("qualitySelector");
        const shareButton = document.getElementById("shareButton");
    
        // Tạo player video
        function createVideoPlayer(video) {
            if (hls) {
                hls.destroy();
                hls = null;
            }
    
            videoPlayer.innerHTML = "";
    
            const videoList = buildVideoList();
            videoPlayer.appendChild(videoList);
    
            const newVideo = document.createElement("video");
            newVideo.controls = true;
    
            qualitySelector.innerHTML = buildQualityOptions(video);
            qualitySelector.addEventListener("change", function () {
                const selectedQuality = this.value;
                const selectedSource = video.sources[selectedQuality];
                playVideo(selectedSource);
            });
    
            videoPlayer.appendChild(newVideo);
    
            currentVideo = newVideo;
            currentIndex = videos.indexOf(video);
    
            const defaultQuality = Object.keys(video.sources)[0];
            const defaultSource = video.sources[defaultQuality];
            playVideo(defaultSource);
        }
    
        // Tạo danh sách video
        function buildVideoList() {
            const videoList = document.createElement("ul");
            videoList.className = "videoList";
    
            videos.forEach(function (video, index) {
                const listItem = document.createElement("li");
                listItem.textContent = video.name;
    
                listItem.addEventListener("click", function () {
                    createVideoPlayer(video);
                });
    
                if (index === currentIndex) {
                    listItem.className = "active";
                }
    
                videoList.appendChild(listItem);
            });
    
            return videoList;
        }
    
        // Tạo tùy chọn chất lượng video
        function buildQualityOptions(video) {
            let optionsHtml = "";
    
            for (let quality in video.sources) {
                optionsHtml += `<option value="${quality}">${quality}</option>`;
            }
    
            return optionsHtml;
        }
    
        // Phát video
        function playVideo(source) {
            if (Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(cloudfrontUrl + source);
                hls.attachMedia(currentVideo);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    currentVideo.play();
                });
            } else if (currentVideo.canPlayType("application/vnd.apple.mpegurl")) {
                currentVideo.src = cloudfrontUrl + source;
                currentVideo.addEventListener("loadedmetadata", function () {
                    currentVideo.play();
                });
            }
        }
    
        // Các sự kiện nút điều khiển video
        playPauseButton.addEventListener("click", function () {
            if (currentVideo.paused) {
                currentVideo.play();
                playPauseButton.textContent = "Pause";
            } else {
                currentVideo.pause();
                playPauseButton.textContent = "Play";
            }
        });
    
        previousButton.addEventListener("click", function () {
            if (currentIndex > 0) {
                createVideoPlayer(videos[currentIndex - 1]);
            }
        });
    
        nextButton.addEventListener("click", function () {
            if (currentIndex < videos.length - 1) {
                createVideoPlayer(videos[currentIndex + 1]);
            }
        });
    
        shareButton.addEventListener("click", function () {
            const currentVideoName = videos[currentIndex].name;
            const shareUrl = "https://Facebook.com/video?id=" + currentVideoName;
            
            // Gọi hàm chia sẻ mạng xã hội (ví dụ: Facebook)
            shareOnFacebook(shareUrl);
        });
    
        // Mở trình chiếu với video đầu tiên trong danh sách
        createVideoPlayer(videos[0]);
    });
    