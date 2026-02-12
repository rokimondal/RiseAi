import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { BookOpenText, ChartSpline, ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { checkUser } from '@/lib/checkUser'
import { ModeToggle } from './ModeToggle'

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

                        {/* <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <StarsIcon className='h-4 w-4' />
                                    <span className='hidden md:block'>Growth Tools</span>
                                    <ChevronDown className='h-4 w-4' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent >
                                <DropdownMenuItem>
                                    <Link href={"/resume"} className='flex items-center gap-2 w-full '>

                                        <FileText className='h-4 w-4' />
                                        <span className='block md:block'>Build Resume</span>

                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href={"/ai-cover-letter"} className='flex items-center gap-2'>

                                        <PenBox className='h-4 w-4' />
                                        <span className='block'>Cover Letter</span>

                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href={"/performance"} className='flex items-center gap-2'>
                                        <GraduationCap className='h-4 w-4' />
                                        <span className='block'>Performance</span>

                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu> */}
                    </SignedIn>

                    <SignedOut
                        mode="modal"
                        fallbackRedirectUrl="/dashboard"
                    >
                        <SignInButton>
                            <Button variant={"outline"} className="ml-2"> Sign In</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 ", // forces width & height
                                    userButtonPopoverCard: "shadow-xl",
                                    userPreviewMainIdentifier: "font-semibold"
                                }
                            }}
                            fallbackRedirectUrl='/'
                            className="ml-2"
                        />
                    </SignedIn>
                </div>
            </nav>

        </header>
    )
}

export default Header