"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  }

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo(0, 0)
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f5]">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-md w-96"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-6">
          <span className="text-3xl font-extrabold italic text-shadow text-black">Stoxly</span>
        </div>
        <motion.form variants={formVariants} initial="hidden" animate="visible">
          <div className="space-y-4">
            <div>
              <Input type="email" placeholder="Email" className="w-full" />
            </div>
            <div>
              <Input type="password" placeholder="Password" className="w-full" />
            </div>
            {isSignUp && (
              <div>
                <Input type="password" placeholder="Confirm Password" className="w-full" />
              </div>
            )}
            <Button className="w-full bg-slate-200 hover:bg-slate-300 text-gray-800">
              {isSignUp ? "Create Account" : "Sign In to Your Account"}
            </Button>
          </div>
        </motion.form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 text-[#E85D4C] hover:underline focus:outline-none"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
        <div className="mt-6 text-center">
          <Link href="/" onClick={handleHomeClick} className="text-sm text-gray-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

const textShadowStyle = `
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
`

export const styles = textShadowStyle

