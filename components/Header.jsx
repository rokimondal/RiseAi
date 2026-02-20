import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { BookOpenText, ChartSpline, ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { checkUser } from '@/lib/checkUser'
import { ModeToggle } from './ModeToggle'
import HeaderAuth from './HeaderAuth'

const Header = async () => {

    await checkUser();
    return (
        <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60 print:hidden'>
            <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
                <Link href={"/"}>
                    <div className="relative w-24 h-8 overflow-hidden py-1 m-1">
                        <Image
                            src="/logo.png"
                            alt="RiseAI Logo"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 200px"
                            priority
                        />
                    </div>
                </Link>

                <div className='flex lg:space-x-2 ml-2'>
                    <ModeToggle />

                    <SignedIn>

                        <Link href={"/dashboard"}>
                            <Button variant={"ghost"} className="hover:cursor-pointer">
                                <LayoutDashboard className='h-4 w-4' />
                                <span className='hidden md:block'>Industry Insights</span>
                            </Button>
                        </Link>

                        <Link href={"/performance"}>
                            <Button variant={"ghost"} className="hover:cursor-pointer">
                                <ChartSpline className='h-4 w-4' />
                                <span className='hidden md:block'>Performance</span>
                            </Button>
                        </Link>

                    </SignedIn>
                    <Link href={"/preparation"}>
                        <Button variant={"ghost"} className="hover:cursor-pointer">
                            <BookOpenText className='h-4 w-4' />
                            <span className='hidden md:block'>Preparation</span>
                        </Button>
                    </Link>

                    <Link href={"/growth-tools"}>
                        <Button variant={"ghost"} className="hover:cursor-pointer mr-1">
                            <StarsIcon className='h-4 w-4' />
                            <span className='hidden md:block'>Growth Tools</span>
                        </Button>
                    </Link>

                    <HeaderAuth />
                </div>
            </nav>

        </header>
    )
}

export default Header