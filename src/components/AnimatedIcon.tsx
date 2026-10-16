export function AnimatedIcon() {
  return (
    <div className="relative flex items-center justify-center w-[128px] h-[128px]">
      {/* Halo Glow */}
      <div className="absolute w-[201px] h-[201px] flex items-center justify-center pointer-events-none animate-expo-glow">
        <img
          src="/assets/images/logo-glow.png"
          alt="Logo Glow"
          className="w-[201px] h-[201px] object-contain select-none"
        />
      </div>

      {/* Blue Gradient Rounded Container */}
      <div className="absolute w-[128px] h-[128px] animate-expo-bg">
        <div className="expo-logo-background flex items-center justify-center transition-transform hover:scale-105 duration-300">
          {/* Logo icon */}
          <img
            src="/assets/images/expo-logo.png"
            alt="Expo Logo"
            className="w-[76px] h-[71px] object-contain select-none animate-expo-logo"
          />
        </div>
      </div>
    </div>
  );
}
