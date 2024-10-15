import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="mb-8">
        <Image
          src="/3dgifmaker84984.gif"
          alt="Logo"
          width={100}
          height={100}
          className="rounded-full"
        />
      </div>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 whitespace-nowrap">
          Transform your images effortlessly
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 whitespace-nowrap">
          with LogoMagic&apos;s AI-powered technology
        </h2>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
          Upload your logo and target image, then let our advanced AI seamlessly integrate them for stunning results. <span className="text-green-500 uppercase">LogoMagic</span> streamlines your branding process, saving time and ensuring professional-looking visuals. Trusted by businesses worldwide, our innovative platform takes the guesswork out of logo placement.
        </p>
        <div className="flex justify-center">
          <Link
            href="/app"
            className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-orange-600 transition-colors"
          >
            Ready To Add My Logo
          </Link>
        </div>
      </div>
    </div>
  )
}
