const API_URL = "https://api.freeapi.app/api/v1/public/youtube/videos";
const videoGrid = document.getElementById("video-grid");
const errorContainer = document.getElementById("error-container");

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatDuration(duration) {
    if (!duration) return "0:00";

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";

    const hours = Number.parseInt(match[1], 10) || 0;
    const minutes = Number.parseInt(match[2], 10) || 0;
    const seconds = Number.parseInt(match[3], 10) || 0;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatViews(views) {
    const count = Number.parseInt(views, 10);
    if (Number.isNaN(count)) return "0 views";

    if (count >= 1000000000) return `${(count / 1000000000).toFixed(1).replace(/\.0$/, "")}B views`;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K views`;

    return `${count} views`;
}

function formatTimeAgo(dateString) {
    if (!dateString) return "";

    const publishedDate = new Date(dateString);
    if (Number.isNaN(publishedDate.getTime())) return "";

    const seconds = Math.max(0, Math.floor((Date.now() - publishedDate.getTime()) / 1000));
    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 }
    ];

    for (const interval of intervals) {
        const value = Math.floor(seconds / interval.seconds);
        if (value >= 1) {
            return `${value} ${interval.label}${value > 1 ? "s" : ""} ago`;
        }
    }

    return "Just now";
}

function normalizeVideos(responseData) {
    const apiVideos = responseData?.data?.data;
    if (!Array.isArray(apiVideos)) return [];

    return apiVideos
        .map((entry) => entry?.items ?? entry)
        .filter((video) => video && typeof video === "object");
}

function renderSkeletons() {
    videoGrid.innerHTML = Array.from({ length: 10 }, () => `
        <div class="flex flex-col gap-3 mb-8 sm:mb-2 cursor-pointer w-full">
            <div class="relative w-full aspect-video rounded-none sm:rounded-xl bg-[#272727] animate-pulse"></div>
            <div class="flex gap-3 px-4 sm:px-0">
                <div class="w-9 h-9 rounded-full bg-[#272727] animate-pulse shrink-0"></div>
                <div class="flex flex-col gap-2 w-full pt-1">
                    <div class="w-[90%] h-4 bg-[#272727] rounded animate-pulse"></div>
                    <div class="w-[60%] h-4 bg-[#272727] rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    `).join("");

    videoGrid.classList.remove("hidden");
    errorContainer.classList.add("hidden");
}

function renderError(message) {
    videoGrid.classList.add("hidden");
    errorContainer.classList.remove("hidden");

    const errorText = errorContainer.querySelector("p");
    if (errorText) {
        errorText.textContent = message || "Something went wrong.";
    }
}

function renderVideos(videos) {
    videoGrid.classList.remove("hidden");
    errorContainer.classList.add("hidden");

    if (!videos.length) {
        videoGrid.innerHTML = '<div class="col-span-full text-center text-yt-muted py-10">No videos found.</div>';
        return;
    }

    const colors = [
        "bg-red-600",
        "bg-blue-600",
        "bg-green-600",
        "bg-yellow-600",
        "bg-purple-600",
        "bg-pink-600",
        "bg-indigo-600"
    ];

    videoGrid.innerHTML = videos.map((video) => {
        const snippet = video.snippet || {};
        const details = video.contentDetails || {};
        const stats = video.statistics || {};
        const thumbnails = snippet.thumbnails || {};

        const thumbnailUrl =
            thumbnails.maxres?.url ||
            thumbnails.standard?.url ||
            thumbnails.high?.url ||
            thumbnails.medium?.url ||
            thumbnails.default?.url ||
            "https://placehold.co/640x360/272727/ffffff?text=No+Image";

        const title = escapeHtml(snippet.title || "Untitled video");
        const channelTitle = escapeHtml(snippet.channelTitle || "Unknown channel");
        const channelInitial = channelTitle.charAt(0).toUpperCase() || "?";
        const duration = formatDuration(details.duration);
        const views = formatViews(stats.viewCount);
        const timeAgo = formatTimeAgo(snippet.publishedAt);
        const metaLine = [views, timeAgo].filter(Boolean).join(" • ");
        const avatarBgColor = colors[channelTitle.length % colors.length];
        const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id || "")}`;

        return `
            <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="flex flex-col gap-3 mb-8 sm:mb-2 cursor-pointer group w-full">
                <div class="relative w-full aspect-video rounded-none sm:rounded-xl overflow-hidden bg-[#272727]">
                    <img src="${thumbnailUrl}" alt="${title}" class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" loading="lazy">
                    <div class="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[12px] font-medium px-1 rounded">
                        ${duration}
                    </div>
                </div>
                <div class="flex gap-3 px-4 sm:px-0">
                    <div class="w-9 h-9 rounded-full ${avatarBgColor} shrink-0 overflow-hidden flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                        ${channelInitial}
                    </div>
                    <div class="flex flex-col overflow-hidden w-full">
                        <h3 class="text-sm font-medium text-yt-text line-clamp-2 leading-tight group-hover:text-white mb-1">
                            ${title}
                        </h3>
                        <div class="text-[13px] text-yt-muted flex flex-col">
                            <span class="hover:text-white transition-colors cursor-pointer w-fit">${channelTitle}</span>
                            <div class="flex items-center mt-0.5">
                                <span>${escapeHtml(metaLine)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }).join("");
}

async function fetchVideos() {
    try {
        renderSkeletons();

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const responseData = await response.json();
        const videos = normalizeVideos(responseData);

        if (!responseData?.success) {
            throw new Error(responseData?.message || "API request failed");
        }

        renderVideos(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        renderError("Videos could not be loaded. If you opened this file directly, run it with Live Server.");
    }
}

window.fetchVideos = fetchVideos;
document.addEventListener("DOMContentLoaded", fetchVideos);
