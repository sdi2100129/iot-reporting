import { Mail, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 px-6 py-4 flex items-center justify-between text-slate-500 text-sm">
      <div>© {new Date().getFullYear()} SensorHub — All rights reserved</div>

      <div className="flex gap-4">
        <a href="https://github.com/aorfanoudaki" target="_blank"><Github /></a>
        <a href="https://www.linkedin.com/in/anastasia-orfanoudaki-a39021330/" target="_blank"><Linkedin /></a>
        <a href="mailto:avorfanoudaki@gmail.com"><Mail /></a>
      </div>
    </footer>
  );
}
