import Image from "next/image";

interface LandingPageSnapshotProps {
  hideBuddy?: boolean;
}

export function LandingPageSnapshot({ hideBuddy = false }: LandingPageSnapshotProps) {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-sm min-h-[600px]:max-w-md sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <Image
          src="/solacheck/LogoSolaCheck.png"
          alt="Sola Check Logo"
          width={700}
          height={700}
          className="w-full h-auto"
          priority
          unoptimized
        />
      </div>

      {!hideBuddy && (
        <div className="fixed bottom-1 left-1 md:bottom-6 md:left-6 z-30">
          <Image
            src="/solacheck/SolaWinkend.png"
            alt="Sola Chat Buddy"
            width={200}
            height={200}
            className="w-32 min-[375px]:w-36 sm:w-40 md:w-48 lg:w-52 xl:w-52 h-auto"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
