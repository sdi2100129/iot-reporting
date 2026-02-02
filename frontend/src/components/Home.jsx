import bg from "../assets/layered-steps-haikei.svg";

export default function Home() {
  return (
    <div className="relative z-0 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex flex-col justify-center items-center min-h-[calc(100vh-5rem)] pt-px text-white px-6 text-center overflow-hidden">

      {/* Background SVG */}
      <img
        src={bg}
        alt="Background pattern"
        className="absolute inset-0 w-full h-full -z-10 object-cover pointer-events-none"
      />

      {/* Content */}
      <h1 className="text-5xl md:text-6xl font-bold mb-6 mt-4 z-10">
        Sensor Management Platform
      </h1>

      <p className="text-white max-w-2xl text-lg z-10">
        Monitor, manage and analyze your IoT sensors in one powerful dashboard.
        Built for performance, clarity and real-time control.
      </p>
    </div>
  );
}
