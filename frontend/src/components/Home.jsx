import bg from "../assets/layered-steps-haikei.svg";

export default function Home() {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-[calc(100vh-5rem)] text-black px-6 text-center overflow-hidden">
    
    {/* Background SVG */}
    <img 
        src={bg} 
        alt="Background pattern" 
        className="absolute inset-0 w-full h-full object-cover -z-10 animate-bg"
    />

    <h1 className="text-5xl md:text-6xl font-bold mb-6 mt-4">
        Sensor Management Platform
    </h1>

    <p className="text-slate-400 max-w-2xl text-lg">
        Monitor, manage and analyze your IoT sensors in one powerful dashboard.
        Built for performance, clarity and real-time control.
    </p>
    </div>
  )
}
