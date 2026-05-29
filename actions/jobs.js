"use server"

import axios from "axios";
import * as cheerio from "cheerio";
import { generateAIInsights } from "./dashboard";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getJobs() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
        include: {
            industryInsight: true,
        },
    })

    if (!user) {
        const jobsData = await linkedinJobs(buildURILinkedin());

        console.log(jobsData);

        return jobsData;
    }

    let industryInsight = user.industryInsight;
    console.log(industryInsight);
    try {
        if (!industryInsight) {
            const insights = await generateAIInsights(user.industry);

            industryInsight = await db.industryInsight.create({
                data: {
                    industry: user.industry,
                    ...insights,
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            });
        }

        const jobsData = await linkedinJobs(buildURILinkedin({ keywords: industryInsight.jobSearchKeywords }));

        console.log(jobsData);

        return jobsData;


    } catch (error) {
        console.error("Error get industry insights: ", error.message);
        throw new Error("Failed to get industry insights");
    }
}

export async function getJob({ url }) {
    if (!url) {
        throw new Error("Job URL is required");
    }

    const decodedUrl = decodeURIComponent(url);

    const hostname = new URL(decodedUrl).hostname.toLowerCase();

    const providers = [
        {
            match: "linkedin.com",
            handler: getLinkedInJob,
        },
    ];

    const provider = providers.find((p) =>
        hostname.includes(p.match)
    );

    if (!provider) {
        throw new Error(`Unsupported job source: ${hostname}`);
    }

    return await provider.handler(decodedUrl);
}

async function getLinkedInJob(url) {
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        return extractLinkedInJob({ html, url });

    } catch (error) {
        console.error(
            "LinkedIn fetch failed:",
            error.message
        );

        return [];
    }
}


async function linkedinJobs(url) {
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        return extractJobsFromLinkedInHTML(html);

    } catch (error) {
        console.error(
            "LinkedIn fetch failed:",
            error.message
        );

        return [];
    }
}

function buildURILinkedin({ seconds = 0, keywords = [], location = "india", experienceLevel = "", remote = "", jobType = "", easyApply = "" }) {

    let url = "https://www.linkedin.com/jobs/search/?"

    if (seconds != 0) {
        url += `f_TPR=r${seconds}`
    } else {
        url += `f_TPR=r86400`
    }

    const encodedKeyword = buildLinkedInKeywords(keywords);

    if (encodedKeyword != "") {
        url += `&keywords=${encodedKeyword}`
    }

    if (location != "") {
        location = location.split(" ").join("%20");
        url += `&location=${location}`;
    }

    if (experienceLevel !== "") {
        // Transform experience levels to LinkedIn codes
        // Internship -> 1, Entry level -> 2, Associate -> 3
        // Mid-Senior level -> 4, Director -> 5, Executive -> 6
        const transformedExperiences = experienceLevel
            .split(",")
            .map((exp) => {
                switch (exp.trim()) {
                    case "Internship": return "1";
                    case "Entry level": return "2";
                    case "Associate": return "3";
                    case "Mid-Senior level": return "4";
                    case "Director": return "5";
                    case "Executive": return "6";
                    default: return "";
                }
            })
            .filter(Boolean);
        url += `&f_E=${transformedExperiences.join(",")}`;
    }

    if (remote != "") {
        // Transform remote options to LinkedIn codes
        // On-Site -> 1, Remote -> 2, Hybrid -> 3
        const transformedRemote = remote
            .split(",")
            .map((e) => {
                switch (e.trim()) {
                    case "Remote": return "2";
                    case "Hybrid": return "3";
                    case "On-Site": return "1";
                    default: return "";
                }
            })
            .filter(Boolean);
        url += `&f_WT=${transformedRemote.join(",")}`;
    }

    if (jobType != "") {
        // Transform job types to LinkedIn codes
        // Full-time -> F, Part-time -> P, Contract -> C, etc.
        const transformedJobType = jobType
            .split(",")
            .map((type) => type.trim().charAt(0).toUpperCase());
        url += `&f_JT=${transformedJobType.join(",")}`;
    }

    if (easyApply != "") {
        url += "&f_AL=true";
    }

    return url;

}

function buildLinkedInKeywords(keywords = []) {
    if (!Array.isArray(keywords) || keywords.length === 0) {
        return "";
    }

    return encodeURIComponent(
        keywords
            .filter(Boolean)
            .map(keyword => `"${keyword.trim()}"`)
            .join(" OR ")
    );
}

function extractLinkedInJob({ html, url }) {
    const $ = cheerio.load(html);

    const title = $("h1.top-card-layout__title")
        .first()
        .text()
        .trim();

    const company =
        $(".topcard__org-name-link").first().text().trim() ||
        $(".topcard__flavor a").first().text().trim() ||
        "";

    const location = $(".topcard__flavor--bullet")
        .first()
        .text()
        .trim();

    const description = $(".show-more-less-html__markup")
        .first()
        .html()
        ?.trim() || "";

    // Extract job ID from LinkedIn URL
    const jobIdMatch = url.match(/jobs\/view\/.*?-(\d+)/);

    const externalJobId = jobIdMatch?.[1] || "";

    const companyLogo =
        $(".top-card-layout img.artdeco-entity-image")
            .first()
            .attr("data-delayed-url") ||

        $(".top-card-layout img.artdeco-entity-image")
            .first()
            .attr("src") ||

        $('meta[property="og:image"]').attr("content") ||

        "";


    let applyLink = "";

    // Look for external URLs
    $("a").each((_, element) => {
        const href = $(element).attr("href");

        if (
            href &&
            !href.includes("linkedin.com") &&
            (
                href.startsWith("http") ||
                href.startsWith("//")
            )
        ) {
            applyLink = href.startsWith("//")
                ? `https:${href}`
                : href;

            return false;
        }
    });

    return {
        externalJobId,
        source: "linkedin",
        title,
        company,
        location,
        description,
        applyLink: applyLink || url,
        companyLogo,
    };
}


function extractJobsFromLinkedInHTML(html) {
    const $ = cheerio.load(html);

    const jobs = [];

    $(".jobs-search__results-list li").each((_, element) => {
        const card = $(element);

        const title = card
            .find(".base-search-card__title")
            .text()
            .trim();

        const company = card
            .find(".base-search-card__subtitle")
            .text()
            .trim();

        const location = card
            .find(".job-search-card__location")
            .text()
            .trim();

        const postedText = card
            .find("time")
            .text()
            .trim();

        const postedAt =
            card.find("time").attr("datetime") || "";

        const jobUrl =
            card
                .find(".base-card__full-link")
                .attr("href") || "";

        const companyLogo =
            card
                .find(".search-entity-media img")
                .attr("data-delayed-url") ||
            card
                .find(".search-entity-media img")
                .attr("src") ||
            "";

        const hiringStatus = card
            .find(".job-posting-benefits__text")
            .text()
            .trim();

        const idMatch =
            jobUrl.match(/jobs\/view\/.*?-(\d+)/);

        const id = idMatch?.[1] || null;

        if (!title) return;

        jobs.push({
            id,
            title,
            company,
            location,
            postedAt,
            postedText,
            jobUrl,
            companyLogo,
            hiringStatus,
            source: "linkedin",
        });
    });

    return jobs;
}