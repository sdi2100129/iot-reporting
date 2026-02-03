import { Mail, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800">
      {/* This inner div ensures consistent padding and width regardless of page content */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
        <div>© {new Date().getFullYear()} SensorHub — All rights reserved</div>

        <div className="flex gap-4">
          <a href="https://github.com/aorfanoudaki" target="_blank"><Github /></a>
          <a href="https://www.linkedin.com/in/anastasia-orfanoudaki-a39021330/" target="_blank"><Linkedin /></a>
          <a href="mailto:avorfanoudaki@gmail.com"><Mail /></a>
        </div>
      </div>
    </footer>
  );
}
