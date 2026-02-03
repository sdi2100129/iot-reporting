import bg from "../assets/layered-steps-haikei.svg";

export default function Home() {
  return (
    <div className="z-0 relative w-screen left-1/2 -ml-[50vw] min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-center text-white overflow-hidden">

      {/* Background SVG */}
      <img
        src={bg}
        alt="Background pattern"
        className="absolute inset-0 items-center w-full h-full -z-10 object-cover pointer-events-none"
      />

      {/* Content */}
      <h1 className="text-center font-bold mx-auto items-center mb-6 mt-4 z-10 justify-center">
        Sensor Management Platform
      </h1>

      <p className="text-center mx-auto text-lg z-10 justify-center">
        Monitor, manage and analyze your IoT sensors in one powerful dashboard.
        Built for performance, clarity and real-time control.
      </p> 

    </div>
  );
}
