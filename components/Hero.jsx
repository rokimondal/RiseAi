"use client"

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

const HeroSection = () => {
    const imageRef = useRef(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const imageElement = imageRef.current;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 100;

            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add("scrolled")
            } else {
                imageElement.classList.remove("scrolled")
            }

        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    }, [])
    return (
        <>
            <section className='w-full pt-36 md:pt-48 pb-10'>
                <div className='space-y-6 text-center'>
                    <div className='space-y-6 mx-auto'>
                        <h1 className='text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title'>
                            Your AI Career Coach for
                            <br />
                            Professional Success
                        </h1>
                        <p className='mx-auto max-w-[600px] text-muted-foreground md:text-xl'>
                            Advance your career with personalized guidance, interview prep, and AI-powered tools for job success.
                        </p>
                    </div>
                    <div className='flex justify-center space-x-4'>
                        <Link href={"/dashboard"}>
                            <Button size="lg" className="px-8">
                                Get Started
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            className="px-8"
                            variant={"outline"}
                            onClick={() => setOpen(true)}
                        >
                            Watch Demo
                        </Button>
                    </div>

                    <div className='hero-image-wrapper mt-5 md:mt-0'>
                        <div className='hero-image' ref={imageRef}>
                            <Image
                                src={"/banner.jpeg"}
                                width={1280}
                                height={720}
                                alt='Banner RiseAi'
                                className='rounded-lg shadow-2xl border mx-auto'
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="!max-w-6xl w-[90vw] p-0 border-0 overflow-hidden bg-black">

                    <div className="aspect-video w-full">
                        {open && (
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/J5AtInGPyBM?autoplay=1&rel=0"
                                title="Demo Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default HeroSection