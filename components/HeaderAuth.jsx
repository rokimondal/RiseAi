"use client"

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import { Button } from './ui/button'

const HeaderAuth = () => {
    return (
        <>
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
        </>
    )
}

export default HeaderAuth